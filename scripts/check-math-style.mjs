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

  const withoutMath = content
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/<MathExpr\b[^>]*\/>/gs, '')
    .replace(/<SvgMathExpr\b[^>]*\/>/gs, '');

  const visibleNodes = [...withoutMath.matchAll(/>([^<>{\n]+)</g)]
    .map((match) => match[1].trim())
    .filter(Boolean);
  const visibleSource = visibleNodes.join(' ');

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

  if (/\b\d+(?:\.\d+)?\s*(?:Hz|kHz|MHz|GHz|µs|μs|ns|ms|dB|dBm|dBm\/Hz)\b/u.test(visibleSource)) {
    report(file, 'bare numeric value with technical unit found. Use MathExpr.');
  }

  if (/\b(?:x|X|Y|H|h|y|s|z|w|I|Q)\([^()<>]{1,24}\)/u.test(visibleSource)) {
    report(file, 'bare function-style math notation found, e.g. x(t) or H(f). Use MathExpr/SvgMathExpr.');
  }

  if (/\b(?:O|E)\s*\([^()<>]{1,24}\)|\bE\s*\[[^\]<>]+\]/u.test(visibleSource)) {
    report(file, 'bare complexity/expectation notation found. Use MathExpr.');
  }

  if (/\([^()<>]{0,6}\b(?:k|l|m|n)\s*,\s*(?:k|l|m|n)\b[^()<>]{0,6}\)/u.test(visibleSource)) {
    report(file, 'bare coordinate/index tuple found. Use MathExpr.');
  }

  for (const node of visibleNodes) {
    const plain = node.replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
    if (/^(?:A|B|G|I|Q|T|X|Y|M|N|a|b|d|f|j|k|l|m|n|t|x|y|z)$/u.test(plain)) {
      report(file, `bare standalone math symbol "${plain}" found. Use MathExpr/SvgMathExpr.`);
      break;
    }
    if (/[₀₁₂₃₄₅₆₇₈₉²³ᵤₛ]/u.test(plain)) {
      report(file, 'raw Unicode subscript/superscript found in visible text. Use TeX via MathExpr.');
      break;
    }
  }
}

if (failed) process.exit(1);
console.log('Math style check passed.');
