import { useMemo, useState } from 'react';
import MathExpr, { SvgMathExpr } from './MathExpr.jsx';

const PLANE_W = 460;
const PLANE_H = 360;
const CX = 220;
const CY = 180;
const RMAX = 125;

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

function normalizeAngle(deg) {
  return ((deg + 180) % 360 + 360) % 360 - 180;
}

function pointFor(magnitude, angleDeg) {
  const angle = degToRad(angleDeg);
  return {
    x: CX + RMAX * magnitude * Math.cos(angle),
    y: CY - RMAX * magnitude * Math.sin(angle),
  };
}

function waveformPath(magnitude, phaseDeg) {
  const points = [];
  const width = 280;
  const height = 150;
  const left = 18;
  const right = 12;
  const mid = 75;
  const amp = 48 * magnitude;

  for (let i = 0; i <= 260; i += 1) {
    const thetaDeg = (i / 260) * 360;
    const x = left + (i / 260) * (width - left - right);
    const y = mid - amp * Math.cos(degToRad(thetaDeg + phaseDeg));
    points.push((i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2));
  }

  return points.join(' ');
}

function complexTex(real, imag) {
  const sign = imag >= 0 ? '+' : '-';
  return 'z=' + real.toFixed(3) + sign + 'j' + Math.abs(imag).toFixed(3);
}

export default function ComplexPhasorExplorer() {
  const [mode, setMode] = useState('static');
  const [magnitude, setMagnitude] = useState(0.85);
  const [phase, setPhase] = useState(30);
  const [rotation, setRotation] = useState(90);

  const activeAngle = mode === 'static' ? phase : phase + rotation;
  const principalAngle = normalizeAngle(activeAngle);
  const point = useMemo(
    () => pointFor(magnitude, activeAngle),
    [magnitude, activeAngle]
  );

  const real = magnitude * Math.cos(degToRad(activeAngle));
  const imag = magnitude * Math.sin(degToRad(activeAngle));
  const wavePath = useMemo(
    () => waveformPath(magnitude, phase),
    [magnitude, phase]
  );

  const waveMarkerX = 18 + (rotation / 360) * (280 - 18 - 12);
  const waveMarkerY = 75 - 48 * magnitude * Math.cos(degToRad(rotation + phase));
  const angleArcEnd = {
    x: CX + 42 * Math.cos(degToRad(activeAngle)),
    y: CY - 42 * Math.sin(degToRad(activeAngle)),
  };

  const cartesianTex = complexTex(real, imag);
  const polarTex = 'z='
    + magnitude.toFixed(2)
    + 'e^{j'
    + principalAngle.toFixed(0)
    + '^\\circ}';

  const rotatingTex = 'z(t)='
    + magnitude.toFixed(2)
    + 'e^{j('
    + phase.toFixed(0)
    + '^\\circ+'
    + rotation.toFixed(0)
    + '^\\circ)}';

  return (
    <div className="phasor-lab phasor-lab-v2">
      <div className="phasor-mode-tabs" role="tablist" aria-label="Chọn static complex number hoặc rotating complex exponential">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'static'}
          className={mode === 'static' ? 'selected' : ''}
          onClick={() => setMode('static')}
        >
          Static complex number
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'rotating'}
          className={mode === 'rotating' ? 'selected' : ''}
          onClick={() => setMode('rotating')}
        >
          Rotating complex exponential
        </button>
      </div>

      <div className="phasor-controls phasor-controls-v2">
        <label>
          <span>Magnitude <strong><MathExpr tex={'A=' + magnitude.toFixed(2)} /></strong></span>
          <input
            type="range"
            min="0.2"
            max="1"
            step="0.05"
            value={magnitude}
            onChange={(event) => setMagnitude(Number(event.target.value))}
          />
        </label>

        <label>
          <span>Initial phase <strong><MathExpr tex={'\\phi=' + phase.toFixed(0) + '^\\circ'} /></strong></span>
          <input
            type="range"
            min="-180"
            max="180"
            step="15"
            value={phase}
            onChange={(event) => setPhase(Number(event.target.value))}
          />
        </label>

        <label className={mode === 'static' ? 'disabled' : ''}>
          <span>Rotation <strong><MathExpr tex={'\\omega t=' + rotation.toFixed(0) + '^\\circ'} /></strong></span>
          <input
            type="range"
            min="0"
            max="360"
            step="5"
            value={rotation}
            disabled={mode === 'static'}
            onChange={(event) => setRotation(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="phasor-current-formula">
        <small>{mode === 'static' ? 'STATIC POINT' : 'TIME-DEPENDENT POINT'}</small>
        <strong>
          <MathExpr tex={mode === 'static' ? polarTex : rotatingTex} />
        </strong>
        <span>
          {mode === 'static'
            ? 'magnitude + phase xác định một point cố định'
            : 'initial phase + rotation angle xác định vị trí hiện tại'}
        </span>
      </div>

      <div className="phasor-readout metric-card-grid">
        <div className="metric-card">
          <small className="metric-card-label">REAL PART</small>
          <strong className="metric-card-value"><MathExpr tex={real.toFixed(3)} /></strong>
          <span className="metric-card-formula"><MathExpr tex={String.raw`A\cos\theta`} /></span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">IMAGINARY PART</small>
          <strong className="metric-card-value"><MathExpr tex={imag.toFixed(3)} /></strong>
          <span className="metric-card-formula"><MathExpr tex={String.raw`A\sin\theta`} /></span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">MAGNITUDE</small>
          <strong className="metric-card-value"><MathExpr tex={magnitude.toFixed(2)} /></strong>
          <span className="metric-card-formula"><MathExpr tex={String.raw`|z|=\sqrt{a^2+b^2}`} /></span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">PRINCIPAL ANGLE</small>
          <strong className="metric-card-value"><MathExpr tex={principalAngle.toFixed(0) + '^\\circ'} /></strong>
          <span className="metric-card-formula">{mode === 'static' ? 'arg(z)' : 'wrapped current angle'}</span>
        </div>
      </div>

      <div className="phasor-explorer-grid">
        <div className="phasor-plane-panel">
          <div className="visual-caption">
            <span>COMPLEX PLANE</span>
            <strong>{mode === 'static' ? 'một point cố định' : 'vị trí hiện tại của rotating vector'}</strong>
          </div>

          <svg viewBox={'0 0 ' + PLANE_W + ' ' + PLANE_H} role="img" aria-label="Complex plane với vector magnitude phase và Cartesian projections">
            <line className="phasor-axis" x1="42" y1={CY} x2="430" y2={CY} />
            <line className="phasor-axis" x1={CX} y1="25" x2={CX} y2="335" />
            <SvgMathExpr tex={String.raw`\operatorname{Re}`} x={402} y={CY - 11} width={44} className="phasor-svg-axis" />
            <SvgMathExpr tex={String.raw`\operatorname{Im}`} x={CX + 9} y={40} width={44} className="phasor-svg-axis" />

            <circle className="phasor-guide-circle" cx={CX} cy={CY} r={RMAX * magnitude} />
            <line className="phasor-projection" x1={point.x} y1={point.y} x2={point.x} y2={CY} />
            <line className="phasor-projection" x1={point.x} y1={point.y} x2={CX} y2={point.y} />
            <line className="phasor-vector" x1={CX} y1={CY} x2={point.x} y2={point.y} />
            <circle className="phasor-tip" cx={point.x} cy={point.y} r="6" />

            <path
              className="phasor-angle"
              d={
                'M ' + (CX + 42) + ' ' + CY
                + ' A 42 42 0 '
                + (Math.abs(activeAngle % 360) > 180 ? 1 : 0)
                + ' ' + (activeAngle >= 0 ? 0 : 1)
                + ' ' + angleArcEnd.x
                + ' ' + angleArcEnd.y
              }
            />

            <SvgMathExpr tex="A" x={(CX + point.x) / 2 - 8} y={(CY + point.y) / 2 - 9} width={24} />
            <SvgMathExpr tex={String.raw`\theta`} x={CX + 48} y={CY - 20} width={32} />
            <SvgMathExpr
              tex={'a=' + real.toFixed(2)}
              x={point.x - 34}
              y={CY + 20}
              width={72}
              className="phasor-svg-value"
            />
            <SvgMathExpr
              tex={'b=' + imag.toFixed(2)}
              x={CX + 7}
              y={point.y - 10}
              width={72}
              className="phasor-svg-value"
            />
          </svg>
        </div>

        <aside className="phasor-side-panel">
          {mode === 'static' ? (
            <>
              <span className="card-label">SAME POINT, TWO FORMS</span>
              <div className="phasor-form-pair">
                <div>
                  <small>CARTESIAN</small>
                  <strong><MathExpr tex={cartesianTex} /></strong>
                </div>
                <div>
                  <small>POLAR / EXPONENTIAL</small>
                  <strong><MathExpr tex={polarTex} /></strong>
                </div>
              </div>

              <div className="phasor-periodicity-note">
                <small>ANGLE PERIODICITY</small>
                <strong>
                  <MathExpr tex={principalAngle.toFixed(0) + '^\\circ'} />
                  {' '}≡{' '}
                  <MathExpr tex={(principalAngle + 360).toFixed(0) + '^\\circ'} />
                </strong>
                <p>Hai angle khác nhau đúng một vòng quay mô tả cùng complex point.</p>
              </div>
            </>
          ) : (
            <>
              <span className="card-label">REAL PROJECTION</span>
              <h3><MathExpr tex={String.raw`\operatorname{Re}\{z(t)\}=A\cos(\omega t+\phi)`} /></h3>

              <svg className="phasor-wave-preview" viewBox="0 0 280 150" role="img" aria-label="Real projection của rotating complex exponential trong một vòng quay">
                <line x1="18" y1="75" x2="268" y2="75" className="phasor-wave-axis" />
                <path d={wavePath} className="phasor-wave-path" />
                <line
                  x1={waveMarkerX}
                  y1="22"
                  x2={waveMarkerX}
                  y2="128"
                  className="phasor-wave-marker"
                />
                <circle
                  cx={waveMarkerX}
                  cy={waveMarkerY}
                  r="5"
                  className="phasor-wave-dot"
                />
                <SvgMathExpr tex={String.raw`\omega t`} x={220} y={135} width={42} />
              </svg>

              <div className="phasor-projection-readout">
                <small>CURRENT REAL VALUE</small>
                <strong><MathExpr tex={real.toFixed(3)} /></strong>
                <span>đúng bằng horizontal projection của vector trên complex plane</span>
              </div>
            </>
          )}
        </aside>
      </div>

      <p className="phasor-lab-caption">
        {mode === 'static'
          ? <>Static mode không có time dependence. Đây chỉ là một complex number <MathExpr tex={String.raw`z=Ae^{j\phi}`} />.</>
          : <>Rotating mode thêm <MathExpr tex={String.raw`\omega t`} /> vào angle. Object lúc này là <MathExpr tex={String.raw`z(t)=Ae^{j(\omega t+\phi)}`} />, chưa phải phasor cố định.</>}
      </p>
    </div>
  );
}
