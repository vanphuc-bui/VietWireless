import { useMemo, useState } from 'react';

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
          <span>Amplitude <strong>A = {amplitude.toFixed(2)}</strong></span>
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
          <span>Phase <strong>φ = {phase.toFixed(0)}°</strong></span>
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
        <div><small>I</small><strong>{i.toFixed(3)}</strong><span>A cos φ</span></div>
        <div><small>Q</small><strong>{q.toFixed(3)}</strong><span>A sin φ</span></div>
        <div><small>MAGNITUDE</small><strong>{Math.hypot(i, q).toFixed(3)}</strong><span>√(I²+Q²)</span></div>
        <div><small>PHASE</small><strong>{phase.toFixed(0)}°</strong><span>atan2(Q,I)</span></div>
      </div>

      <div className="iq-baseband-grid">
        <div className="iq-baseband-plane">
          <div className="visual-caption">
            <span>COMPLEX BASEBAND</span>
            <strong>x = I + jQ</strong>
          </div>
          <svg viewBox="0 0 360 330" role="img" aria-label="Điểm I Q trên mặt phẳng phức">
            <line className="iqb-axis" x1="42" y1={cy} x2="326" y2={cy} />
            <line className="iqb-axis" x1={cx} y1="30" x2={cx} y2="300" />
            <circle className="iqb-guide" cx={cx} cy={cy} r={scale * amplitude} />
            <line className="iqb-projection" x1={px} y1={py} x2={px} y2={cy} />
            <line className="iqb-projection" x1={px} y1={py} x2={cx} y2={py} />
            <line className="iqb-vector" x1={cx} y1={cy} x2={px} y2={py} />
            <circle className="iqb-dot" cx={px} cy={py} r="6" />
            <text className="iqb-label" x="312" y={cy - 9}>I</text>
            <text className="iqb-label" x={cx + 9} y="42">Q</text>
            <text className="iqb-value" x={px + 8} y={cy - 8}>I={i.toFixed(2)}</text>
            <text className="iqb-value" x={cx + 8} y={py - 8}>Q={q.toFixed(2)}</text>
          </svg>
        </div>

        <div className="iq-baseband-rf">
          <div className="visual-caption">
            <span>PHYSICAL RF · MINH HỌA</span>
            <strong>s(t) là tín hiệu thực</strong>
          </div>
          <div className="iq-rf-formula">
            s(t) = I cos(ω<sub>c</sub>t) - Q sin(ω<sub>c</sub>t)
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Waveform RF thực được tổng hợp từ I và Q">
            <line className="iqb-axis" x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} />
            <path className="iqb-rf-wave" d={path} />
          </svg>
          <p>
            Với I = A cosφ và Q = A sinφ, biểu thức trên trở thành A cos(ω<sub>c</sub>t + φ).
            I+jQ là representation ở baseband; waveform ngoài RF chain vẫn là tín hiệu thực.
          </p>
        </div>
      </div>
    </div>
  );
}
