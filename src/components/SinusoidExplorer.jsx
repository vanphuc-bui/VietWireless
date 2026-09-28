import { useMemo, useState } from 'react';
import MathExpr, { SvgMathExpr } from './MathExpr.jsx';

const W = 800;
const H = 300;
const LEFT = 58;
const RIGHT = 22;
const TOP = 28;
const BOTTOM = 48;
const MID = (TOP + H - BOTTOM) / 2;
const PLOT_W = W - LEFT - RIGHT;
const MAX_AMP_PX = 74;
const T_MIN = -0.5;
const T_MAX = 1.5;

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

function wavePath(amplitude, frequency, phaseDeg) {
  const phase = degToRad(phaseDeg);
  const points = [];
  const count = 720;

  for (let i = 0; i <= count; i += 1) {
    const t = T_MIN + (i / count) * (T_MAX - T_MIN);
    const x = LEFT + ((t - T_MIN) / (T_MAX - T_MIN)) * PLOT_W;
    const y = MID - MAX_AMP_PX * amplitude * Math.cos(2 * Math.PI * frequency * t + phase);
    points.push((i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2));
  }

  return points.join(' ');
}

function xForTime(t) {
  return LEFT + ((t - T_MIN) / (T_MAX - T_MIN)) * PLOT_W;
}

function yForValue(value) {
  return MID - MAX_AMP_PX * value;
}

function phaseModePreset(mode, setters) {
  const { setAmplitude, setFrequency, setPhase } = setters;

  if (mode === 'amplitude') {
    setAmplitude(1.3);
    setFrequency(2);
    setPhase(0);
  }

  if (mode === 'frequency') {
    setAmplitude(1);
    setFrequency(3.5);
    setPhase(0);
  }

  if (mode === 'phase') {
    setAmplitude(1);
    setFrequency(2);
    setPhase(90);
  }
}

export default function SinusoidExplorer() {
  const [amplitude, setAmplitude] = useState(1.3);
  const [frequency, setFrequency] = useState(2);
  const [phase, setPhase] = useState(0);
  const [focus, setFocus] = useState('amplitude');

  const period = 1 / frequency;
  const angularFrequency = 2 * Math.PI * frequency;
  const phaseRad = degToRad(phase);
  const timeShift = -phase / (360 * frequency);
  const initialValue = amplitude * Math.cos(phaseRad);

  const currentPath = useMemo(
    () => wavePath(amplitude, frequency, phase),
    [amplitude, frequency, phase]
  );

  const referencePath = useMemo(
    () => wavePath(amplitude, frequency, 0),
    [amplitude, frequency]
  );

  const zeroX = xForTime(0);
  const shiftedPeakX = xForTime(timeShift);
  const amplitudeY = yForValue(amplitude);
  const negativeAmplitudeY = yForValue(-amplitude);

  let periodPeakStart = timeShift;
  while (periodPeakStart < T_MIN) periodPeakStart += period;
  while (periodPeakStart + period > T_MAX) periodPeakStart -= period;

  const periodStartX = xForTime(periodPeakStart);
  const periodEndX = xForTime(periodPeakStart + period);
  const timeShiftLeftX = Math.min(zeroX, shiftedPeakX);
  const timeShiftRightX = Math.max(zeroX, shiftedPeakX);
  const showTimeShift = Math.abs(timeShift) > 1e-6
    && shiftedPeakX >= LEFT
    && shiftedPeakX <= W - RIGHT;

  function chooseFocus(mode) {
    setFocus(mode);
    if (mode !== 'free') {
      phaseModePreset(mode, { setAmplitude, setFrequency, setPhase });
    }
  }

  const amplitudeDisabled = focus !== 'free' && focus !== 'amplitude';
  const frequencyDisabled = focus !== 'free' && focus !== 'frequency';
  const phaseDisabled = focus !== 'free' && focus !== 'phase';

  const formulaTex = 'x(t)='
    + amplitude.toFixed(1)
    + '\\cos(2\\pi\\cdot'
    + frequency.toFixed(1)
    + 't'
    + (phaseRad >= 0 ? '+' : '')
    + phaseRad.toFixed(2)
    + ')';

  return (
    <div className="sinusoid-lab sinusoid-lab-v2">
      <div className="sinusoid-focus-tabs" role="tablist" aria-label="Chọn tham số muốn cô lập">
        <button
          type="button"
          role="tab"
          aria-selected={focus === 'amplitude'}
          className={focus === 'amplitude' ? 'selected' : ''}
          onClick={() => chooseFocus('amplitude')}
        >
          Focus amplitude
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={focus === 'frequency'}
          className={focus === 'frequency' ? 'selected' : ''}
          onClick={() => chooseFocus('frequency')}
        >
          Focus frequency
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={focus === 'phase'}
          className={focus === 'phase' ? 'selected' : ''}
          onClick={() => chooseFocus('phase')}
        >
          Focus phase
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={focus === 'free'}
          className={focus === 'free' ? 'selected' : ''}
          onClick={() => chooseFocus('free')}
        >
          Free mode
        </button>
      </div>

      <div className="sinusoid-controls">
        <label className={amplitudeDisabled ? 'disabled' : ''}>
          <span>Amplitude <strong><MathExpr tex={'A=' + amplitude.toFixed(1)} /></strong></span>
          <input
            type="range"
            min="0.4"
            max="1.5"
            step="0.1"
            value={amplitude}
            disabled={amplitudeDisabled}
            onChange={(event) => setAmplitude(Number(event.target.value))}
          />
        </label>

        <label className={frequencyDisabled ? 'disabled' : ''}>
          <span>Tần số <strong><MathExpr tex={'f=' + frequency.toFixed(1) + '\\,\\mathrm{Hz}'} /></strong></span>
          <input
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={frequency}
            disabled={frequencyDisabled}
            onChange={(event) => setFrequency(Number(event.target.value))}
          />
        </label>

        <label className={phaseDisabled ? 'disabled' : ''}>
          <span>Phase <strong><MathExpr tex={'\\phi=' + phase.toFixed(0) + '^\\circ'} /></strong></span>
          <input
            type="range"
            min="-180"
            max="180"
            step="15"
            value={phase}
            disabled={phaseDisabled}
            onChange={(event) => setPhase(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="sinusoid-current-formula">
        <small>CURRENT SINUSOID</small>
        <strong><MathExpr tex={formulaTex} /></strong>
        <span>phase term trong biểu thức này đang được đổi sang radian</span>
      </div>

      <div className="sinusoid-readout sinusoid-readout-v2">
        <div>
          <small>PERIOD</small>
          <strong><MathExpr tex={'T=' + period.toFixed(3) + '\\,\\mathrm{s}'} /></strong>
          <span><MathExpr tex="T=1/f" /></span>
        </div>
        <div>
          <small>ANGULAR FREQUENCY</small>
          <strong><MathExpr tex={'\\omega=' + angularFrequency.toFixed(2) + '\\,\\mathrm{rad/s}'} /></strong>
          <span><MathExpr tex={String.raw`\omega=2\pi f`} /></span>
        </div>
        <div>
          <small>PHASE IN RADIAN</small>
          <strong><MathExpr tex={'\\phi=' + phaseRad.toFixed(3) + '\\,\\mathrm{rad}'} /></strong>
          <span><MathExpr tex={String.raw`\phi_{\rm rad}=\phi_{\rm deg}\pi/180`} /></span>
        </div>
        <div>
          <small>EQUIVALENT TIME SHIFT</small>
          <strong><MathExpr tex={(timeShift >= 0 ? '+' : '') + timeShift.toFixed(3) + '\\,\\mathrm{s}'} /></strong>
          <span><MathExpr tex={String.raw`\tau=-\phi/(2\pi f)`} /></span>
        </div>
      </div>

      <div className="sinusoid-plot-wrap">
        <div className="sinusoid-legend">
          <span><i className="sinusoid-current-key"></i> current <MathExpr tex="x(t)" /></span>
          <span><i className="sinusoid-reference-key"></i> same <MathExpr tex="A,f" /> with <MathExpr tex={String.raw`\phi=0^\circ`} /></span>
        </div>

        <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label="Waveform sinusoid với annotation amplitude period và phase time shift">
          <line className="sinusoid-axis" x1={LEFT} y1={MID} x2={W - RIGHT} y2={MID} />
          <line className="sinusoid-axis" x1={zeroX} y1={TOP} x2={zeroX} y2={H - BOTTOM} />
          <SvgMathExpr tex="t=0" x={zeroX + 5} y={H - BOTTOM + 12} width={46} />

          <line className="sinusoid-amplitude-guide" x1={LEFT} y1={amplitudeY} x2={W - RIGHT} y2={amplitudeY} />
          <line className="sinusoid-amplitude-guide" x1={LEFT} y1={negativeAmplitudeY} x2={W - RIGHT} y2={negativeAmplitudeY} />

          <path className="sinusoid-reference" d={referencePath} />
          <path className="sinusoid-current" d={currentPath} />

          <line
            className="sinusoid-amplitude-bracket"
            x1={LEFT + 12}
            y1={MID}
            x2={LEFT + 12}
            y2={amplitudeY}
          />
          <SvgMathExpr tex="A" x={LEFT + 18} y={(MID + amplitudeY) / 2 + 6} width={26} />

          <path
            className="sinusoid-period-bracket"
            d={'M' + periodStartX + ' ' + (H - 31)
              + ' L' + periodStartX + ' ' + (H - 22)
              + ' L' + periodEndX + ' ' + (H - 22)
              + ' L' + periodEndX + ' ' + (H - 31)}
          />
          <SvgMathExpr
            tex="T"
            x={(periodStartX + periodEndX) / 2 - 10}
            y={H - 36}
            width={24}
          />

          {showTimeShift && (
            <>
              <line
                className="sinusoid-phase-marker"
                x1={shiftedPeakX}
                y1={TOP + 2}
                x2={shiftedPeakX}
                y2={H - BOTTOM}
              />
              <path
                className="sinusoid-shift-bracket"
                d={'M' + timeShiftLeftX + ' ' + (TOP + 14)
                  + ' L' + timeShiftLeftX + ' ' + (TOP + 8)
                  + ' L' + timeShiftRightX + ' ' + (TOP + 8)
                  + ' L' + timeShiftRightX + ' ' + (TOP + 14)}
              />
              <SvgMathExpr
                tex={String.raw`\tau`}
                x={(timeShiftLeftX + timeShiftRightX) / 2 - 10}
                y={TOP + 12}
                width={26}
              />
            </>
          )}
        </svg>

        <div className="sinusoid-geometry-readout">
          <span><strong>Vertical:</strong> <MathExpr tex="A" /> controls peak magnitude.</span>
          <span><strong>Horizontal repetition:</strong> adjacent equal-phase peaks are separated by <MathExpr tex="T" />.</span>
          <span><strong>Relative shift:</strong> phase becomes an equivalent time shift <MathExpr tex={String.raw`\tau`} /> when <MathExpr tex="f" /> is fixed.</span>
        </div>

        <p className="sinusoid-caption">
          {focus === 'amplitude' && <>Chỉ slider <strong>Amplitude</strong> đang active. Frequency và phase được khóa để bạn chỉ nhìn vertical scaling.</>}
          {focus === 'frequency' && <>Chỉ slider <strong>Frequency</strong> đang active. Quan sát period bracket <MathExpr tex="T" /> co lại khi <MathExpr tex="f" /> tăng.</>}
          {focus === 'phase' && <>Chỉ slider <strong>Phase</strong> đang active. Quan sát current waveform dịch tương đối so với dashed reference và marker <MathExpr tex={String.raw`\tau`} />.</>}
          {focus === 'free' && <>Free mode mở cả ba sliders. Dùng mode này sau khi đã isolate từng tham số để xem các effects kết hợp.</>}
        </p>
      </div>

      <div className="sinusoid-secondary-readout">
        <span>At <MathExpr tex="t=0" />: <strong><MathExpr tex={'x(0)=' + initialValue.toFixed(2)} /></strong></span>
        <span>Peak-to-peak: <strong><MathExpr tex={'2A=' + (2 * amplitude).toFixed(1)} /></strong></span>
        <span>Phase fraction: <strong><MathExpr tex={(phase / 360).toFixed(3) + '\\,\\text{cycle}'} /></strong></span>
      </div>
    </div>
  );
}
