import { useMemo, useState } from 'react';
import MathExpr from './MathExpr.jsx';

const NFFT = 256;
const PSS_LEN = 127;
const TRUE_LAG = 28;
const SEARCH_LAGS = 64;

function add(a, b) {
  return { re: a.re + b.re, im: a.im + b.im };
}

function mul(a, b) {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

function conj(a) {
  return { re: a.re, im: -a.im };
}

function scale(a, s) {
  return { re: a.re * s, im: a.im * s };
}

function abs2(a) {
  return a.re * a.re + a.im * a.im;
}

function abs(a) {
  return Math.sqrt(abs2(a));
}

function expj(phase) {
  return { re: Math.cos(phase), im: Math.sin(phase) };
}

function baseMSequence() {
  const x = Array.from({ length: PSS_LEN }, () => 0);
  [0, 1, 1, 0, 1, 1, 1].forEach((value, index) => {
    x[index] = value;
  });

  Array.from({ length: PSS_LEN - 7 }, (_, offset) => offset).forEach((i) => {
    x[i + 7] = (x[i + 4] + x[i]) % 2;
  });

  return x;
}

const BASE_M = baseMSequence();

function pssSequence(nid2) {
  return Array.from({ length: PSS_LEN }, (_, n) => {
    const m = (n + 43 * nid2) % PSS_LEN;
    return 1 - 2 * BASE_M[m];
  });
}

function pssTimeTemplate(nid2) {
  const freq = Array.from({ length: NFFT }, () => ({ re: 0, im: 0 }));
  const seq = pssSequence(nid2);

  seq.forEach((value, n) => {
    const signed = n - 63;
    const bin = (signed + NFFT) % NFFT;
    freq[bin] = { re: value, im: 0 };
  });

  const time = Array.from({ length: NFFT }, (_, sample) => (
    freq.reduce((sum, value, bin) => (
      add(sum, mul(value, expj(2 * Math.PI * bin * sample / NFFT)))
    ), { re: 0, im: 0 })
  ));

  const energy = time.reduce((sum, value) => sum + abs2(value), 0);
  const norm = Math.sqrt(energy) || 1;
  return time.map((value) => scale(value, 1 / norm));
}

const TEMPLATES = [0, 1, 2].map((nid2) => pssTimeTemplate(nid2));

function deterministicNoise(index, amplitude) {
  const a = expj(0.91 * index + 0.37);
  const b = expj(1.73 * index + 1.11);
  return scale(add(a, scale(b, 0.55)), amplitude / 1.55);
}

function correlationAt(received, template, lag) {
  const segment = template.map((_, n) => received[lag + n]);
  const numerator = segment.reduce(
    (sum, value, n) => add(sum, mul(value, conj(template[n]))),
    { re: 0, im: 0 },
  );
  const rxEnergy = segment.reduce((sum, value) => sum + abs2(value), 0);
  const refEnergy = template.reduce((sum, value) => sum + abs2(value), 0);
  const denom = Math.sqrt(rxEnergy * refEnergy) || 1;
  return abs(numerator) / denom;
}

export default function PSSExplorer() {
  const [trueNid2, setTrueNid2] = useState(1);
  const [noise, setNoise] = useState(0.06);
  const [cfo, setCfo] = useState(0.08);

  const result = useMemo(() => {
    const trueTemplate = TEMPLATES[trueNid2];
    const totalLength = NFFT + SEARCH_LAGS;

    const received = Array.from({ length: totalLength }, (_, index) => {
      const local = index - TRUE_LAG;
      const inside = local === Math.max(0, Math.min(NFFT - 1, local));
      const signal = inside ? trueTemplate[local] : { re: 0, im: 0 };
      const rotated = mul(signal, expj(2 * Math.PI * cfo * index / NFFT));
      return add(rotated, deterministicNoise(index, noise));
    });

    const metrics = [0, 1, 2].map((nid2) => {
      const values = Array.from(
        { length: SEARCH_LAGS },
        (_, lag) => correlationAt(received, TEMPLATES[nid2], lag),
      );
      const peakValue = Math.max(...values);
      const peakLag = values.indexOf(peakValue);
      return { nid2, values, peakValue, peakLag };
    });

    const winner = metrics.reduce(
      (best, current) => current.peakValue > best.peakValue ? current : best,
      metrics[0],
    );

    return { metrics, winner };
  }, [trueNid2, noise, cfo]);

  const width = 700;
  const height = 250;
  const left = 38;
  const right = 18;
  const top = 18;
  const bottom = 38;
  const xOf = (lag) => left + lag * (width - left - right) / (SEARCH_LAGS - 1);
  const yOf = (value) => top + (1 - Math.min(1, value)) * (height - top - bottom);
  const points = (values) => values.map((value, lag) => xOf(lag) + ',' + yOf(value)).join(' ');

  return (
    <div className="pss-explorer">
      <div className="pss-explorer-controls">
        <label>
          <span>Sequence đang phát <strong><MathExpr tex={'N_{ID}^{(2)}=' + trueNid2} /></strong></span>
          <select value={trueNid2} onChange={(event) => setTrueNid2(Number(event.target.value))}>
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
        </label>

        <label>
          <span>Noise amplitude <strong>{noise.toFixed(2)}</strong></span>
          <input
            type="range"
            min="0"
            max="0.20"
            step="0.01"
            value={noise}
            onChange={(event) => setNoise(Number(event.target.value))}
          />
        </label>

        <label>
          <span>Normalized CFO <strong>{cfo.toFixed(2)}</strong></span>
          <input
            type="range"
            min="0"
            max="0.50"
            step="0.01"
            value={cfo}
            onChange={(event) => setCfo(Number(event.target.value))}
          />
          <small><MathExpr tex={String.raw`\epsilon=\Delta f_{\mathrm{CFO}}/\Delta f_{\mathrm{SCS}}`} /></small>
        </label>
      </div>

      <div className="pss-explorer-readout metric-card-grid">
        <div className="metric-card">
          <small className="metric-card-label">TRUE TIMING</small>
          <strong className="metric-card-value"><MathExpr tex={String.raw`n_0=28`} /></strong>
          <span className="metric-card-formula">sample index trong lab</span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">DETECTED TIMING</small>
          <strong className="metric-card-value"><MathExpr tex={'\\widehat n_0=' + result.winner.peakLag} /></strong>
          <span className="metric-card-formula">lag của peak lớn nhất</span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">DETECTED PSS</small>
          <strong className="metric-card-value"><MathExpr tex={'\\widehat N_{ID}^{(2)}=' + result.winner.nid2} /></strong>
          <span className="metric-card-formula">hypothesis thắng</span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">PEAK METRIC</small>
          <strong className="metric-card-value">{result.winner.peakValue.toFixed(3)}</strong>
          <span className="metric-card-formula">normalized correlation</span>
        </div>
      </div>

      <div className="pss-correlation-chart">
        <div className="visual-caption">
          <span>3 PSS HYPOTHESES × NHIỀU CANDIDATE LAGS</span>
          <strong>Normalized correlation magnitude</strong>
        </div>

        <svg viewBox="0 0 700 250" role="img" aria-label="Correlation metric theo candidate timing cho ba PSS hypotheses">
          {[0, 0.25, 0.5, 0.75, 1].map((value) => (
            <g key={value}>
              <line
                className="pss-gridline"
                x1={left}
                x2={width - right}
                y1={yOf(value)}
                y2={yOf(value)}
              />
              <text className="pss-axis-label" x="3" y={yOf(value) + 4}>{value.toFixed(2)}</text>
            </g>
          ))}

          {[0, 8, 16, 24, 32, 40, 48, 56, 63].map((lag) => (
            <text key={lag} className="pss-axis-label" x={xOf(lag) - 5} y={height - 10}>{lag}</text>
          ))}

          <line
            className="pss-true-lag"
            x1={xOf(TRUE_LAG)}
            x2={xOf(TRUE_LAG)}
            y1={top}
            y2={height - bottom}
          />

          <polyline className="pss-hypothesis pss-h0" points={points(result.metrics[0].values)} />
          <polyline className="pss-hypothesis pss-h1" points={points(result.metrics[1].values)} />
          <polyline className="pss-hypothesis pss-h2" points={points(result.metrics[2].values)} />
        </svg>

        <div className="pss-correlation-legend">
          <span><i className="h0"></i><MathExpr tex={String.raw`N_{ID}^{(2)}=0`} /></span>
          <span><i className="h1"></i><MathExpr tex={String.raw`N_{ID}^{(2)}=1`} /></span>
          <span><i className="h2"></i><MathExpr tex={String.raw`N_{ID}^{(2)}=2`} /></span>
          <span><i className="timing"></i>true timing</span>
        </div>
      </div>

      <div className="pss-hypothesis-table">
        {result.metrics.map((item) => (
          <div key={item.nid2} className={item.nid2 === result.winner.nid2 ? 'winner' : ''}>
            <small>HYPOTHESIS</small>
            <strong><MathExpr tex={'N_{ID}^{(2)}=' + item.nid2} /></strong>
            <span>peak {item.peakValue.toFixed(3)} · lag {item.peakLag}</span>
          </div>
        ))}
      </div>

      <p className="pss-explorer-note">
        Lab tạo một PSS-only OFDM template với <MathExpr tex={String.raw`N_{\mathrm{FFT}}=256`} />,
        chèn nó vào sample buffer tại một timing đã biết, thêm deterministic noise và normalized CFO rồi chạy sliding normalized correlation với cả ba PSS hypotheses.
        Đây là receiver minh họa, không phải algorithm bắt buộc của 3GPP và không mô phỏng đầy đủ CP, multipath, SSB power scaling hay RF impairments.
      </p>
    </div>
  );
}
