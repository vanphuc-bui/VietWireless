import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const roots = ['src'];
const extraFiles = [];
const allowedExt = new Set(['.astro', '.jsx', '.tsx', '.js', '.ts', '.md']);
const files = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    else if (allowedExt.has(extname(path))) files.push(path);
  }
}

for (const root of roots) walk(root);
files.push(...extraFiles);

const rules = [
  {
    name: 'overly casual first-person',
    regex: /\bmình\b/giu,
    message: 'Use “tôi” for the author voice, or rewrite the sentence neutrally.',
  },
  {
    name: 'em dash',
    regex: /—/g,
    message: 'Do not use em dash. Use a comma, period, colon, parentheses, or rewrite the sentence.',
  },
  {
    name: 'missing space before inline HTML',
    regex: /[\p{L}\p{N}:;,!?)]<(?:strong|em|a)\b/gu,
    message: 'Add a space before inline strong/em/a markup.',
  },
  {
    name: 'missing space after inline HTML',
    regex: /<\/(?:strong|em|a)>[\p{L}\p{N}(]/gu,
    message: 'Add a space after inline strong/em/a markup.',
  },
];

let failed = false;

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const lines = content.split('\n');

  for (const rule of rules) {
    for (let i = 0; i < lines.length; i += 1) {
      rule.regex.lastIndex = 0;
      if (rule.regex.test(lines[i])) {
        failed = true;
        console.error(`${relative('.', file)}:${i + 1}: ${rule.name}: ${rule.message}`);
        console.error(`  ${lines[i].trim()}`);
      }
    }
  }

  const crossLineRules = [
    {
      name: 'missing explicit space before inline HTML across lines',
      regex: /([:\p{L}\p{N}])\n\s*<(?:strong|em|a)\b/gu,
      message: 'Astro may trim this newline. Add an explicit {" "} before the inline element.',
    },
    {
      name: 'missing explicit space after inline HTML across lines',
      regex: /<\/(?:strong|em|a)>\n\s*([\p{L}\p{N}])/gu,
      message: 'Astro may trim this newline. Add an explicit {" "} after the inline element.',
    },
  ];

  for (const rule of crossLineRules) {
    rule.regex.lastIndex = 0;
    let match;
    while ((match = rule.regex.exec(content)) !== null) {
      failed = true;
      const line = content.slice(0, match.index).split('\n').length;
      console.error(`${relative('.', file)}:${line}: ${rule.name}: ${rule.message}`);
    }
  }
}

if (failed) process.exit(1);
console.log('Writing style check passed.');
