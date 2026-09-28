import { useMemo, useState } from 'react';
import MathExpr, { SvgMathExpr } from './MathExpr.jsx';

const W = 760;
const H = 240;
const LEFT = 38;
const RIGHT = 18;
const TOP = 20;
const BOTTOM = 34;
const SAMPLE_RATE = 64;
const N = 64;

function makeSignal(f1, f2, phaseDeg) {
  const phase = (phaseDeg * Math.PI) / 180;
  return Array.from({ length: N }, (_, n) => {
    const t = n / SAMPLE_RATE;
    return Math.cos(2 * Math.PI * f1 * t)
      + 0.7 * Math.cos(2 * Math.PI * f2 * t + phase);
  });
}

function linePath(samples) {
  const maxAbs = 1.8;
  return samples.map((value, n) => {
    const x = LEFT + (n / (N - 1)) * (W - LEFT - RIGHT);
    const y = H / 2 - (value / maxAbs) * 82;
    return (n === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2);
  }).join(' ');
}

function dft(samples) {
  return Array.from({ length: N }, (_, k) => {
    let re = 0;
    let im = 0;
    for (let n = 0; n < N; n += 1) {
      const angle = -2 * Math.PI * k * n / N;
      re += samples[n] * Math.cos(angle);
      im += samples[n] * Math.sin(angle);
    }
    return { k, re, im, magnitude: Math.hypot(re, im) / N, phase: Math.atan2(im, re) };
  });
}

function phaseDeg(value) {
  return value * 180 / Math.PI;
}

export default function TimeFrequencyExplorer() {
  const [f1, setF1] = useState(5);
  const [f2, setF2] = useState(12);
  const [phase, setPhase] = useState(0);

  const samples = useMemo(() => makeSignal(f1, f2, phase), [f1, f2, phase]);
  const spectrum = useMemo(() => dft(samples), [samples]);
  const path = useMemo(() => linePath(samples), [samples]);

  const bins = spectrum.slice(0, N / 2 + 1);
  const maxMag = Math.max(...bins.map((bin) => bin.magnitude), 1e-9);
  const tone1 = spectrum[f1];
  const tone2 = spectrum[f2];

  return (
    <div className="time-frequency-lab">
      <div className="time-frequency-controls">
        <label>
          <span>Tone 1 <strong><MathExpr tex={f1 + '\\,\\mathrm{Hz}'} /></strong></span>
          <input type="range" min="2" max="9" step="1" value={f1} onChange={(event) => setF1(Number(event.target.value))} />
        </label>

        <label>
          <span>Tone 2 <strong><MathExpr tex={f2 + '\\,\\mathrm{Hz}'} /></strong></span>
          <input type="range" min="10" max="20" step="1" value={f2} onChange={(event) => setF2(Number(event.target.value))} />
        </label>

        <label>
          <span>Phase tone 2 <strong><MathExpr tex={'\\phi_2=' + phase + '^\\circ'} /></strong></span>
          <input type="range" min="-180" max="180" step="15" value={phase} onChange={(event) => setPhase(Number(event.target.value))} />
        </label>
      </div>

      <div className="time-frequency-readout metric-card-grid">
        <div className="metric-card">
          <small className="metric-card-label">RECORD</small>
          <strong className="metric-card-value"><MathExpr tex="N=64" /></strong>
          <span className="metric-card-formula"><MathExpr tex={String.raw`f_s=64\,\mathrm{Hz}`} /></span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">TONE 1 MAGNITUDE</small>
          <strong className="metric-card-value"><MathExpr tex={tone1.magnitude.toFixed(2)} /></strong>
          <span className="metric-card-formula"><MathExpr tex={'k=' + f1} /></span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">TONE 2 MAGNITUDE</small>
          <strong className="metric-card-value"><MathExpr tex={tone2.magnitude.toFixed(2)} /></strong>
          <span className="metric-card-formula"><MathExpr tex={'k=' + f2} /></span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">TONE 2 DFT PHASE</small>
          <strong className="metric-card-value"><MathExpr tex={phaseDeg(tone2.phase).toFixed(0) + '^\\circ'} /></strong>
          <span className="metric-card-formula">phase changes while magnitude stays nearly fixed</span>
        </div>
      </div>

      <div className="time-frequency-panels">
        <section>
          <div className="visual-caption">
            <span>TIME DOMAIN</span>
            <strong>sample values across the record</strong>
          </div>
          <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label="Hai tone cộng lại trong time domain">
            <line className="tf-axis" x1={LEFT} y1={H / 2} x2={W - RIGHT} y2={H / 2} />
            <line className="tf-axis" x1={LEFT} y1={TOP} x2={LEFT} y2={H - BOTTOM} />
            <path className="tf-wave" d={path} />
            {samples.map((value, n) => {
              const x = LEFT + (n / (N - 1)) * (W - LEFT - RIGHT);
              const y = H / 2 - (value / 1.8) * 82;
              return <circle key={n} className="tf-sample" cx={x} cy={y} r="2.2" />;
            })}
            <SvgMathExpr tex="n" x={W - 45} y={H - 18} width={22} />
            <SvgMathExpr tex="x[n]" x={LEFT + 6} y={TOP + 2} width={48} />
          </svg>
          <p>Đổi phase tone 2 và quan sát waveform tổng thay đổi ngay cả khi hai tone vẫn có cùng magnitude.</p>
        </section>

        <section>
          <div className="visual-caption">
            <span>DFT COEFFICIENTS</span>
            <strong>magnitude by bin, phase carried inside each complex coefficient</strong>
          </div>
          <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label="Magnitude của DFT coefficients">
            <line className="tf-axis" x1={LEFT} y1={H - BOTTOM} x2={W - RIGHT} y2={H - BOTTOM} />
            <line className="tf-axis" x1={LEFT} y1={TOP} x2={LEFT} y2={H - BOTTOM} />
            {bins.map((bin) => {
              const x = LEFT + (bin.k / (N / 2)) * (W - LEFT - RIGHT);
              const height = (bin.magnitude / maxMag) * 145;
              const active = bin.k === f1 || bin.k === f2;
              return (
                <g key={bin.k}>
                  <line className={active ? 'tf-bin active' : 'tf-bin'} x1={x} y1={H - BOTTOM} x2={x} y2={H - BOTTOM - height} />
                  {active && <circle className="tf-bin-dot" cx={x} cy={H - BOTTOM - height} r="4.5" />}
                </g>
              );
            })}
            <SvgMathExpr tex="k" x={W - 45} y={H - 18} width={22} />
            <SvgMathExpr tex="|X[k]|" x={LEFT + 6} y={TOP + 2} width={62} />
          </svg>

          <div className="tf-coefficient-strip">
            <span>
              <small>TONE 1</small>
              <strong><MathExpr tex={'X[' + f1 + ']'} /></strong>
              <em><MathExpr tex={String.raw`|X|\approx0.50`} /></em>
              <em><MathExpr tex={phaseDeg(tone1.phase).toFixed(0) + '^\\circ'} /></em>
            </span>
            <span>
              <small>TONE 2</small>
              <strong><MathExpr tex={'X[' + f2 + ']'} /></strong>
              <em><MathExpr tex={String.raw`|X|\approx0.35`} /></em>
              <em><MathExpr tex={phaseDeg(tone2.phase).toFixed(0) + '^\\circ'} /></em>
            </span>
          </div>
        </section>
      </div>

      <p className="time-frequency-caption">
        Hai peaks nói frequency nào có mặt. Nhưng để reconstruct đúng waveform, coefficient còn phải giữ phase.
        Kéo phase tone 2: magnitude bars hầu như không đổi, còn time-domain waveform thay đổi rõ.
      </p>
    </div>
  );
}
