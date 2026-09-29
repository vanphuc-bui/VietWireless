import { useMemo, useState } from 'react';
import MathExpr, { SvgMathExpr } from './MathExpr.jsx';

const W = 760;
const H = 230;
const PAD = 34;
const N = 180;

function envelope(n) {
  return Math.exp(-Math.pow((n - 62) / 24, 2));
}

function pathFromValues(values, scale = 78) {
  return values.map((value, n) => {
    const x = PAD + (n / Math.max(values.length - 1, 1)) * (W - 2 * PAD);
    const y = H - 34 - scale * value;
    return (n === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2);
  }).join(' ');
}

export default function WirelessChannelExplorer() {
  const [focus, setFocus] = useState('delay');
  const [gainDb, setGainDb] = useState(0);
  const [delay, setDelay] = useState(14);
  const [phase, setPhase] = useState(0);

  const gain = Math.pow(10, gainDb / 20);
  const powerRatio = gain * gain;
  const phaseRad = (phase * Math.PI) / 180;

  const inputMagnitude = useMemo(
    () => Array.from({ length: N }, (_, n) => envelope(n)),
    []
  );

  const outputMagnitude = useMemo(
    () => Array.from({ length: N }, (_, n) => {
      const source = n - delay;
      if (source < 0 || source >= N) return 0;
      return gain * envelope(source);
    }),
    [delay, gain]
  );

  const inputPath = useMemo(() => pathFromValues(inputMagnitude), [inputMagnitude]);
  const outputPath = useMemo(() => pathFromValues(outputMagnitude), [outputMagnitude]);

  const symbolPhase = 35 * Math.PI / 180;
  const txI = Math.cos(symbolPhase);
  const txQ = Math.sin(symbolPhase);
  const rxI = gain * Math.cos(symbolPhase + phaseRad);
  const rxQ = gain * Math.sin(symbolPhase + phaseRad);

  const cx = 185;
  const cy = 165;
  const scale = 108;
  const txX = cx + scale * txI;
  const txY = cy - scale * txQ;
  const rxX = cx + scale * rxI;
  const rxY = cy - scale * rxQ;

  function chooseFocus(next) {
    setFocus(next);

    if (next === 'delay') {
      setGainDb(0);
      setPhase(0);
      setDelay(14);
    }

    if (next === 'gain') {
      setGainDb(-8);
      setPhase(40);
      setDelay(0);
    }
  }

  const delayDisabled = focus === 'gain';
  const gainDisabled = focus === 'delay';
  const phaseDisabled = focus === 'delay';

  return (
    <div className="wireless-channel-lab wireless-channel-lab-v2">
      <div className="channel-focus-tabs" role="tablist" aria-label="Cô lập propagation delay hoặc complex gain">
        <button
          type="button"
          role="tab"
          aria-selected={focus === 'delay'}
          className={focus === 'delay' ? 'selected' : ''}
          onClick={() => chooseFocus('delay')}
        >
          Focus delay
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={focus === 'gain'}
          className={focus === 'gain' ? 'selected' : ''}
          onClick={() => chooseFocus('gain')}
        >
          Focus complex gain
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={focus === 'free'}
          className={focus === 'free' ? 'selected' : ''}
          onClick={() => setFocus('free')}
        >
          Free mode
        </button>
      </div>

      <div className="channel-controls channel-controls-v2">
        <label className={gainDisabled ? 'disabled' : ''}>
          <span>Channel gain <strong><MathExpr tex={gainDb.toFixed(0) + '\\,\\mathrm{dB}'} /></strong></span>
          <input
            type="range"
            min="-24"
            max="0"
            step="1"
            value={gainDb}
            disabled={gainDisabled}
            onChange={(event) => setGainDb(Number(event.target.value))}
          />
        </label>

        <label className={delayDisabled ? 'disabled' : ''}>
          <span>Propagation delay <strong><MathExpr tex={delay + '\\,T_s'} /></strong></span>
          <input
            type="range"
            min="0"
            max="32"
            step="1"
            value={delay}
            disabled={delayDisabled}
            onChange={(event) => setDelay(Number(event.target.value))}
          />
        </label>

        <label className={phaseDisabled ? 'disabled' : ''}>
          <span>Channel phase <strong><MathExpr tex={'\\theta=' + phase.toFixed(0) + '^\\circ'} /></strong></span>
          <input
            type="range"
            min="-180"
            max="180"
            step="5"
            value={phase}
            disabled={phaseDisabled}
            onChange={(event) => setPhase(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="channel-readout metric-card-grid">
        <div className="metric-card">
          <small className="metric-card-label">MAGNITUDE GAIN</small>
          <strong className="metric-card-value"><MathExpr tex={gain.toFixed(3)} /></strong>
          <span className="metric-card-formula"><MathExpr tex={String.raw`|h|=10^{G_{\rm dB}/20}`} /></span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">POWER RATIO</small>
          <strong className="metric-card-value"><MathExpr tex={powerRatio.toFixed(3)} /></strong>
          <span className="metric-card-formula"><MathExpr tex={String.raw`|h|^2`} /></span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">PHASE</small>
          <strong className="metric-card-value"><MathExpr tex={phase.toFixed(0) + '^\\circ'} /></strong>
          <span className="metric-card-formula"><MathExpr tex={String.raw`h=|h|e^{j\theta}`} /></span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">DELAY</small>
          <strong className="metric-card-value"><MathExpr tex={delay + '\\,T_s'} /></strong>
          <span className="metric-card-formula">envelope arrival shift</span>
        </div>
      </div>

      <div className="channel-lab-grid channel-lab-grid-v2">
        <div className="channel-wave-panel">
          <div className="visual-caption">
            <span>BASEBAND ENVELOPE MAGNITUDE</span>
            <strong>delay shifts it; gain scales it</strong>
          </div>

          <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label="Input and output complex-baseband envelope magnitude through a single-path channel">
            <line className="channel-axis" x1={PAD} y1={H - 34} x2={W - PAD} y2={H - 34} />
            <path className="channel-input-wave" d={inputPath} />
            <path className="channel-output-wave" d={outputPath} />
            <SvgMathExpr tex="n" x={W - 54} y={H - 27} width={24} />
            <SvgMathExpr tex={String.raw`|x[n]|`} x={PAD + 4} y={24} width={54} />
          </svg>

          <div className="channel-legend">
            <span><i className="channel-input-key"></i><MathExpr tex={String.raw`|x[n]|`} /></span>
            <span><i className="channel-output-key"></i><MathExpr tex={String.raw`|y[n]|`} /></span>
          </div>

          <p className="channel-panel-note">
            Phase rotation không đổi envelope magnitude.
            Vì vậy panel này cố tình tách propagation delay khỏi complex-plane rotation.
          </p>
        </div>

        <div className="channel-plane-panel">
          <div className="visual-caption">
            <span>COMPLEX GAIN AFTER TIMING ALIGNMENT</span>
            <strong><MathExpr tex="y=hx" /> scales and rotates</strong>
          </div>

          <svg viewBox="0 0 370 330" role="img" aria-label="Known complex symbol before and after a flat complex channel gain">
            <line className="channel-axis" x1="38" y1={cy} x2="336" y2={cy} />
            <line className="channel-axis" x1={cx} y1="26" x2={cx} y2="300" />
            <circle className="channel-unit-circle" cx={cx} cy={cy} r={scale} />

            <line className="channel-tx-vector" x1={cx} y1={cy} x2={txX} y2={txY} />
            <circle className="channel-tx-dot" cx={txX} cy={txY} r="6" />

            <line className="channel-rx-vector" x1={cx} y1={cy} x2={rxX} y2={rxY} />
            <circle className="channel-rx-dot" cx={rxX} cy={rxY} r="6" />

            <SvgMathExpr tex="I" x={319} y={cy - 8} width={24} />
            <SvgMathExpr tex="Q" x={cx + 8} y={40} width={24} />
            <SvgMathExpr tex="x" x={txX + 8} y={txY - 10} width={22} />
            <SvgMathExpr tex="hx" x={rxX + 8} y={rxY - 10} width={32} />
          </svg>

          <div className="channel-legend">
            <span><i className="channel-tx-key"></i>known transmit point</span>
            <span><i className="channel-rx-key"></i>received point after <MathExpr tex="h" /></span>
          </div>

          <p className="channel-panel-note">
            Delay slider không đổi point này vì panel giả sử receiver đã chọn đúng arrival time.
            Nó chỉ minh họa effect của scalar complex gain <MathExpr tex="h" />.
          </p>
        </div>
      </div>

      <p className="channel-lab-caption">
        {focus === 'delay' && <>Focus delay khóa <MathExpr tex="|h|=1" /> và <MathExpr tex={String.raw`\theta=0`} /> để chỉ nhìn arrival shift.</>}
        {focus === 'gain' && <>Focus complex gain đặt delay về zero để chỉ nhìn attenuation và rotation.</>}
        {focus === 'free' && <>Free mode cho phép kết hợp cả delay và complex gain của single-path model.</>}
      </p>
    </div>
  );
}
