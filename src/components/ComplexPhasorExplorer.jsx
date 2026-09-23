import { useMemo, useState } from 'react';
import MathExpr, { SvgMathExpr } from './MathExpr.jsx';

const W = 760;
const H = 360;
const CX = 250;
const CY = 180;
const RMAX = 120;

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

function pointFor(magnitude, angleDeg) {
  const angle = degToRad(angleDeg);
  return {
    x: CX + RMAX * magnitude * Math.cos(angle),
    y: CY - RMAX * magnitude * Math.sin(angle),
  };
}

export default function ComplexPhasorExplorer() {
  const [magnitude, setMagnitude] = useState(0.85);
  const [phase, setPhase] = useState(30);
  const [rotation, setRotation] = useState(0);

  const totalAngle = phase + rotation;
  const displayAngle = ((totalAngle + 180) % 360 + 360) % 360 - 180;
  const point = useMemo(() => pointFor(magnitude, totalAngle), [magnitude, totalAngle]);
  const real = magnitude * Math.cos(degToRad(totalAngle));
  const imag = magnitude * Math.sin(degToRad(totalAngle));

  return (
    <div className="phasor-lab">
      <div className="phasor-controls">
        <label>
          <span>Magnitude <strong><MathExpr tex={`A=${magnitude.toFixed(2)}`} /></strong></span>
          <input
            type="range"
            min="0.25"
            max="1"
            step="0.05"
            value={magnitude}
            onChange={(event) => setMagnitude(Number(event.target.value))}
          />
        </label>
        <label>
          <span>Phase ban đầu <strong><MathExpr tex={`\\phi=${phase.toFixed(0)}^\\circ`} /></strong></span>
          <input
            type="range"
            min="-180"
            max="180"
            step="15"
            value={phase}
            onChange={(event) => setPhase(Number(event.target.value))}
          />
        </label>
        <label>
          <span>Góc quay do thời gian <strong><MathExpr tex={`\\omega t=${rotation.toFixed(0)}^\\circ`} /></strong></span>
          <input
            type="range"
            min="0"
            max="360"
            step="5"
            value={rotation}
            onChange={(event) => setRotation(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="phasor-readout">
        <div>
          <small>TỔNG GÓC</small>
          <strong>{totalAngle.toFixed(0)}°</strong>
          <span><MathExpr tex={`\omega t+\phi`} /></span>
        </div>
        <div>
          <small>PHẦN THỰC</small>
          <strong>{real.toFixed(3)}</strong>
          <span><MathExpr tex={`A\cos(\omega t+\phi)`} /></span>
        </div>
        <div>
          <small>PHẦN ẢO</small>
          <strong>{imag.toFixed(3)}</strong>
          <span><MathExpr tex={`A\sin(\omega t+\phi)`} /></span>
        </div>
        <div>
          <small>ĐỘ LỚN</small>
          <strong>{magnitude.toFixed(2)}</strong>
          <span><MathExpr tex={`\sqrt{\operatorname{Re}^2+\operatorname{Im}^2}`} /></span>
        </div>
      </div>

      <div className="phasor-plot">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Vector phức với phần thực, phần ảo, magnitude và phase">
          <line className="phasor-axis" x1="70" y1={CY} x2="430" y2={CY} />
          <line className="phasor-axis" x1={CX} y1="25" x2={CX} y2="335" />
          <text className="phasor-label" x="408" y={CY - 10}>Re</text>
          <text className="phasor-label" x={CX + 10} y="42">Im</text>

          <circle className="phasor-guide-circle" cx={CX} cy={CY} r={RMAX * magnitude} />

          <line className="phasor-projection" x1={point.x} y1={point.y} x2={point.x} y2={CY} />
          <line className="phasor-projection" x1={point.x} y1={point.y} x2={CX} y2={point.y} />

          <line className="phasor-vector" x1={CX} y1={CY} x2={point.x} y2={point.y} />
          <circle className="phasor-tip" cx={point.x} cy={point.y} r="6" />

          <path
            className="phasor-angle"
            d={`M ${CX + 42} ${CY} A 42 42 0 ${Math.abs(totalAngle % 360) > 180 ? 1 : 0} ${totalAngle >= 0 ? 0 : 1} ${CX + 42 * Math.cos(degToRad(totalAngle))} ${CY - 42 * Math.sin(degToRad(totalAngle))}`}
          />

          <SvgMathExpr tex={`\omega t+\phi`} x={CX + 48} y={CY - 18} width={86} />

          <text className="phasor-value-label" x={point.x + 8} y={CY - 8}>
            Re = {real.toFixed(2)}
          </text>
          <text className="phasor-value-label" x={CX + 8} y={point.y - 8}>
            Im = {imag.toFixed(2)}
          </text>

          <SvgMathExpr tex={`z(t)=Ae^{j(\omega t+\phi)}`} x={475} y={88} width={205} />
          <SvgMathExpr tex={`=A\cos(\omega t+\phi)`} x={475} y={125} width={180} />
          <SvgMathExpr tex={`+jA\sin(\omega t+\phi)`} x={475} y={156} width={185} />
          <text className="phasor-side-note" x="475" y="214">Giữ magnitude cố định</text>
          <text className="phasor-side-note" x="475" y="236">và tăng góc quay:</text>
          <text className="phasor-side-note" x="475" y="258">vector quay trên</text>
          <text className="phasor-side-note" x="475" y="280">mặt phẳng phức.</text>
        </svg>
      </div>
    </div>
  );
}
