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

walk('src/pages/hoc');

const legacyClasses = [
  'sampling-equation',
  'sinusoid-formula',
  'sinusoid-shift-equation',
  'complex-equation',
  'complex-mini-formula',
  'euler-equation',
  'rotating-equation',
  'iq-core-equations',
  'iq-formula-line',
  'iq-main-equation',
  'dft-equation',
  'bin-equations',
  'modulation-mini-equation',
  'rate-equation',
  'rf-main-equation',
  'channel-main-equation',
  'propagation-equation',
  'delay-phase-equation',
  'thermal-equation',
  'snr-equations',
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
  'nr-slot-equations',
];

let failed = false;

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  for (const className of legacyClasses) {
    const regex = new RegExp('class=["\\\'][^"\\\']*\\b' + className + '\\b');
    if (regex.test(content)) {
      failed = true;
      console.error(`${relative('.', file)}: legacy math wrapper "${className}". Use <Math />.`);
    }
  }
}

if (failed) process.exit(1);
console.log('Math style check passed.');
