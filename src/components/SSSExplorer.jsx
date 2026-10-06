import { useMemo, useState } from 'react';
import MathExpr from './MathExpr.jsx';

const LENGTH = 127;
const TRUE_NID2 = 1;

function add(a, b) {
  return { re: a.re + b.re, im: a.im + b.im };
}

function mul(a, b) {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

function abs2(a) {
  return a.re * a.re + a.im * a.im;
}

function abs(a) {
  return Math.sqrt(abs2(a));
}

function scale(a, s) {
  return { re: a.re * s, im: a.im * s };
}

function expj(phase) {
  return { re: Math.cos(phase), im: Math.sin(phase) };
}

function generateMSequence(tapOffset) {
  const x = Array.from({ length: LENGTH }, () => 0);
  x[0] = 1;

  Array.from({ length: LENGTH - 7 }, (_, i) => i).forEach((i) => {
    x[i + 7] = (x[i + tapOffset] + x[i]) % 2;
  });

  return x;
}

const X0 = generateMSequence(4);
const X1 = generateMSequence(1);

function sssSequence(nid1, nid2) {
  const q = Math.floor(nid1 / 112);
  const r = nid1 % 112;
  const m0 = 15 * q + 5 * nid2;
  const m1 = r;

  const values = Array.from({ length: LENGTH }, (_, n) => {
    const a = 1 - 2 * X0[(n + m0) % LENGTH];
    const b = 1 - 2 * X1[(n + m1) % LENGTH];
    return a * b;
  });

  return { values, q, r, m0, m1 };
}

function deterministicNoise(index, amplitude) {
  const a = expj(0.73 * index + 0.41);
  const b = expj(1.61 * index + 1.07);
  return scale(add(a, scale(b, 0.48)), amplitude / 1.48);
}

function normalizedMetric(received, reference) {
  const sum = reference.reduce(
    (acc, value, n) => add(
      acc,
      mul(received[n], { re: value, im: 0 }),
    ),
    { re: 0, im: 0 },
  );

  const rxEnergy = received.reduce((acc, value) => acc + abs2(value), 0);
  const refEnergy = reference.reduce((acc, value) => acc + value * value, 0);
  const denom = Math.sqrt(rxEnergy * refEnergy) || 1;
  return abs(sum) / denom;
}

export default function SSSExplorer() {
  const [trueNid1, setTrueNid1] = useState(123);
  const [assumedNid2, setAssumedNid2] = useState(TRUE_NID2);
  const [noise, setNoise] = useState(0.28);

  const result = useMemo(() => {
    const truth = sssSequence(trueNid1, TRUE_NID2);
    const channel = scale(expj(0.62), 0.85);

    const received = truth.values.map((value, n) => (
      add(
        mul(channel, { re: value, im: 0 }),
        deterministicNoise(n, noise),
      )
    ));

    const candidates = Array.from({ length: 336 }, (_, nid1) => {
      const candidate = sssSequence(nid1, assumedNid2);
      return {
        nid1,
        metric: normalizedMetric(received, candidate.values),
      };
    });

    const ranked = [...candidates].sort((a, b) => b.metric - a.metric);
    const winner = ranked[0];

    return {
      truth,
      candidates,
      ranked,
      winner,
      detectedPci: 3 * winner.nid1 + assumedNid2,
      truePci: 3 * trueNid1 + TRUE_NID2,
      correct: winner.nid1 === trueNid1 && assumedNid2 === TRUE_NID2,
    };
  }, [trueNid1, assumedNid2, noise]);

  const width = 760;
  const height = 260;
  const left = 42;
  const right = 18;
  const top = 18;
  const bottom = 42;

  const xOf = (nid1) => left + nid1 * (width - left - right) / 335;
  const yOf = (value) => top + (1 - Math.min(1, value)) * (height - top - bottom);
  const points = result.candidates
    .map((item) => xOf(item.nid1) + ',' + yOf(item.metric))
    .join(' ');

  return (
    <div className="sss-explorer">
      <div className="sss-explorer-controls">
        <label>
          <span>Cell đang phát <strong><MathExpr tex={'N_{ID}^{(1)}=' + trueNid1} /></strong></span>
          <input
            type="range"
            min="0"
            max="335"
            step="1"
            value={trueNid1}
            onChange={(event) => setTrueNid1(Number(event.target.value))}
          />
        </label>

        <label>
          <span>Kết quả PSS mà UE dùng <strong><MathExpr tex={'N_{ID}^{(2)}=' + assumedNid2} /></strong></span>
          <select value={assumedNid2} onChange={(event) => setAssumedNid2(Number(event.target.value))}>
            <option value="0">0</option>
            <option value="1">1 · đúng trong lab</option>
            <option value="2">2</option>
          </select>
        </label>

        <label>
          <span>Noise amplitude <strong>{noise.toFixed(2)}</strong></span>
          <input
            type="range"
            min="0"
            max="0.9"
            step="0.02"
            value={noise}
            onChange={(event) => setNoise(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="sss-explorer-readout metric-card-grid">
        <div className="metric-card">
          <small className="metric-card-label">DECOMPOSE</small>
          <strong className="metric-card-value">
            <MathExpr tex={'q=' + result.truth.q + ',\\ r=' + result.truth.r} />
          </strong>
          <span className="metric-card-formula"><MathExpr tex={String.raw`N_{ID}^{(1)}=112q+r`} /></span>
        </div>

        <div className="metric-card">
          <small className="metric-card-label">SSS SHIFTS</small>
          <strong className="metric-card-value">
            <MathExpr tex={'m_0=' + result.truth.m0 + ',\\ m_1=' + result.truth.m1} />
          </strong>
          <span className="metric-card-formula">true sequence trong lab</span>
        </div>

        <div className="metric-card">
          <small className="metric-card-label">DETECTED</small>
          <strong className="metric-card-value">
            <MathExpr tex={'\\widehat N_{ID}^{(1)}=' + result.winner.nid1} />
          </strong>
          <span className="metric-card-formula">peak {result.winner.metric.toFixed(3)}</span>
        </div>

        <div className="metric-card">
          <small className="metric-card-label">PCI</small>
          <strong className="metric-card-value">{result.detectedPci}</strong>
          <span className="metric-card-formula">true PCI {result.truePci}</span>
        </div>
      </div>

      <div className={'sss-result-banner ' + (result.correct ? 'correct' : 'wrong')}>
        <strong>{result.correct ? 'Đúng identity' : 'Identity hypothesis sai'}</strong>
        <span>
          {assumedNid2 === TRUE_NID2
            ? 'PSS hypothesis đúng, SSS search có chứa sequence thật.'
            : 'PSS hypothesis sai, 336 SSS candidates đang được sinh từ sai N_ID^(2).'}
        </span>
      </div>

      <div className="sss-search-chart">
        <div className="visual-caption">
          <span>336 SSS HYPOTHESES</span>
          <strong>Normalized correlation magnitude</strong>
        </div>

        <svg viewBox="0 0 760 260" role="img" aria-label="Correlation metric theo 336 SSS hypotheses">
          {[0, 0.25, 0.5, 0.75, 1].map((value) => (
            <g key={value}>
              <line
                className="sss-gridline"
                x1={left}
                x2={width - right}
                y1={yOf(value)}
                y2={yOf(value)}
              />
              <text className="sss-axis-label" x="3" y={yOf(value) + 4}>{value.toFixed(2)}</text>
            </g>
          ))}

          {[0, 56, 112, 168, 224, 280, 335].map((nid1) => (
            <text key={nid1} className="sss-axis-label" x={xOf(nid1) - 7} y={height - 10}>{nid1}</text>
          ))}

          <polyline className="sss-metric-line" points={points} />

          <line
            className="sss-true-id"
            x1={xOf(trueNid1)}
            x2={xOf(trueNid1)}
            y1={top}
            y2={height - bottom}
          />

          <line
            className="sss-detected-id"
            x1={xOf(result.winner.nid1)}
            x2={xOf(result.winner.nid1)}
            y1={top}
            y2={height - bottom}
          />
        </svg>

        <div className="sss-search-legend">
          <span><i className="metric"></i>correlation metric</span>
          <span><i className="true"></i>true <MathExpr tex={String.raw`N_{ID}^{(1)}`} /></span>
          <span><i className="detected"></i>detected candidate</span>
        </div>
      </div>

      <div className="sss-top-candidates">
        {result.ranked.slice(0, 5).map((item, index) => (
          <div key={item.nid1} className={index === 0 ? 'winner' : ''}>
            <small>RANK {index + 1}</small>
            <strong><MathExpr tex={'N_{ID}^{(1)}=' + item.nid1} /></strong>
            <span>metric {item.metric.toFixed(3)}</span>
          </div>
        ))}
      </div>

      <p className="sss-explorer-note">
        Lab giả định timing SSS đã đủ tốt để extract 127 RE, channel gần như một common complex gain trên SSS span và receiver search toàn bộ 336
        <MathExpr tex={String.raw`N_{ID}^{(1)}`} /> candidates bằng correlation magnitude.
        Đây là controlled example để cô lập identity search; receiver thật còn phải xử lý frequency selectivity, residual timing/frequency error, noise statistics và candidate management.
      </p>
    </div>
  );
}
