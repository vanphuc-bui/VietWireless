import { useMemo, useState } from 'react';
import MathExpr from './MathExpr.jsx';

const N_SC = 12;

function cAdd(a, b) {
  return { re: a.re + b.re, im: a.im + b.im };
}

function cMul(a, b) {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

function cDiv(a, b) {
  const d = b.re * b.re + b.im * b.im || 1e-12;
  return {
    re: (a.re * b.re + a.im * b.im) / d,
    im: (a.im * b.re - a.re * b.im) / d,
  };
}

function cAbs(a) {
  return Math.hypot(a.re, a.im);
}

function cExp(phase) {
  return { re: Math.cos(phase), im: Math.sin(phase) };
}

function cScale(a, scale) {
  return { re: a.re * scale, im: a.im * scale };
}

function lerpComplex(a, b, t) {
  return {
    re: a.re + (b.re - a.re) * t,
    im: a.im + (b.im - a.im) * t,
  };
}

function formatComplex(z) {
  const re = z.re.toFixed(3);
  const im = Math.abs(z.im).toFixed(3);
  return re + (z.im >= 0 ? '+' : '-') + 'j' + im;
}

function pilotSequence(k) {
  const s = 1 / Math.sqrt(2);
  const seq = [
    { re: s, im: s },
    { re: -s, im: s },
    { re: -s, im: -s },
    { re: s, im: -s },
  ];
  return seq[k % seq.length];
}

export default function ChannelEstimationExplorer() {
  const [noise, setNoise] = useState(0.08);
  const [spacing, setSpacing] = useState(4);
  const [echo, setEcho] = useState(0.55);

  const pilotPositions = useMemo(() => {
    const positions = [0];
    for (let k = spacing; k < N_SC - 1; k += spacing) positions.push(k);
    if (positions[positions.length - 1] !== N_SC - 1) positions.push(N_SC - 1);
    return positions;
  }, [spacing]);

  const model = useMemo(() => {
    const trueH = Array.from({ length: N_SC }, (_, k) => {
      const echoPhase = -(0.7 + 2 * Math.PI * 3 * k / 16);
      return cAdd({ re: 1, im: 0 }, cScale(cExp(echoPhase), echo));
    });

    const pilotSet = new Set(pilotPositions);
    const ls = new Map();

    for (const k of pilotPositions) {
      const x = pilotSequence(k);
      const noisePhase = 0.4 + 0.9 * k;
      const w = cScale(cExp(noisePhase), noise);
      const y = cAdd(cMul(trueH[k], x), w);
      ls.set(k, cDiv(y, x));
    }

    const estimated = Array.from({ length: N_SC }, (_, k) => {
      if (pilotSet.has(k)) return ls.get(k);

      let left = pilotPositions[0];
      let right = pilotPositions[pilotPositions.length - 1];
      for (let i = 0; i < pilotPositions.length - 1; i += 1) {
        if (pilotPositions[i] <= k && k <= pilotPositions[i + 1]) {
          left = pilotPositions[i];
          right = pilotPositions[i + 1];
          break;
        }
      }

      const alpha = right === left ? 0 : (k - left) / (right - left);
      return lerpComplex(ls.get(left), ls.get(right), alpha);
    });

    const mse = estimated.reduce((sum, hHat, k) => {
      const error = { re: hHat.re - trueH[k].re, im: hHat.im - trueH[k].im };
      return sum + error.re * error.re + error.im * error.im;
    }, 0) / N_SC;

    const pilotMse = pilotPositions.reduce((sum, k) => {
      const hHat = ls.get(k);
      const error = { re: hHat.re - trueH[k].re, im: hHat.im - trueH[k].im };
      return sum + error.re * error.re + error.im * error.im;
    }, 0) / pilotPositions.length;

    return { trueH, estimated, mse, pilotMse, pilotSet };
  }, [noise, echo, pilotPositions]);

  const width = 520;
  const height = 190;
  const left = 34;
  const right = 18;
  const top = 18;
  const bottom = 34;
  const maxMag = 1.7;

  const xOf = (k) => left + k * (width - left - right) / (N_SC - 1);
  const yOf = (mag) => top + (maxMag - Math.min(maxMag, mag)) * (height - top - bottom) / maxMag;

  const truePoints = model.trueH.map((h, k) => [xOf(k), yOf(cAbs(h))].join(',')).join(' ');
  const estPoints = model.estimated.map((h, k) => [xOf(k), yOf(cAbs(h))].join(',')).join(' ');

  const inspectK = 5;
  const trueInspect = model.trueH[inspectK];
  const estInspect = model.estimated[inspectK];

  return (
    <div className="channel-estimation-lab">
      <div className="channel-estimation-controls">
        <label>
          <span>Biên độ noise <strong>{noise.toFixed(2)}</strong></span>
          <input
            type="range"
            min="0"
            max="0.25"
            step="0.01"
            value={noise}
            onChange={(event) => setNoise(Number(event.target.value))}
          />
        </label>

        <label>
          <span>Khoảng cách pilot <strong>{spacing} subcarrier</strong></span>
          <input
            type="range"
            min="2"
            max="6"
            step="1"
            value={spacing}
            onChange={(event) => setSpacing(Number(event.target.value))}
          />
        </label>

        <label>
          <span>Độ mạnh echo <strong>{echo.toFixed(2)}</strong></span>
          <input
            type="range"
            min="0"
            max="0.8"
            step="0.05"
            value={echo}
            onChange={(event) => setEcho(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="channel-estimation-readout metric-card-grid">
        <div className="metric-card">
          <small className="metric-card-label">SỐ DM-RS</small>
          <strong className="metric-card-value">{pilotPositions.length}</strong>
          <span className="metric-card-formula">trên 12 subcarrier minh họa</span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">LS MSE TẠI PILOT</small>
          <strong className="metric-card-value">{model.pilotMse.toFixed(4)}</strong>
          <span className="metric-card-formula">noise đi thẳng vào estimate</span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">MSE SAU INTERPOLATION</small>
          <strong className="metric-card-value">{model.mse.toFixed(4)}</strong>
          <span className="metric-card-formula">pilot noise + interpolation error</span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">SUBCARRIER</small>
          <strong className="metric-card-value"><MathExpr tex={String.raw`|\widehat H[5]|`} /> = {cAbs(estInspect).toFixed(3)}</strong>
          <span className="metric-card-formula">true magnitude {cAbs(trueInspect).toFixed(3)}</span>
        </div>
      </div>

      <div className="channel-estimation-grid-strip" aria-label="DM-RS và data positions trên 12 subcarrier">
        {Array.from({ length: N_SC }, (_, k) => (
          <div key={k} className={model.pilotSet.has(k) ? 'pilot' : 'data'}>
            <small>k={k}</small>
            <strong>{model.pilotSet.has(k) ? 'DM-RS' : 'DATA'}</strong>
          </div>
        ))}
      </div>

      <div className="channel-estimation-chart">
        <div className="visual-caption">
          <span>CHANNEL THẬT vs ESTIMATE</span>
          <strong>Magnitude theo subcarrier</strong>
        </div>

        <svg viewBox="0 0 520 190" role="img" aria-label="So sánh độ lớn channel thật và channel estimate trên 12 subcarrier">
          {[0, 0.5, 1.0, 1.5].map((value) => (
            <g key={value}>
              <line
                className="ce-gridline"
                x1={left}
                x2={width - right}
                y1={yOf(value)}
                y2={yOf(value)}
              />
              <text className="ce-axis-label" x="4" y={yOf(value) + 4}>{value.toFixed(1)}</text>
            </g>
          ))}

          {Array.from({ length: N_SC }, (_, k) => (
            <text key={k} className="ce-axis-label" x={xOf(k) - 4} y={height - 8}>{k}</text>
          ))}

          <polyline className="ce-true-line" points={truePoints} />
          <polyline className="ce-est-line" points={estPoints} />

          {pilotPositions.map((k) => (
            <circle
              key={k}
              className="ce-pilot-point"
              cx={xOf(k)}
              cy={yOf(cAbs(model.estimated[k]))}
              r="4.5"
            />
          ))}
        </svg>

        <div className="channel-estimation-legend">
          <span><i className="true"></i>channel thật <MathExpr tex="|H[k]|" /></span>
          <span><i className="estimate"></i>estimate <MathExpr tex={String.raw`|\widehat H[k]|`} /></span>
          <span><i className="pilot"></i>DM-RS sample</span>
        </div>
      </div>

      <div className="channel-estimation-inspect">
        <div>
          <small>CHANNEL THẬT</small>
          <strong><MathExpr tex={'H[5]=' + formatComplex(trueInspect)} /></strong>
        </div>
        <b>→</b>
        <div>
          <small>CHANNEL ESTIMATE</small>
          <strong><MathExpr tex={'\\widehat H[5]=' + formatComplex(estInspect)} /></strong>
        </div>
      </div>

      <p className="channel-estimation-lab-note">
        Đây là mô hình minh họa: channel gồm direct path + một echo, DM-RS positions được đặt đều để dễ quan sát,
        LS được tính tại pilot và nội suy tuyến tính trực tiếp trên complex channel.
        Đây không phải mapping DM-RS cụ thể của một cấu hình 3GPP.
      </p>
    </div>
  );
}
