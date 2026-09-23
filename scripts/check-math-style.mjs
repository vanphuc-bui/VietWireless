import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const files = [];
const allowed = new Set(['.astro', '.jsx', '.tsx']);

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

function report(file, message) {
  failed = true;
  console.error(`${relative('.', file)}: ${message}`);
}

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const extension = extname(file);

  for (const className of legacyClasses) {
    const regex = new RegExp('class(?:Name)?=["\\\'][^"\\\']*\\b' + className + '\\b');
    if (regex.test(content)) {
      report(file, `legacy math wrapper "${className}". Use MathExpr.`);
    }
  }

  if (/import\s+Math\s+from\s+['"][^'"]*(?:Math\.astro|MathExpr\.jsx)['"]/.test(content)) {
    report(file, 'do not import the math component as "Math"; use "MathExpr" so JavaScript global Math remains available.');
  }

  if (/<\/?(?:sub|sup)>/i.test(content)) {
    report(file, 'raw <sub>/<sup> math markup found. Use MathExpr.');
  }

  if (/[Σ√]/u.test(content)) {
    report(file, 'raw Σ/√ formula glyph found. Use TeX inside MathExpr.');
  }

  let visibleSource = '';

  if (extension === '.astro') {
    visibleSource = content
      .replace(/^---[\s\S]*?---/m, '')
      .replace(/\b(?:title|description|aria-label)="[^"]*"/g, '')
      .replace(/<svg\b[\s\S]*?<\/svg>/gi, '')
      .replace(/<MathExpr\b[^>]*\/>/gs, '')
      .replace(/tex=(?:"[^"]*"|'[^']*')/gs, '');
  } else {
    const withoutMath = content
      .replace(/<MathExpr\b[^>]*\/>/gs, '')
      .replace(/<SvgMathExpr\b[^>]*\/>/gs, '');
    visibleSource = [...withoutMath.matchAll(/>([^<>{\n]+)</g)]
      .map((match) => match[1])
      .join(' ');
  }

  if (/\bN\s+samples?\b/u.test(visibleSource)) {
    report(file, 'bare "N sample(s)" found. Render N with MathExpr.');
  }

  if (/(?:^|[^A-Za-z0-9_])(?:x|X|Y|H|h|y|C|r|s)\[[^\]<>]+\]/u.test(visibleSource)) {
    report(file, 'bare indexed math notation found. Use MathExpr.');
  }

  if (/\bI\s*(?:\/|và|,|hoặc)\s*Q\b/u.test(visibleSource)) {
    report(file, 'bare I/Q notation found in visible content. Use MathExpr.');
  }

  if (/[Δτθφμσωλπℓ]|[₀₁₂₃₄₅₆₇₈₉ᵤₛ]/u.test(visibleSource)) {
    report(file, 'bare mathematical Unicode notation found. Use MathExpr.');
  }

  if (/\b(?:k|n|t|f|N|A|I|Q)\s*=\s*(?:[-+]?\d|$)/u.test(visibleSource)) {
    report(file, 'bare scalar equation found in visible content. Use MathExpr.');
  }

  if (/\b\d+(?:\.\d+)?\s*(?:Hz|kHz|MHz|GHz|µs|ms|dB|dBm)\b/u.test(visibleSource)) {
    report(file, 'bare numeric value with technical unit found. Use MathExpr.');
  }
}

if (failed) process.exit(1);
console.log('Math style check passed.');
