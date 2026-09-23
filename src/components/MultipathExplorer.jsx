import { useMemo, useState } from 'react';
import MathExpr, { SvgMathExpr } from './MathExpr.jsx';

const W = 760;
const H = 220;
const PAD = 28;

function valuesToPath(values, scale = 72) {
  return values.map((v, n) => {
    const x = PAD + (n / Math.max(values.length - 1, 1)) * (W - 2 * PAD);
    const y = H / 2 - scale * v;
    return `${n === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');
}

export default function MultipathExplorer() {
  const [echoGain, setEchoGain] = useState(0.55);
  const [delayUs, setDelayUs] = useState(6);
  const [phase, setPhase] = useState(120);

  const N = 220;
  const sampleUs = 0.5;
  const delaySamples = Math.round(delayUs / sampleUs);
  const phaseRad = phase * Math.PI / 180;

  const input = useMemo(() => Array.from({ length: N }, (_, n) => {
    const t = n / N;
    const envelope = Math.exp(-Math.pow((t - 0.38) / 0.16, 2));
    return envelope * Math.cos(2 * Math.PI * 12 * t);
  }), []);

  const direct = input;
  const echo = useMemo(() => Array.from({ length: N }, (_, n) => {
    const src = n - delaySamples;
    if (src < 0 || src >= N) return 0;
    const t = src / N;
    const envelope = Math.exp(-Math.pow((t - 0.38) / 0.16, 2));
    return echoGain * envelope * Math.cos(2 * Math.PI * 12 * t + phaseRad);
  }), [delaySamples, echoGain, phaseRad]);

  const sum = useMemo(() => direct.map((v, n) => v + echo[n]), [direct, echo]);

  const directPath = useMemo(() => valuesToPath(direct), [direct]);
  const echoPath = useMemo(() => valuesToPath(echo), [echo]);
  const sumPath = useMemo(() => valuesToPath(sum), [sum]);

  const p0 = 1;
  const p1 = echoGain * echoGain;
  const totalP = p0 + p1;
  const meanDelay = (p1 * delayUs) / totalP;
  const rmsDelay = Math.sqrt((p0 * Math.pow(0 - meanDelay, 2) + p1 * Math.pow(delayUs - meanDelay, 2)) / totalP);

  return (
    <div className="multipath-lab">
      <div className="multipath-controls">
        <label>
          <span>Echo magnitude <strong><MathExpr tex={`|\\alpha_1|=${echoGain.toFixed(2)}`} /></strong></span>
          <input type="range" min="0" max="0.95" step="0.05" value={echoGain}
            onChange={(e) => setEchoGain(Number(e.target.value))} />
        </label>
        <label>
          <span>Excess delay <strong><MathExpr tex={`${delayUs.toFixed(1)}\\,\\mu\\mathrm{s}`} /></strong></span>
          <input type="range" min="0" max="20" step="0.5" value={delayUs}
            onChange={(e) => setDelayUs(Number(e.target.value))} />
        </label>
        <label>
          <span>Echo phase <strong><MathExpr tex={`${phase.toFixed(0)}^\\circ`} /></strong></span>
          <input type="range" min="-180" max="180" step="5" value={phase}
            onChange={(e) => setPhase(Number(e.target.value))} />
        </label>
      </div>

      <div className="multipath-readout">
        <div><small>MAX EXCESS DELAY</small><strong><MathExpr tex={`${delayUs.toFixed(1)}\\,\\mu\\mathrm{s}`} /></strong><span>latest path - first path</span></div>
        <div><small>MEAN DELAY</small><strong><MathExpr tex={`${meanDelay.toFixed(2)}\\,\\mu\\mathrm{s}`} /></strong><span>power-weighted</span></div>
        <div><small>RMS DELAY SPREAD</small><strong><MathExpr tex={`${rmsDelay.toFixed(2)}\\,\\mu\\mathrm{s}`} /></strong><span>power-weighted spread</span></div>
        <div><small>CHANNEL TAPS</small><strong>2</strong><span>direct + echo</span></div>
      </div>

      <div className="multipath-grid">
        <div className="impulse-response-panel">
          <div className="visual-caption"><span>CHANNEL IMPULSE RESPONSE</span><strong><MathExpr tex={`h(\\tau)`} /></strong></div>
          <svg viewBox="0 0 420 240" role="img" aria-label="Two-tap multipath channel impulse response">
            <line className="mp-axis" x1="42" y1="190" x2="385" y2="190" />
            <line className="mp-tap direct-tap" x1="92" y1="190" x2="92" y2="60" />
            <circle className="mp-dot direct-dot" cx="92" cy="60" r="6" />
            <line className="mp-tap echo-tap" x1={92 + delayUs * 12} y1="190" x2={92 + delayUs * 12} y2={190 - echoGain * 130} />
            <circle className="mp-dot echo-dot" cx={92 + delayUs * 12} cy={190 - echoGain * 130} r="6" />
            <text className="mp-label" x="72" y="215">0</text>
            <SvgMathExpr tex={`${delayUs.toFixed(1)}\\,\\mu\\mathrm{s}`} x={82 + delayUs * 12} y={209} width={58} />
            <text className="mp-label" x="350" y="215">delay</text>
          </svg>
        </div>

        <div className="multipath-wave-panel">
          <div className="visual-caption"><span>TIME DOMAIN</span><strong>copies overlap at receiver</strong></div>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Direct path echo and received sum">
            <line className="mp-axis" x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} />
            <path className="mp-direct-wave" d={directPath} />
            <path className="mp-echo-wave" d={echoPath} />
            <path className="mp-sum-wave" d={sumPath} />
          </svg>
          <div className="mp-legend">
            <span><i className="mp-direct-key"></i> direct</span>
            <span><i className="mp-echo-key"></i> echo</span>
            <span><i className="mp-sum-key"></i> received sum</span>
          </div>
        </div>
      </div>
    </div>
  );
}
