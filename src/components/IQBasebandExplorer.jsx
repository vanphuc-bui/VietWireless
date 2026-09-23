import { useMemo, useState } from 'react';
import MathExpr, { SvgMathExpr } from './MathExpr.jsx';

const W = 760;
const H = 230;
const PAD = 34;

function rfPath(amplitude, phaseDeg, cycles = 8) {
  const phase = (phaseDeg * Math.PI) / 180;
  const values = [];
  const count = 520;
  for (let n = 0; n <= count; n += 1) {
    const t = n / count;
    const x = PAD + t * (W - 2 * PAD);
    const v = amplitude * Math.cos(2 * Math.PI * cycles * t + phase);
    const y = H / 2 - v * 72;
    values.push(`${n === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return values.join(' ');
}

export default function IQBasebandExplorer() {
  const [amplitude, setAmplitude] = useState(1);
  const [phase, setPhase] = useState(35);

  const rad = (phase * Math.PI) / 180;
  const i = amplitude * Math.cos(rad);
  const q = amplitude * Math.sin(rad);
  const path = useMemo(() => rfPath(amplitude, phase), [amplitude, phase]);

  const cx = 180;
  const cy = 165;
  const scale = 105;
  const px = cx + scale * i;
  const py = cy - scale * q;

  return (
    <div className="iq-baseband-lab">
      <div className="iq-baseband-controls">
        <label>
          <span>Amplitude <strong><MathExpr tex={`A=${amplitude.toFixed(2)}`} /></strong></span>
          <input
            type="range"
            min="0.2"
            max="1"
            step="0.05"
            value={amplitude}
            onChange={(event) => setAmplitude(Number(event.target.value))}
          />
        </label>
        <label>
          <span>Phase <strong><MathExpr tex={`\\phi=${phase.toFixed(0)}^\\circ`} /></strong></span>
          <input
            type="range"
            min="-180"
            max="180"
            step="5"
            value={phase}
            onChange={(event) => setPhase(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="iq-baseband-readout">
        <div><small><MathExpr tex="I" /></small><strong>{i.toFixed(3)}</strong><span><MathExpr tex={`A\\cos\\phi`} /></span></div>
        <div><small><MathExpr tex="Q" /></small><strong>{q.toFixed(3)}</strong><span><MathExpr tex={`A\\sin\\phi`} /></span></div>
        <div><small>MAGNITUDE</small><strong>{Math.hypot(i, q).toFixed(3)}</strong><span><MathExpr tex={`\\sqrt{I^2+Q^2}`} /></span></div>
        <div><small>PHASE</small><strong><MathExpr tex={`${phase.toFixed(0)}^\\circ`} /></strong><span><MathExpr tex={`\\operatorname{atan2}(Q,I)`} /></span></div>
      </div>

      <div className="iq-baseband-grid">
        <div className="iq-baseband-plane">
          <div className="visual-caption">
            <span>COMPLEX BASEBAND</span>
            <strong><MathExpr tex="x=I+jQ" /></strong>
          </div>
          <svg viewBox="0 0 360 330" role="img" aria-label="Điểm I Q trên mặt phẳng phức">
            <line className="iqb-axis" x1="42" y1={cy} x2="326" y2={cy} />
            <line className="iqb-axis" x1={cx} y1="30" x2={cx} y2="300" />
            <circle className="iqb-guide" cx={cx} cy={cy} r={scale * amplitude} />
            <line className="iqb-projection" x1={px} y1={py} x2={px} y2={cy} />
            <line className="iqb-projection" x1={px} y1={py} x2={cx} y2={py} />
            <line className="iqb-vector" x1={cx} y1={cy} x2={px} y2={py} />
            <circle className="iqb-dot" cx={px} cy={py} r="6" />
            <SvgMathExpr tex="I" x={312} y={cy - 9} width={24} />
            <SvgMathExpr tex="Q" x={cx + 9} y={42} width={24} />
            <SvgMathExpr tex={`I=${i.toFixed(2)}`} x={px + 8} y={cy - 8} width={74} />
            <SvgMathExpr tex={`Q=${q.toFixed(2)}`} x={cx + 8} y={py - 8} width={74} />
          </svg>
        </div>

        <div className="iq-baseband-rf">
          <div className="visual-caption">
            <span>PHYSICAL RF · MINH HỌA</span>
            <strong><MathExpr tex="s(t)" /> là tín hiệu thực</strong>
          </div>
          <div className="iq-rf-formula">
            <MathExpr tex={`s(t)=I\\cos(\\omega_c t)-Q\\sin(\\omega_c t)`} />
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Waveform RF thực được tổng hợp từ I và Q">
            <line className="iqb-axis" x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} />
            <path className="iqb-rf-wave" d={path} />
          </svg>
          <p>
            Với <MathExpr tex={`I=A\\cos\\phi`} /> và <MathExpr tex={`Q=A\\sin\\phi`} />, biểu thức trên trở thành <MathExpr tex={`A\\cos(\\omega_c t+\\phi)`} />.
            <MathExpr tex="I+jQ" /> là representation ở baseband; waveform ngoài RF chain vẫn là tín hiệu thực.
          </p>
        </div>
      </div>
    </div>
  );
}
