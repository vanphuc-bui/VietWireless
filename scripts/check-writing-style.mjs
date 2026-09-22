import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const roots = ['src', 'docs'];
const extraFiles = ['README.md'];
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
}

if (failed) process.exit(1);
console.log('Writing style check passed.');
