import { useMemo, useState } from 'react';
import MathExpr, { SvgMathExpr } from './MathExpr.jsx';

const W = 780;
const H = 250;
const LEFT = 48;
const RIGHT = 18;
const TOP = 20;
const BOTTOM = 34;
const MID = (TOP + H - BOTTOM) / 2;
const PLOT_W = W - LEFT - RIGHT;
const MAX_AMP_PX = 72;
const T_MIN = -0.5;
const T_MAX = 1.5;

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

function wavePath(amplitude, frequency, phaseDeg) {
  const phase = degToRad(phaseDeg);
  const points = [];
  const count = 700;

  for (let i = 0; i <= count; i += 1) {
    const t = T_MIN + (i / count) * (T_MAX - T_MIN);
    const x = LEFT + ((t - T_MIN) / (T_MAX - T_MIN)) * PLOT_W;
    const y = MID - MAX_AMP_PX * amplitude * Math.cos(2 * Math.PI * frequency * t + phase);
    points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  return points.join(' ');
}

function xForTime(t) {
  return LEFT + ((t - T_MIN) / (T_MAX - T_MIN)) * PLOT_W;
}

export default function SinusoidExplorer() {
  const [amplitude, setAmplitude] = useState(1);
  const [frequency, setFrequency] = useState(2);
  const [phase, setPhase] = useState(0);

  const period = 1 / frequency;
  const angularFrequency = 2 * Math.PI * frequency;
  const timeShift = -phase / (360 * frequency);
  const initialValue = amplitude * Math.cos(degToRad(phase));

  const currentPath = useMemo(
    () => wavePath(amplitude, frequency, phase),
    [amplitude, frequency, phase]
  );
  const referencePath = useMemo(
    () => wavePath(amplitude, frequency, 0),
    [amplitude, frequency]
  );

  const zeroX = xForTime(0);
  const shiftedPeakTime = timeShift;
  const shiftedPeakX = xForTime(shiftedPeakTime);

  function useAmplitudePreset() {
    setAmplitude(1.5);
    setFrequency(2);
    setPhase(0);
  }

  function useFrequencyPreset() {
    setAmplitude(1);
    setFrequency(4);
    setPhase(0);
  }

  function usePhasePreset() {
    setAmplitude(1);
    setFrequency(2);
    setPhase(90);
  }

  return (
    <div className="sinusoid-lab">
      <div className="sinusoid-controls">
        <label>
          <span>Amplitude <strong><MathExpr tex={`A=${amplitude.toFixed(1)}`} /></strong></span>
          <input
            type="range"
            min="0.4"
            max="1.5"
            step="0.1"
            value={amplitude}
            onChange={(event) => setAmplitude(Number(event.target.value))}
          />
        </label>
        <label>
          <span>Tần số <strong><MathExpr tex={`f=${frequency.toFixed(1)}\\,\\mathrm{Hz}`} /></strong></span>
          <input
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={frequency}
            onChange={(event) => setFrequency(Number(event.target.value))}
          />
        </label>
        <label>
          <span>Phase <strong><MathExpr tex={`\\phi=${phase.toFixed(0)}^\\circ`} /></strong></span>
          <input
            type="range"
            min="-180"
            max="180"
            step="15"
            value={phase}
            onChange={(event) => setPhase(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="sinusoid-presets" aria-label="Ví dụ nhanh">
        <button type="button" onClick={useAmplitudePreset}>Tăng amplitude</button>
        <button type="button" onClick={useFrequencyPreset}>Tăng frequency</button>
        <button type="button" onClick={usePhasePreset}>Phase <MathExpr tex={`+90^\\circ`} /></button>
      </div>

      <div className="sinusoid-readout">
        <div>
          <small>PERIOD</small>
          <strong><MathExpr tex={`T=${period.toFixed(3)}\\,\\mathrm{s}`} /></strong>
          <span><MathExpr tex="T=1/f" /></span>
        </div>
        <div>
          <small>ANGULAR FREQUENCY</small>
          <strong><MathExpr tex={`\\omega=${angularFrequency.toFixed(2)}\\,\\mathrm{rad/s}`} /></strong>
          <span><MathExpr tex={`\\omega=2\\pi f`} /></span>
        </div>
        <div>
          <small>GIÁ TRỊ TẠI <MathExpr tex="t=0" /></small>
          <strong><MathExpr tex={`x(0)=${initialValue.toFixed(2)}`} /></strong>
          <span><MathExpr tex={`A\\cos\\phi`} /></span>
        </div>
        <div>
          <small>TIME SHIFT TƯƠNG ĐƯƠNG</small>
          <strong><MathExpr tex={`${timeShift >= 0 ? '+' : ''}${timeShift.toFixed(3)}\\,\\mathrm{s}`} /></strong>
          <span><MathExpr tex={`\\Delta t=-\\phi/(360f)`} /></span>
        </div>
      </div>

      <div className="sinusoid-plot-wrap">
        <div className="sinusoid-legend">
          <span><i className="sinusoid-current-key"></i> <MathExpr tex="x(t)" /> hiện tại</span>
          <span><i className="sinusoid-reference-key"></i> cùng <MathExpr tex="A,f" /> nhưng <MathExpr tex={`\\phi=0^\\circ`} /></span>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Waveform sinusoid thay đổi theo amplitude, frequency và phase">
          <line className="sinusoid-axis" x1={LEFT} y1={MID} x2={W - RIGHT} y2={MID} />
          <line className="sinusoid-axis" x1={zeroX} y1={TOP} x2={zeroX} y2={H - BOTTOM} />
          <text className="sinusoid-svg-label" x={W - RIGHT - 26} y={MID - 9}>thời gian</text>
          <SvgMathExpr tex="t=0" x={zeroX + 5} y={H - BOTTOM + 13} width={46} />

          <path className="sinusoid-reference" d={referencePath} />
          <path className="sinusoid-current" d={currentPath} />

          {shiftedPeakTime >= T_MIN && shiftedPeakTime <= T_MAX && (
            <>
              <line
                className="sinusoid-phase-marker"
                x1={shiftedPeakX}
                y1={TOP + 8}
                x2={shiftedPeakX}
                y2={H - BOTTOM}
              />
              <text className="sinusoid-phase-label" x={shiftedPeakX + 5} y={TOP + 17}>peak</text>
            </>
          )}
        </svg>

        <p className="sinusoid-caption">
          Đường nét đứt giữ cùng amplitude và frequency nhưng đặt <MathExpr tex={`\\phi=0^\\circ`} />. Vì vậy khi chỉ thay phase,
          hình dạng và chu kỳ không đổi; waveform chỉ thay đổi vị trí tương đối theo trục thời gian.
        </p>
      </div>
    </div>
  );
}
