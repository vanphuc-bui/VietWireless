import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { curriculum, lessons } from '../src/data/curriculum.js';

let failed = false;

function fail(message) {
  failed = true;
  console.error(`Lesson contract: ${message}`);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^$()|[\]\\]/g, '\\$&');
}

const numbers = lessons.map((lesson) => lesson.number);
const expectedNumbers = Array.from({ length: 66 }, (_, index) => index + 1);

if (curriculum.length !== 8) fail(`expected 8 parts, found ${curriculum.length}.`);
if (JSON.stringify(numbers) !== JSON.stringify(expectedNumbers)) {
  fail('lesson numbers must be contiguous from 1 through 66 in src/data/curriculum.js.');
}

const slugs = new Set();
for (const lesson of lessons) {
  if (slugs.has(lesson.slug)) fail(`duplicate slug "${lesson.slug}".`);
  slugs.add(lesson.slug);
  if (!['published', 'planned'].includes(lesson.status)) {
    fail(`lesson ${lesson.number} has invalid status "${lesson.status}".`);
  }
}

const lessonDir = 'src/pages/hoc';
const lessonFiles = readdirSync(lessonDir)
  .filter((name) => name.endsWith('.astro') && name !== 'index.astro');

const registeredSlugs = new Set(lessons.map((lesson) => lesson.slug));

for (const file of lessonFiles) {
  const slug = basename(file, '.astro');
  if (!registeredSlugs.has(slug)) {
    fail(`unregistered lesson page ${join(lessonDir, file)}. Add it to src/data/curriculum.js first.`);
  }
}

for (const lesson of lessons) {
  const path = join(lessonDir, `${lesson.slug}.astro`);
  const exists = existsSync(path);

  if (lesson.status === 'published' && !exists) {
    fail(`lesson ${lesson.number} is marked published but ${path} does not exist.`);
  }

  if (lesson.status === 'planned' && exists) {
    fail(`lesson ${lesson.number} has a page but is still marked planned. Change its registry status to published before merge.`);
  }

  if (!exists) continue;

  const content = readFileSync(path, 'utf8');

  // Presentation contract: lesson pages must consume shared typography/layout,
  // not invent page-specific font stacks or font sizes inline.
  if (/style\s*=\s*["'][^"']*(?:font-size|font-family)\s*:/iu.test(content)
      || /\b(?:fontSize|fontFamily)\s*:/u.test(content)) {
    fail(`${path} contains page-specific inline typography. Use shared CSS tokens/components instead.`);
  }

  if (lesson.number >= 19) {
    const metaMatch = content.match(/const\s+lessonMeta\s*=\s*\{([\s\S]*?)\};/u);
    if (!metaMatch) {
      fail(`${path} must define const lessonMeta for Part III–VIII lessons.`);
    } else {
      const body = metaMatch[1];
      const number = body.match(/\bnumber\s*:\s*(\d+)/u)?.[1];
      const part = body.match(/\bpart\s*:\s*(\d+)/u)?.[1];
      const slug = body.match(/\bslug\s*:\s*['"]([^'"]+)['"]/u)?.[1];
      const kind = body.match(/\bkind\s*:\s*['"]([^'"]+)['"]/u)?.[1];
      const specRequired = body.match(/\bspecRequired\s*:\s*(true|false)/u)?.[1];

      if (Number(number) !== lesson.number) fail(`${path} lessonMeta.number must be ${lesson.number}.`);
      if (Number(part) !== lesson.part) fail(`${path} lessonMeta.part must be ${lesson.part}.`);
      if (slug !== lesson.slug) fail(`${path} lessonMeta.slug must be "${lesson.slug}".`);
      if (kind !== lesson.kind) fail(`${path} lessonMeta.kind must be "${lesson.kind}".`);
      if (String(lesson.specRequired === true) !== specRequired) {
        fail(`${path} lessonMeta.specRequired must be ${lesson.specRequired === true}.`);
      }
    }

    const requiredRoles = ['problem', 'system-context', 'example', 'boundary', 'implementation', 'recap'];
    for (const role of requiredRoles) {
      const regex = new RegExp(`data-lesson-role=["']${escapeRegex(role)}["']`, 'u');
      if (!regex.test(content)) fail(`${path} is missing data-lesson-role="${role}".`);
    }

    if (!/data-lesson-visual(?:\s|=|>)/u.test(content)) {
      fail(`${path} must contain at least one data-lesson-visual block.`);
    }

    if (lesson.specRequired) {
      if (!/data-lesson-role=["']specification["']/u.test(content)) {
        fail(`${path} is specRequired but has no specification role.`);
      }
      if (!/3GPP/u.test(content) || !/TS\s+38\.\d{3}/u.test(content) || !/Release\s+\d+/u.test(content)) {
        fail(`${path} must identify 3GPP, a TS 38.xxx document and a Release in its specification layer.`);
      }
    }

    if (!/data-lesson-nav=["']map["']/u.test(content)) {
      fail(`${path} must include data-lesson-nav="map".`);
    }
    if (lesson.number > 1 && !/data-lesson-nav=["']previous["']/u.test(content)) {
      fail(`${path} must include data-lesson-nav="previous".`);
    }
    if (lesson.number < 66 && !/data-lesson-nav=["']next["']/u.test(content)) {
      fail(`${path} must include data-lesson-nav="next".`);
    }
  }
}

const curriculumDoc = readFileSync('docs/CURRICULUM.md', 'utf8');
for (const part of curriculum) {
  if (!curriculumDoc.includes(part.title)) {
    fail(`docs/CURRICULUM.md is missing canonical part title "${part.title}".`);
  }
  for (const lesson of part.lessons) {
    if (!curriculumDoc.includes(lesson.title)) {
      fail(`docs/CURRICULUM.md is missing lesson ${lesson.number}: "${lesson.title}".`);
    }
  }
}

const mapPage = readFileSync('src/pages/hoc/index.astro', 'utf8');
const homePage = readFileSync('src/pages/index.astro', 'utf8');

for (const part of curriculum) {
  const anchorRegex = new RegExp(`id=["']${escapeRegex(part.anchor)}["']`, 'u');
  if (!anchorRegex.test(mapPage)) fail(`/hoc/ is missing anchor #${part.anchor}.`);

  const title = part.title.toLocaleLowerCase('vi');
  if (!mapPage.toLocaleLowerCase('vi').includes(title)) {
    fail(`/hoc/ is missing canonical part title "${part.title}".`);
  }
  if (!homePage.toLocaleLowerCase('vi').includes(title)) {
    fail(`homepage learning map is missing canonical part title "${part.title}".`);
  }
}

for (const lesson of lessons.filter((item) => item.status === 'published')) {
  const href = `/hoc/${lesson.slug}/`;
  if (!mapPage.includes(`href="${href}"`) && !mapPage.includes(`href='${href}'`)) {
    fail(`/hoc/ does not link to published lesson ${lesson.number} at ${href}.`);
  }
}

if (failed) process.exit(1);
console.log('Lesson contract check passed.');
