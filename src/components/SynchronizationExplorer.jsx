import { useMemo, useState } from 'react';
import MathExpr, { SvgMathExpr } from './MathExpr.jsx';

const SCS_HZ = 15000;
const USEFUL_US = 1e6 / SCS_HZ;
const W = 620;
const H = 250;
const CX = 310;
const CY = 125;
const R = 78;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

export default function SynchronizationExplorer() {
  const [timingOffset, setTimingOffset] = useState(12);
  const [cfoHz, setCfoHz] = useState(1200);

  const normalizedCfo = cfoHz / SCS_HZ;
  const phaseDriftDeg = 360 * normalizedCfo;
  const displayPhase = ((phaseDriftDeg % 360) + 360) % 360;
  const angle = degToRad(displayPhase);

  const phasorTip = useMemo(() => ({
    x: CX + R * Math.cos(angle),
    y: CY - R * Math.sin(angle),
  }), [angle]);

  const timingPx = clamp(timingOffset, -32, 32) * 5.2;
  const windowX = 250 + timingPx;

  const reset = () => {
    setTimingOffset(0);
    setCfoHz(0);
  };

  return (
    <div className="sync-lab">
      <div className="sync-lab-controls">
        <label>
          <span>
            Timing offset
            <strong><MathExpr tex={String.raw`n_0=${timingOffset}\;\text{samples}`} /></strong>
          </span>
          <input
            type="range"
            min="-32"
            max="32"
            step="1"
            value={timingOffset}
            onChange={(event) => setTimingOffset(Number(event.target.value))}
          />
        </label>

        <label>
          <span>
            Carrier frequency offset
            <strong><MathExpr tex={String.raw`\Delta f_{\mathrm{CFO}}=${cfoHz}\,\mathrm{Hz}`} /></strong>
          </span>
          <input
            type="range"
            min="-3000"
            max="3000"
            step="100"
            value={cfoHz}
            onChange={(event) => setCfoHz(Number(event.target.value))}
          />
        </label>

        <button className="sync-reset-button" type="button" onClick={reset}>
          Bù về 0
        </button>
      </div>

      <div className="sync-lab-readout metric-card-grid">
        <div className="metric-card">
          <small className="metric-card-label">TIMING OFFSET</small>
          <strong className="metric-card-value">{timingOffset}</strong>
          <span className="metric-card-formula"><MathExpr tex={String.raw`n_0\;\text{samples}`} /></span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">NORMALIZED CFO</small>
          <strong className="metric-card-value">{normalizedCfo.toFixed(3)}</strong>
          <span className="metric-card-formula"><MathExpr tex={String.raw`\epsilon=\Delta f_{\mathrm{CFO}}/\Delta f_{\mathrm{SCS}}`} /></span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">PHASE DRIFT / SYMBOL</small>
          <strong className="metric-card-value">{phaseDriftDeg.toFixed(1)}°</strong>
          <span className="metric-card-formula"><MathExpr tex={String.raw`2\pi\Delta f_{\mathrm{CFO}}T_u`} /></span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">USEFUL SYMBOL</small>
          <strong className="metric-card-value">{USEFUL_US.toFixed(2)} µs</strong>
          <span className="metric-card-formula"><MathExpr tex={String.raw`T_u=1/15\,\mathrm{kHz}`} /></span>
        </div>
      </div>

      <div className="sync-lab-grid">
        <div className="sync-lab-panel">
          <div className="visual-caption">
            <span>TIMING</span>
            <strong>FFT window dịch theo sample offset</strong>
          </div>

          <div className="sync-lab-timeline" aria-label="Timing offset làm FFT window dịch so với OFDM symbol">
            <div className="sync-lab-symbol-reference">
              <span className="sync-lab-cp">CP</span>
              <span className="sync-lab-symbol">useful OFDM symbol</span>
            </div>
            <div
              className="sync-lab-window"
              style={{ transform: `translateX(${timingPx}px)` }}
            >
              UE FFT window
            </div>
            <div className="sync-lab-zero">reference boundary</div>
          </div>

          <p className="lab-caption">
            Kéo <MathExpr tex="n_0" /> sang trái/phải để thấy receiver window lệch khỏi reference timing.
            Hình này minh họa vị trí cửa sổ, không mô phỏng đầy đủ ISI/ICI.
          </p>
        </div>

        <div className="sync-lab-panel">
          <div className="visual-caption">
            <span>FREQUENCY</span>
            <strong>phase quay vì residual CFO</strong>
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Phasor rotation do carrier frequency offset trong một useful OFDM symbol">
            <line className="sync-lab-axis" x1="155" y1={CY} x2="465" y2={CY} />
            <line className="sync-lab-axis" x1={CX} y1="28" x2={CX} y2="222" />
            <circle className="sync-lab-circle" cx={CX} cy={CY} r={R} />
            <line className="sync-lab-phasor" x1={CX} y1={CY} x2={phasorTip.x} y2={phasorTip.y} />
            <circle className="sync-lab-tip" cx={phasorTip.x} cy={phasorTip.y} r="5" />
            <SvgMathExpr tex={String.raw`\Delta\phi`} x={phasorTip.x + 8} y={phasorTip.y - 8} width={64} className="sync-lab-svg-label" />
            <SvgMathExpr
              tex={String.raw`\Delta\phi=${phaseDriftDeg.toFixed(1)}^\circ`}
              x={425}
              y={54}
              width={150}
              className="sync-lab-svg-equation"
            />
            <SvgMathExpr
              tex={String.raw`\epsilon=${normalizedCfo.toFixed(3)}`}
              x={425}
              y={92}
              width={126}
              className="sync-lab-svg-equation"
            />
          </svg>

          <p className="lab-caption">
            Với <MathExpr tex={String.raw`\Delta f_{\mathrm{SCS}}=15\,\mathrm{kHz}`} />, phase drift qua một useful symbol tỉ lệ trực tiếp với normalized CFO.
          </p>
        </div>
      </div>

      <div className="sync-lab-interpretation">
        <strong>Khi bấm “Bù về 0”</strong>
        <p>
          Window trở về reference timing và phase drift do CFO trong model này về zero.
          Receiver thật vẫn còn channel, noise, sampling-frequency offset, phase noise và các bước refinement khác.
        </p>
      </div>
    </div>
  );
}
