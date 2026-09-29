import { useMemo, useState } from 'react';
import MathExpr, { SvgMathExpr } from './MathExpr.jsx';

const W = 760;
const H = 230;
const PAD = 34;
const TIME_N = 240;

function pathFromValues(values, baseline = H / 2, scale = 72) {
  return values.map((value, n) => {
    const x = PAD + (n / Math.max(values.length - 1, 1)) * (W - 2 * PAD);
    const y = baseline - scale * value;
    return (n === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2);
  }).join(' ');
}

function pulseEnvelope(n, center, width) {
  return Math.exp(-Math.pow((n - center) / width, 4));
}

function twoTapResponse(a, delayUs, phaseDeg, frequencyMHz) {
  const phase = (phaseDeg * Math.PI) / 180;
  const angle = phase - 2 * Math.PI * frequencyMHz * delayUs;
  const re = 1 + a * Math.cos(angle);
  const im = a * Math.sin(angle);
  return {
    re,
    im,
    magnitude: Math.hypot(re, im),
    power: re * re + im * im,
    relativeAngle: angle,
  };
}

export default function MultipathExplorer() {
  const [mode, setMode] = useState('delay');
  const [echoGain, setEchoGain] = useState(0.65);
  const [delayUs, setDelayUs] = useState(4);
  const [phase, setPhase] = useState(135);
  const [probeMHz, setProbeMHz] = useState(0);
  const [symbolUs, setSymbolUs] = useState(8);

  const phaseRad = (phase * Math.PI) / 180;

  const p0 = 1;
  const p1 = echoGain * echoGain;
  const totalPower = p0 + p1;
  const meanDelay = totalPower > 0 ? (p1 * delayUs) / totalPower : 0;
  const rmsDelay = totalPower > 0
    ? Math.sqrt(
      (
        p0 * Math.pow(meanDelay, 2)
        + p1 * Math.pow(delayUs - meanDelay, 2)
      ) / totalPower
    )
    : 0;

  const ripplePeriodMHz = delayUs > 0 ? 1 / delayUs : Infinity;
  const delayToSymbol = symbolUs > 0 ? delayUs / symbolUs : 0;

  const copyData = useMemo(() => {
    const samplesPerUs = 5;
    const delaySamples = Math.round(delayUs * samplesPerUs);
    const center = 72;
    const width = 26;

    const direct = Array.from(
      { length: TIME_N },
      (_, n) => pulseEnvelope(n, center, width)
    );

    const echoMagnitude = Array.from(
      { length: TIME_N },
      (_, n) => echoGain * pulseEnvelope(n - delaySamples, center, width)
    );

    const combinedMagnitude = Array.from({ length: TIME_N }, (_, n) => {
      const directComplex = { re: direct[n], im: 0 };
      const echoComplex = {
        re: echoMagnitude[n] * Math.cos(phaseRad),
        im: echoMagnitude[n] * Math.sin(phaseRad),
      };
      return Math.hypot(
        directComplex.re + echoComplex.re,
        directComplex.im + echoComplex.im
      );
    });

    return {
      direct,
      echoMagnitude,
      combinedMagnitude,
      directPath: pathFromValues(direct, H - 34, 92),
      echoPath: pathFromValues(echoMagnitude, H - 34, 92),
      combinedPath: pathFromValues(combinedMagnitude, H - 34, 92),
    };
  }, [delayUs, echoGain, phaseRad]);

  const frequencyData = useMemo(() => {
    const maxAbsMHz = 1.5;
    const count = 360;
    const values = Array.from({ length: count + 1 }, (_, index) => {
      const fMHz = -maxAbsMHz + (2 * maxAbsMHz * index) / count;
      const response = twoTapResponse(echoGain, delayUs, phase, fMHz);
      return { fMHz, ...response };
    });

    const maxMagnitude = Math.max(...values.map((item) => item.magnitude), 1e-9);
    const plotPath = values.map((item, index) => {
      const x = PAD + (index / count) * (W - 2 * PAD);
      const y = H - 34 - (item.magnitude / maxMagnitude) * 150;
      return (index === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2);
    }).join(' ');

    return { values, plotPath, maxMagnitude, maxAbsMHz };
  }, [echoGain, delayUs, phase]);

  const probe = twoTapResponse(echoGain, delayUs, phase, probeMHz);

  const phCx = 190;
  const phCy = 165;
  const phScale = 92;
  const directEnd = { x: phCx + phScale, y: phCy };
  const echoAngle = probe.relativeAngle;
  const echoStart = directEnd;
  const echoEnd = {
    x: echoStart.x + phScale * echoGain * Math.cos(echoAngle),
    y: echoStart.y - phScale * echoGain * Math.sin(echoAngle),
  };
  const sumEnd = {
    x: phCx + phScale * probe.re,
    y: phCy - phScale * probe.im,
  };

  const symbolPanel = useMemo(() => {
    const panelW = 720;
    const left = 36;
    const right = 18;
    const usable = panelW - left - right;
    const symbolCount = 3;
    const symbolWidth = usable / symbolCount;
    const delayPx = Math.min(delayToSymbol, 1.5) * symbolWidth;

    return { panelW, left, right, usable, symbolWidth, delayPx };
  }, [delayToSymbol]);

  function setPreset(kind) {
    if (kind === 'flat') {
      setEchoGain(0.25);
      setDelayUs(0.5);
      setPhase(35);
      setProbeMHz(0);
    } else if (kind === 'notch') {
      setEchoGain(0.95);
      setDelayUs(4);
      setPhase(180);
      setProbeMHz(0);
    } else if (kind === 'long') {
      setEchoGain(0.55);
      setDelayUs(9);
      setPhase(110);
      setProbeMHz(0);
    }
  }

  return (
    <div className="multipath-lab multipath-lab-v2">
      <div className="multipath-mode-tabs" role="tablist" aria-label="Chọn góc nhìn multipath">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'delay'}
          className={mode === 'delay' ? 'selected' : ''}
          onClick={() => setMode('delay')}
        >
          Taps & delayed copies
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'frequency'}
          className={mode === 'frequency' ? 'selected' : ''}
          onClick={() => setMode('frequency')}
        >
          Frequency response
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'memory'}
          className={mode === 'memory' ? 'selected' : ''}
          onClick={() => setMode('memory')}
        >
          Symbol memory
        </button>
      </div>

      <div className="multipath-preset-row">
        <button type="button" onClick={() => setPreset('flat')}>Short weak echo</button>
        <button type="button" onClick={() => setPreset('notch')}>Deep-notch case</button>
        <button type="button" onClick={() => setPreset('long')}>Long echo</button>
      </div>

      <div className="multipath-controls multipath-controls-v2">
        <label>
          <span>
            Echo magnitude{" "}
            <strong><MathExpr tex={'|\\alpha_1|=' + echoGain.toFixed(2)} /></strong>
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={echoGain}
            onChange={(event) => setEchoGain(Number(event.target.value))}
          />
        </label>

        <label>
          <span>
            Excess delay{" "}
            <strong><MathExpr tex={delayUs.toFixed(1) + '\\,\\mu\\mathrm{s}'} /></strong>
          </span>
          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={delayUs}
            onChange={(event) => setDelayUs(Number(event.target.value))}
          />
        </label>

        <label>
          <span>
            Echo phase{" "}
            <strong><MathExpr tex={phase.toFixed(0) + '^\\circ'} /></strong>
          </span>
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

      <div className="multipath-readout metric-card-grid">
        <div className="metric-card">
          <small className="metric-card-label">MEAN EXCESS DELAY</small>
          <strong className="metric-card-value"><MathExpr tex={meanDelay.toFixed(2) + '\\,\\mu\\mathrm{s}'} /></strong>
          <span className="metric-card-formula">power weighted</span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">RMS DELAY SPREAD</small>
          <strong className="metric-card-value"><MathExpr tex={rmsDelay.toFixed(2) + '\\,\\mu\\mathrm{s}'} /></strong>
          <span className="metric-card-formula"><MathExpr tex={String.raw`\sigma_\tau`} /></span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">RESPONSE RIPPLE PERIOD</small>
          <strong className="metric-card-value">
            {Number.isFinite(ripplePeriodMHz)
              ? <MathExpr tex={ripplePeriodMHz.toFixed(3) + '\\,\\mathrm{MHz}'} />
              : '∞'}
          </strong>
          <span className="metric-card-formula"><MathExpr tex={String.raw`\Delta f_{\rm ripple}=1/\tau_e`} /></span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">DELAY / SYMBOL</small>
          <strong className="metric-card-value"><MathExpr tex={delayToSymbol.toFixed(2)} /></strong>
          <span className="metric-card-formula"><MathExpr tex={String.raw`\tau_e/T_s`} /></span>
        </div>
      </div>

      {mode === 'delay' && (
        <div className="multipath-delay-mode">
          <div className="impulse-response-panel impulse-response-panel-v2">
            <div className="visual-caption">
              <span>TWO-TAP CHANNEL</span>
              <strong><MathExpr tex={String.raw`h(\tau)=\delta(\tau)+\alpha_1\delta(\tau-\tau_e)`} /></strong>
            </div>

            <svg viewBox="0 0 440 260" role="img" aria-label="Two-tap channel with direct and delayed complex path">
              <line className="mp-axis" x1="46" y1="205" x2="402" y2="205" />
              <line className="mp-tap direct-tap" x1="95" y1="205" x2="95" y2="62" />
              <circle className="mp-dot direct-dot" cx="95" cy="62" r="6" />

              <line
                className="mp-tap echo-tap"
                x1={95 + delayUs * 22}
                y1="205"
                x2={95 + delayUs * 22}
                y2={205 - echoGain * 143}
              />
              <circle
                className="mp-dot echo-dot"
                cx={95 + delayUs * 22}
                cy={205 - echoGain * 143}
                r="6"
              />

              <text className="mp-label" x="84" y="228">0</text>
              <SvgMathExpr tex={String.raw`\tau_e`} x={84 + delayUs * 22} y={218} width={38} />
              <SvgMathExpr tex={String.raw`|\alpha_1|`} x={111 + delayUs * 22} y={154 - echoGain * 48} width={58} />
              <SvgMathExpr tex={String.raw`\tau`} x={380} y={218} width={26} />
            </svg>

            <div className="mp-tap-phase-note">
              <span>
                Direct tap: <MathExpr tex="1" />
              </span>
              <span>
                Echo tap: <MathExpr tex={'|' + '\\alpha_1|=' + echoGain.toFixed(2)} />{" "}
                at <MathExpr tex={phase.toFixed(0) + '^\\circ'} />
              </span>
            </div>
          </div>

          <div className="multipath-copy-panel">
            <div className="visual-caption">
              <span>COMPLEX-ENVELOPE MAGNITUDE</span>
              <strong>direct copy + delayed echo</strong>
            </div>

            <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label="Direct envelope echo envelope and magnitude of their complex sum">
              <line className="mp-axis" x1={PAD} y1={H - 34} x2={W - PAD} y2={H - 34} />
              <path className="mp-direct-wave" d={copyData.directPath} />
              <path className="mp-echo-wave" d={copyData.echoPath} />
              <path className="mp-sum-wave" d={copyData.combinedPath} />
            </svg>

            <div className="mp-legend">
              <span><i className="mp-direct-key"></i>direct magnitude</span>
              <span><i className="mp-echo-key"></i>echo magnitude</span>
              <span><i className="mp-sum-key"></i>magnitude after complex addition</span>
            </div>

            <p className="mp-panel-note">
              Echo phase không đổi riêng magnitude của echo, nhưng nó đổi magnitude của vector sum ở vùng hai copies overlap.
            </p>
          </div>
        </div>
      )}

      {mode === 'frequency' && (
        <div className="multipath-frequency-mode">
          <div className="multipath-frequency-plot">
            <div className="visual-caption">
              <span>TWO-TAP FREQUENCY RESPONSE</span>
              <strong><MathExpr tex={String.raw`|H(f)|=|1+\alpha_1e^{-j2\pi f\tau_e}|`} /></strong>
            </div>

            <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label="Magnitude response of a two-tap channel versus baseband frequency">
              <line className="mp-axis" x1={PAD} y1={H - 34} x2={W - PAD} y2={H - 34} />
              <line className="mp-frequency-zero" x1={W / 2} y1="22" x2={W / 2} y2={H - 34} />
              <path className="mp-frequency-response" d={frequencyData.plotPath} />
              <line
                className="mp-frequency-probe"
                x1={PAD + ((probeMHz + frequencyData.maxAbsMHz) / (2 * frequencyData.maxAbsMHz)) * (W - 2 * PAD)}
                y1="22"
                x2={PAD + ((probeMHz + frequencyData.maxAbsMHz) / (2 * frequencyData.maxAbsMHz)) * (W - 2 * PAD)}
                y2={H - 34}
              />
              <SvgMathExpr tex={String.raw`-1.5\,\mathrm{MHz}`} x={PAD - 4} y={H - 27} width={76} />
              <SvgMathExpr tex="0" x={W / 2 - 8} y={H - 27} width={18} />
              <SvgMathExpr tex={String.raw`+1.5\,\mathrm{MHz}`} x={W - 112} y={H - 27} width={82} />
            </svg>

            <label className="mp-probe-control">
              <span>
                Probe frequency{" "}
                <strong><MathExpr tex={probeMHz.toFixed(2) + '\\,\\mathrm{MHz}'} /></strong>
              </span>
              <input
                type="range"
                min="-1.5"
                max="1.5"
                step="0.01"
                value={probeMHz}
                onChange={(event) => setProbeMHz(Number(event.target.value))}
              />
            </label>
          </div>

          <div className="multipath-phasor-panel">
            <div className="visual-caption">
              <span>PATH PHASORS AT PROBE FREQUENCY</span>
              <strong>vector addition creates the local channel gain</strong>
            </div>

            <svg viewBox="0 0 390 330" role="img" aria-label="Direct and echo phasors adding to the two-tap channel response">
              <line className="mp-axis" x1="38" y1={phCy} x2="350" y2={phCy} />
              <line className="mp-axis" x1={phCx} y1="30" x2={phCx} y2="300" />

              <line className="mp-phasor-direct" x1={phCx} y1={phCy} x2={directEnd.x} y2={directEnd.y} />
              <circle className="mp-phasor-direct-dot" cx={directEnd.x} cy={directEnd.y} r="5" />

              <line className="mp-phasor-echo" x1={echoStart.x} y1={echoStart.y} x2={echoEnd.x} y2={echoEnd.y} />
              <circle className="mp-phasor-echo-dot" cx={echoEnd.x} cy={echoEnd.y} r="5" />

              <line className="mp-phasor-sum" x1={phCx} y1={phCy} x2={sumEnd.x} y2={sumEnd.y} />
              <circle className="mp-phasor-sum-dot" cx={sumEnd.x} cy={sumEnd.y} r="6" />

              <SvgMathExpr tex={String.raw`\operatorname{Re}`} x={316} y={phCy - 8} width={46} />
              <SvgMathExpr tex={String.raw`\operatorname{Im}`} x={phCx + 8} y={42} width={46} />
            </svg>

            <div className="mp-phasor-readout">
              <span>
                <small>DIRECT</small>
                <strong><MathExpr tex="1" /></strong>
              </span>
              <span>
                <small>ECHO PHASE HERE</small>
                <strong><MathExpr tex={(probe.relativeAngle * 180 / Math.PI).toFixed(1) + '^\\circ'} /></strong>
              </span>
              <span>
                <small><MathExpr tex="|H(f)|" /></small>
                <strong><MathExpr tex={probe.magnitude.toFixed(3)} /></strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {mode === 'memory' && (
        <div className="multipath-memory-mode">
          <div className="multipath-symbol-control">
            <label>
              <span>
                Symbol duration{" "}
                <strong><MathExpr tex={symbolUs.toFixed(1) + '\\,\\mu\\mathrm{s}'} /></strong>
              </span>
              <input
                type="range"
                min="4"
                max="16"
                step="1"
                value={symbolUs}
                onChange={(event) => setSymbolUs(Number(event.target.value))}
              />
            </label>
          </div>

          <div className="multipath-symbol-timeline">
            <div className="visual-caption">
              <span>SYMBOL TIMELINE</span>
              <strong>direct blocks and a delayed echo copy</strong>
            </div>

            <svg
              viewBox={'0 0 ' + symbolPanel.panelW + ' 300'}
              role="img"
              aria-label="Three symbol intervals with a delayed echo spilling across symbol boundaries"
            >
              <line className="mp-axis" x1={symbolPanel.left} y1="244" x2={symbolPanel.panelW - symbolPanel.right} y2="244" />

              {[0, 1, 2, 3].map((index) => {
                const x = symbolPanel.left + index * symbolPanel.symbolWidth;
                return <line key={index} className="mp-symbol-boundary" x1={x} y1="35" x2={x} y2="255" />;
              })}

              {[0, 1, 2].map((index) => {
                const x = symbolPanel.left + index * symbolPanel.symbolWidth + 5;
                return (
                  <g key={'direct-' + index}>
                    <rect
                      className="mp-symbol-direct"
                      x={x}
                      y="72"
                      width={symbolPanel.symbolWidth - 10}
                      height="52"
                    />
                    <text className="mp-symbol-label" x={x + 12} y="103">
                      {'symbol ' + index}
                    </text>
                  </g>
                );
              })}

              {[0, 1, 2].map((index) => {
                const x = symbolPanel.left + index * symbolPanel.symbolWidth + symbolPanel.delayPx + 5;
                const width = Math.min(
                  symbolPanel.symbolWidth - 10,
                  symbolPanel.panelW - symbolPanel.right - x
                );
                if (width <= 0) return null;

                return (
                  <rect
                    key={'echo-' + index}
                    className="mp-symbol-echo"
                    x={x}
                    y="155"
                    width={width}
                    height="42"
                  />
                );
              })}

              <text className="mp-symbol-row-label" x={symbolPanel.left} y="58">direct arrivals</text>
              <text className="mp-symbol-row-label" x={symbolPanel.left} y="145">echo arrivals</text>
              <SvgMathExpr
                tex={String.raw`\tau_e`}
                x={symbolPanel.left + Math.max(symbolPanel.delayPx / 2 - 10, 4)}
                y={205}
                width={34}
              />
            </svg>

            <div className="mp-memory-verdict">
              <span>
                <small>EXCESS DELAY</small>
                <strong><MathExpr tex={delayUs.toFixed(1) + '\\,\\mu\\mathrm{s}'} /></strong>
              </span>
              <span>
                <small>SYMBOL DURATION</small>
                <strong><MathExpr tex={symbolUs.toFixed(1) + '\\,\\mu\\mathrm{s}'} /></strong>
              </span>
              <span>
                <small>RELATIVE MEMORY</small>
                <strong><MathExpr tex={delayToSymbol.toFixed(2)} /></strong>
              </span>
            </div>

            <p className="mp-panel-note">
              Hình này chỉ minh họa support overlap.
              Actual ISI phụ thuộc transmit/receive pulse shapes, sampling instant và equalization, không chỉ một phép so sánh delay với symbol duration.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
