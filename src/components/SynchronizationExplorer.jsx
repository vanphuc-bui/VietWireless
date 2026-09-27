import { useMemo, useState } from 'react';
import MathExpr, { SvgMathExpr } from './MathExpr.jsx';

const SCS_HZ = 15000;
const USEFUL_US = 1e6 / SCS_HZ;
const W = 620;
const H = 250;
const CX = 310;
const CY = 125;
const R = 78;
const CONST_SIZE = 260;
const CONST_C = CONST_SIZE / 2;
const CONST_SCALE = 82;

const QPSK_POINTS = [
  { i: -1, q: -1 },
  { i: -1, q: 1 },
  { i: 1, q: -1 },
  { i: 1, q: 1 },
].map((point) => ({
  i: point.i / Math.sqrt(2),
  q: point.q / Math.sqrt(2),
}));

const QAM16_POINTS = [-3, -1, 1, 3]
  .flatMap((i) => [-3, -1, 1, 3].map((q) => ({ i, q })))
  .map((point) => ({
    i: point.i / Math.sqrt(10),
    q: point.q / Math.sqrt(10),
  }));

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

function rotatePoint(point, angleRad) {
  return {
    i: point.i * Math.cos(angleRad) - point.q * Math.sin(angleRad),
    q: point.i * Math.sin(angleRad) + point.q * Math.cos(angleRad),
  };
}

function constellationSvgPoint(point) {
  return {
    x: CONST_C + point.i * CONST_SCALE,
    y: CONST_C - point.q * CONST_SCALE,
  };
}

function iciLikeOffset(point, normalizedCfo, pointIndex, cloudIndex) {
  const strength = Math.min(Math.abs(normalizedCfo) / 0.2, 1);
  const radial = 0.015 + 0.085 * strength;
  const phase = 0.92 * pointIndex + 1.37 * cloudIndex;
  const couplingI = 0.55 * point.q + 0.24 * point.i;
  const couplingQ = -0.48 * point.i + 0.18 * point.q;

  return {
    i: radial * (0.55 * Math.cos(phase) + strength * couplingI),
    q: radial * (0.55 * Math.sin(phase) + strength * couplingQ),
  };
}

export default function SynchronizationExplorer() {
  const [timingOffset, setTimingOffset] = useState(12);
  const [cfoHz, setCfoHz] = useState(1200);
  const [modulation, setModulation] = useState('16qam');
  const [symbolIndex, setSymbolIndex] = useState(3);
  const [cfoCorrection, setCfoCorrection] = useState(false);

  const normalizedCfo = cfoHz / SCS_HZ;
  const phaseDriftDeg = 360 * normalizedCfo;
  const phaseDriftRad = degToRad(phaseDriftDeg);
  const totalRotationDeg = phaseDriftDeg * symbolIndex;
  const residualFactor = cfoCorrection ? 0.05 : 1;
  const residualRotationDeg = totalRotationDeg * residualFactor;
  const residualRotationRad = degToRad(residualRotationDeg);
  const residualNormalizedCfo = normalizedCfo * residualFactor;
  const displayPhase = ((phaseDriftDeg % 360) + 360) % 360;
  const angle = degToRad(displayPhase);

  const phasorTip = useMemo(() => ({
    x: CX + R * Math.cos(angle),
    y: CY - R * Math.sin(angle),
  }), [angle]);

  const timingPx = clamp(timingOffset, -32, 32) * 5.2;
  const constellation = modulation === 'qpsk' ? QPSK_POINTS : QAM16_POINTS;

  const constellationData = useMemo(() => (
    constellation.map((point, pointIndex) => {
      const idealSvg = constellationSvgPoint(point);
      const rotated = rotatePoint(point, residualRotationRad);
      const receivedSvg = constellationSvgPoint(rotated);
      const cloud = Array.from({ length: 5 }, (_, cloudIndex) => {
        const offset = iciLikeOffset(rotated, residualNormalizedCfo, pointIndex, cloudIndex);
        return constellationSvgPoint({
          i: rotated.i + offset.i,
          q: rotated.q + offset.q,
        });
      });

      return {
        idealSvg,
        receivedSvg,
        cloud,
      };
    })
  ), [constellation, residualNormalizedCfo, residualRotationRad]);

  const reset = () => {
    setTimingOffset(0);
    setCfoHz(0);
    setSymbolIndex(0);
    setCfoCorrection(false);
  };

  return (
    <div className="sync-lab">
      <div className="sync-lab-controls">
        <label>
          <span>Timing offset{" "}<strong><MathExpr tex={String.raw`n_0=${timingOffset}\;\text{samples}`} /></strong></span>
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
          <span>Carrier frequency offset{" "}<strong><MathExpr tex={String.raw`\Delta f_{\mathrm{CFO}}=${cfoHz}\,\mathrm{Hz}`} /></strong></span>
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

      <div className="sync-constellation-block">
        <div className="visual-caption">
          <span>CONSTELLATION</span>
          <strong>CFO nhìn trực tiếp trên QPSK / 16-QAM</strong>
        </div>

        <div className="sync-constellation-controls">
          <div className="sync-modulation-select" role="group" aria-label="Chọn modulation">
            <button
              type="button"
              className={modulation === 'qpsk' ? 'selected' : ''}
              onClick={() => setModulation('qpsk')}
            >
              QPSK
            </button>
            <button
              type="button"
              className={modulation === '16qam' ? 'selected' : ''}
              onClick={() => setModulation('16qam')}
            >
              16-QAM
            </button>
          </div>

          <label className="sync-symbol-index-control">
            <span>OFDM symbol index{" "}<strong><MathExpr tex={String.raw`m=${symbolIndex}`} /></strong></span>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={symbolIndex}
              onChange={(event) => setSymbolIndex(Number(event.target.value))}
            />
          </label>

          <label className="sync-correction-control">
            <input
              type="checkbox"
              checked={cfoCorrection}
              onChange={(event) => setCfoCorrection(event.target.checked)}
            />
            <span>CFO correction</span>
          </label>
        </div>

        <div className="sync-constellation-readout">
          <span>Rotation mỗi symbol: <strong>{phaseDriftDeg.toFixed(1)}°</strong></span>
          <span>Tại <MathExpr tex={String.raw`m=${symbolIndex}`} />: <strong>{totalRotationDeg.toFixed(1)}°</strong></span>
          <span>Residual sau correction: <strong>{residualRotationDeg.toFixed(1)}°</strong></span>
        </div>

        <div className="sync-constellation-grid">
          <div className="sync-constellation-panel">
            <div className="sync-constellation-title">Ideal {modulation === 'qpsk' ? 'QPSK' : '16-QAM'}</div>
            <svg viewBox={`0 0 ${CONST_SIZE} ${CONST_SIZE}`} role="img" aria-label="Ideal constellation">
              <line className="sync-const-axis" x1="22" y1={CONST_C} x2={CONST_SIZE - 22} y2={CONST_C} />
              <line className="sync-const-axis" x1={CONST_C} y1="22" x2={CONST_C} y2={CONST_SIZE - 22} />
              <SvgMathExpr tex="I" x={CONST_SIZE - 34} y={CONST_C - 8} width={24} className="sync-const-axis-math" />
              <SvgMathExpr tex="Q" x={CONST_C + 8} y={30} width={24} className="sync-const-axis-math" />
              {constellationData.map((point, index) => (
                <circle
                  key={`ideal-${index}`}
                  className="sync-const-point ideal"
                  cx={point.idealSvg.x}
                  cy={point.idealSvg.y}
                  r="5"
                />
              ))}
            </svg>
          </div>

          <div className="sync-constellation-panel received-panel">
            <div className="sync-constellation-title">
              Received {cfoCorrection ? 'sau CFO correction' : 'với residual CFO'}
            </div>
            <svg viewBox={`0 0 ${CONST_SIZE} ${CONST_SIZE}`} role="img" aria-label="Received constellation affected by carrier frequency offset">
              <line className="sync-const-axis" x1="22" y1={CONST_C} x2={CONST_SIZE - 22} y2={CONST_C} />
              <line className="sync-const-axis" x1={CONST_C} y1="22" x2={CONST_C} y2={CONST_SIZE - 22} />
              <SvgMathExpr tex="I" x={CONST_SIZE - 34} y={CONST_C - 8} width={24} className="sync-const-axis-math" />
              <SvgMathExpr tex="Q" x={CONST_C + 8} y={30} width={24} className="sync-const-axis-math" />

              {constellationData.map((point, index) => (
                <g key={`received-${index}`}>
                  <circle
                    className="sync-const-point ghost"
                    cx={point.idealSvg.x}
                    cy={point.idealSvg.y}
                    r="4"
                  />
                  <line
                    className="sync-const-link"
                    x1={point.idealSvg.x}
                    y1={point.idealSvg.y}
                    x2={point.receivedSvg.x}
                    y2={point.receivedSvg.y}
                  />
                  {point.cloud.map((cloudPoint, cloudIndex) => (
                    <circle
                      key={`cloud-${index}-${cloudIndex}`}
                      className="sync-const-cloud"
                      cx={cloudPoint.x}
                      cy={cloudPoint.y}
                      r="2.3"
                    />
                  ))}
                  <circle
                    className="sync-const-point received"
                    cx={point.receivedSvg.x}
                    cy={point.receivedSvg.y}
                    r="5"
                  />
                </g>
              ))}
            </svg>
          </div>
        </div>

        <div className="sync-constellation-legend">
          <span><i className="const-key ideal"></i> ideal point</span>
          <span><i className="const-key ghost"></i> ideal reference</span>
          <span><i className="const-key received"></i> rotated received point</span>
          <span><i className="const-key cloud"></i> ICI-like spread</span>
        </div>

        <div className="sync-constellation-note">
          <strong>Cách đọc constellation</strong>
          <p>
            Với CFO nhỏ, hiệu ứng dễ nhìn nhất là common phase rotation: toàn bộ constellation quay dần khi <MathExpr tex="m" /> tăng.
            Khi normalized CFO lớn hơn, OFDM còn mất orthogonality giữa các subcarriers, nên lab thêm một ICI-like spread để minh họa xu hướng méo.
            Phần spread này là trực giác hóa, không phải full OFDM link simulation.
          </p>
        </div>
      </div>

      <div className="sync-lab-interpretation">
        <strong>Khi bấm “Bù về 0”</strong>
        <p>
          Window trở về reference timing và CFO của model về zero.
          Nếu chỉ bật <strong>CFO correction</strong>, lab giữ timing offset hiện tại nhưng gần như loại bỏ common phase rotation và ICI-like spread do CFO.
          Receiver thật vẫn còn channel, noise, sampling-frequency offset, phase noise và các bước refinement khác.
        </p>
      </div>
    </div>
  );
}
