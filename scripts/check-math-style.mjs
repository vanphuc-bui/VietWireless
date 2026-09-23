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

  const decodedNodes = visibleNodes.map((node) =>
    node.replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim()
  );
  const firstNodeMatch = (regex) => decodedNodes.find((node) => regex.test(node));

  const nBasedMatch = firstNodeMatch(/\bN(?:\s+(?:useful\s+)?)?samples?\b|\bN-(?:point|sample)\b/u);
  if (nBasedMatch) {
    report(file, `bare N-based sample/FFT notation found in "${nBasedMatch}". Render N with MathExpr.`);
  }

  const namedVariableMatch = firstNodeMatch(/\b(?:subcarrier|bin|frequency|sample(?:\s+index)?|time(?:\s+index)?|delay|phase|amplitude|gain)\s+(?:A|G|I|Q|N|f|k|l|m|n|t)(?![\p{L}\p{N}_])/u);
  if (namedVariableMatch) {
    report(file, `bare named mathematical variable found in "${namedVariableMatch}". Use MathExpr.`);
  }

  const trigProductMatch = firstNodeMatch(/\b[IQ]\s*·\s*(?:cos|sin)\b/u);
  if (trigProductMatch) {
    report(file, `plain-text I/Q trigonometric product found in "${trigProductMatch}". Use MathExpr.`);
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
    if (/^(?:G|I|Q|X|Y|N|a|b|d|f|j|k|l|m|n|t|x|y|z)$/u.test(plain)) {
      report(file, `bare standalone math symbol "${plain}" found. Use MathExpr/SvgMathExpr.`);
      break;
    }
    if (/[₀₁₂₃₄₅₆₇₈₉²³ᵤₛ]/u.test(plain)) {
      report(file, 'raw Unicode subscript/superscript found in visible text. Use TeX via MathExpr.');
      break;
    }
  }
}


// CSS safety: descendant span selectors can accidentally style KaTeX's internal spans.
// Content wrappers that may contain MathExpr must target their own direct child spans.
const cssFile = 'src/styles/global.css';
const css = readFileSync(cssFile, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
for (const match of css.matchAll(/([^{}]+)\{/g)) {
  const selectorList = match[1]
    .split(',')
    .map((selector) => selector.trim())
    .filter(Boolean);

  for (const selector of selectorList) {
    if (!/\bspan\b/.test(selector)) continue;
    if (/\.math-inline|\.katex|\.svg-math/.test(selector)) continue;
    if (legacyClasses.some((className) => selector.includes(`.${className}`))) continue;

    const spanTargets = [...selector.matchAll(/\bspan\b/g)];
    const unsafe = spanTargets.some(({ index }) => {
      const prefix = selector.slice(0, index).trimEnd();
      return !prefix.endsWith('>');
    });

    if (unsafe) {
      report(cssFile, `unsafe descendant span selector "${selector}". Use a direct-child selector so KaTeX internals are not restyled.`);
    }
  }
}


// Shared math-card visual system must exist and remain token-driven.
const mathCardTokens = [
  '--lesson-math-card-min-height',
  '--lesson-math-card-padding',
  '--lesson-math-card-gap',
  '--lesson-math-card-label-size',
  '--lesson-math-card-formula-min-height',
  '--lesson-math-card-formula-size',
  '--lesson-math-card-body-size',
  '--lesson-math-card-label-gap',
  '--lesson-math-card-formula-gap',
];

for (const token of mathCardTokens) {
  if (!css.includes(`${token}:`)) {
    report(cssFile, `missing shared math-card token "${token}". Keep math-card sizing centralized.`);
  }
}

const mathCardScaleMarker = '/* --- Unified math-card scale: one visual system across lesson cards --- */';
const mathCardScaleIndex = css.indexOf(mathCardScaleMarker);
if (mathCardScaleIndex < 0) {
  report(cssFile, 'missing unified math-card scale block.');
} else {
  const unifiedMathCardCss = css.slice(mathCardScaleIndex);
  const requiredTokenUsage = [
    [/\.math-card\s*\{[\s\S]*?min-height:\s*var\(--lesson-math-card-min-height\)/, 'math-card min-height'],
    [/\.math-card\s*\{[\s\S]*?padding:\s*var\(--lesson-math-card-padding\)/, 'math-card padding'],
    [/\.math-card \.math-card-formula \.katex\s*\{[\s\S]*?font-size:\s*var\(--lesson-math-card-formula-size\)/, 'math-card formula size'],
    [/\.math-card > p\s*\{[\s\S]*?font-size:\s*var\(--lesson-math-card-body-size\)/, 'math-card body size'],
  ];

  for (const [regex, label] of requiredTokenUsage) {
    if (!regex.test(unifiedMathCardCss)) {
      report(cssFile, `shared ${label} must use the lesson-math-card token.`);
    }
  }

  for (const match of unifiedMathCardCss.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = match[1].trim();
    const body = match[2];
    if (!selector.includes('.math-card')) continue;
    if (/(?:min-height|padding|font-size)\s*:\s*(?!var\(--lesson-math-card)[^;]+)[^;]+;/u.test(body)) {
      report(cssFile, `hard-coded math-card size found in "${selector}". Use --lesson-math-card-* tokens.`);
    }
  }
}

// Do not reintroduce ad-hoc formula cards that bypass the shared math-card system.
for (const file of files) {
  const content = readFileSync(file, 'utf8');
  if (/class(?:Name)?=["'][^"']*explain-card[^"']*["'][\s\S]{0,700}<h[1-6][^>]*>\s*<MathExpr\b/u.test(content)) {
    report(file, 'formula inside explain-card found. Use math-card + math-card-formula for consistent sizing.');
  }
  if (/class(?:Name)?=["'][^"']*perspective[^"']*["'][\s\S]{0,1400}<strong>\s*<MathExpr\b/u.test(content)) {
    report(file, 'formula comparison inside perspective card found. Use shared math-card system.');
  }
}

if (failed) process.exit(1);
console.log('Math style check passed.');
