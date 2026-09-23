import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const files = [];
const allowed = new Set(['.astro']);

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    else if (allowed.has(extname(path))) files.push(path);
  }
}

walk('src/pages');
walk('src/components');

const legacyClasses = [
  'sampling-equation',
  'sinusoid-formula',
  'sinusoid-shift-equation',
  'complex-equation',
  'complex-mini-formula',
  'euler-equation',
  'rotating-equation',
  'iq-formula-line',
  'iq-main-equation',
  'dft-equation',
  'modulation-mini-equation',
  'rate-equation',
  'rf-main-equation',
  'channel-main-equation',
  'propagation-equation',
  'delay-phase-equation',
  'thermal-equation',
  'evm-equation',
  'multipath-equation',
  'convolution-equation',
  'rms-delay-equation',
  'corr-equation',
  'ofdm-main-equation',
  'ifft-main-equation',
  'cp-frequency-equation',
  'cp-overhead-equation',
  'rb-definition',
  'numerology-main-equation',
];

let failed = false;

for (const file of files) {
  const content = readFileSync(file, 'utf8');

  for (const className of legacyClasses) {
    const regex = new RegExp('class=["\\\'][^"\\\']*\\b' + className + '\\b');
    if (regex.test(content)) {
      failed = true;
      console.error(`${relative('.', file)}: legacy math wrapper "${className}". Use <MathExpr />.`);
    }
  }

  if (/import\s+Math\s+from\s+['"][^'"]*components\/Math\.astro['"]/.test(content)) {
    failed = true;
    console.error(`${relative('.', file)}: do not import the math component as "Math"; use "MathExpr" so JavaScript global Math remains available.`);
  }

  if (/<\/?(?:sub|sup)>/i.test(content)) {
    failed = true;
    console.error(`${relative('.', file)}: raw <sub>/<sup> math markup found. Use <MathExpr />.`);
  }

  if (/[Σ√]/u.test(content)) {
    failed = true;
    console.error(`${relative('.', file)}: raw Σ/√ formula glyph found. Use TeX inside <MathExpr />.`);
  }

  const visibleSource = content
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/\b(?:title|description)="[^"]*"/g, '')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, '')
    .replace(/<MathExpr\b[^>]*\/>/gs, '')
    .replace(/tex=(?:"[^"]*"|'[^']*')/gs, '');

  if (/\bN\s+samples?\b/u.test(visibleSource)) {
    failed = true;
    console.error(`${relative('.', file)}: bare "N sample(s)" found. Render N with <MathExpr />.`);
  }

  if (/(?:^|[^A-Za-z0-9_])(?:x|X|Y|H|h|y|C|r|s)\[[^\]<>]+\]/u.test(visibleSource)) {
    failed = true;
    console.error(`${relative('.', file)}: bare indexed math notation found. Use <MathExpr />.`);
  }

  if (/[Δτθφμσωλπℓ]|[₀₁₂₃₄₅₆₇₈₉ᵤₛ]/u.test(visibleSource)) {
    failed = true;
    console.error(`${relative('.', file)}: bare mathematical Unicode notation found. Use <MathExpr />.`);
  }
}

if (failed) process.exit(1);
console.log('Math style check passed.');
