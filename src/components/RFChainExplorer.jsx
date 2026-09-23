import { useMemo, useState } from 'react';
import MathExpr, { SvgMathExpr } from './MathExpr.jsx';

const W = 760;
const H = 210;
const PAD = 28;

function waveformPath(fn, points = 520) {
  const out = [];
  for (let n = 0; n <= points; n += 1) {
    const t = n / points;
    const x = PAD + t * (W - 2 * PAD);
    const v = fn(t);
    const y = H / 2 - 70 * v;
    out.push(`${n === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return out.join(' ');
}

export default function RFChainExplorer() {
  const [amplitude, setAmplitude] = useState(0.85);
  const [phase, setPhase] = useState(35);
  const [carrierCycles, setCarrierCycles] = useState(8);

  const rad = (phase * Math.PI) / 180;
  const i = amplitude * Math.cos(rad);
  const q = amplitude * Math.sin(rad);

  const iPath = useMemo(
    () => waveformPath((t) => i * Math.cos(2 * Math.PI * carrierCycles * t)),
    [i, carrierCycles]
  );
  const qPath = useMemo(
    () => waveformPath((t) => -q * Math.sin(2 * Math.PI * carrierCycles * t)),
    [q, carrierCycles]
  );
  const rfPath = useMemo(
    () => waveformPath((t) =>
      i * Math.cos(2 * Math.PI * carrierCycles * t) -
      q * Math.sin(2 * Math.PI * carrierCycles * t)
    ),
    [i, q, carrierCycles]
  );

  const cx = 165;
  const cy = 155;
  const scale = 100;
  const px = cx + i * scale;
  const py = cy - q * scale;

  return (
    <div className="rf-chain-lab">
      <div className="rf-chain-controls">
        <label>
          <span>Amplitude <strong><MathExpr tex={`A=${amplitude.toFixed(2)}`} /></strong></span>
          <input type="range" min="0.2" max="1" step="0.05" value={amplitude}
            onChange={(e) => setAmplitude(Number(e.target.value))} />
        </label>
        <label>
          <span>Phase <strong><MathExpr tex={`\\phi=${phase.toFixed(0)}^\\circ`} /></strong></span>
          <input type="range" min="-180" max="180" step="5" value={phase}
            onChange={(e) => setPhase(Number(e.target.value))} />
        </label>
        <label>
          <span>Carrier minh họa <strong>{carrierCycles} cycles</strong></span>
          <input type="range" min="4" max="14" step="1" value={carrierCycles}
            onChange={(e) => setCarrierCycles(Number(e.target.value))} />
        </label>
      </div>

      <div className="rf-chain-readout">
        <div><small><MathExpr tex="I" /></small><strong>{i.toFixed(3)}</strong><span><MathExpr tex="A\\cos\\phi" /></span></div>
        <div><small><MathExpr tex="Q" /></small><strong>{q.toFixed(3)}</strong><span><MathExpr tex="A\\sin\\phi" /></span></div>
        <div><small>MAGNITUDE</small><strong>{Math.hypot(i, q).toFixed(3)}</strong><span>baseband symbol</span></div>
        <div><small>PHASE</small><strong><MathExpr tex={`${phase.toFixed(0)}^\\circ`} /></strong><span>baseband phase</span></div>
      </div>

      <div className="rf-chain-grid">
        <div className="rf-symbol-plane">
          <div className="visual-caption"><span>COMPLEX BASEBAND</span><strong><MathExpr tex="I+jQ" /></strong></div>
          <svg viewBox="0 0 330 305" role="img" aria-label="Complex baseband symbol on I Q plane">
            <line className="rfc-axis" x1="35" y1={cy} x2="300" y2={cy} />
            <line className="rfc-axis" x1={cx} y1="25" x2={cx} y2="280" />
            <circle className="rfc-guide" cx={cx} cy={cy} r={scale * amplitude} />
            <line className="rfc-proj" x1={px} y1={py} x2={px} y2={cy} />
            <line className="rfc-proj" x1={px} y1={py} x2={cx} y2={py} />
            <line className="rfc-vector" x1={cx} y1={cy} x2={px} y2={py} />
            <circle className="rfc-dot" cx={px} cy={py} r="6" />
            <SvgMathExpr tex="I" x={285} y={cy - 8} width={24} />
            <SvgMathExpr tex="Q" x={cx + 8} y={38} width={24} />
          </svg>
        </div>

        <div className="rf-mixer-panel">
          <div className="visual-caption"><span>QUADRATURE UPCONVERSION</span><strong><MathExpr tex="I\\cos(\\omega_ct)-Q\\sin(\\omega_ct)" /></strong></div>
          <div className="rf-wave-stack">
            <article>
              <small><MathExpr tex="I" /> branch</small>
              <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="I branch multiplied by cosine carrier">
                <line className="rfc-axis" x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} />
                <path className="rfc-wave i-wave" d={iPath} />
              </svg>
            </article>
            <article>
              <small><MathExpr tex="Q" /> branch</small>
              <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Q branch multiplied by negative sine carrier">
                <line className="rfc-axis" x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} />
                <path className="rfc-wave q-wave" d={qPath} />
              </svg>
            </article>
            <article className="rf-sum">
              <small>RF sum</small>
              <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Resulting real RF waveform">
                <line className="rfc-axis" x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} />
                <path className="rfc-wave rf-wave" d={rfPath} />
              </svg>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
