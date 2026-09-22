import { useMemo, useState } from 'react';

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
  const point = useMemo(() => pointFor(magnitude, totalAngle), [magnitude, totalAngle]);
  const real = magnitude * Math.cos(degToRad(totalAngle));
  const imag = magnitude * Math.sin(degToRad(totalAngle));

  return (
    <div className="phasor-lab">
      <div className="phasor-controls">
        <label>
          <span>Magnitude <strong>A = {magnitude.toFixed(2)}</strong></span>
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
          <span>Phase ban đầu <strong>φ = {phase.toFixed(0)}°</strong></span>
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
          <span>Góc quay do thời gian <strong>ωt = {rotation.toFixed(0)}°</strong></span>
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
          <span>ωt + φ</span>
        </div>
        <div>
          <small>PHẦN THỰC</small>
          <strong>{real.toFixed(3)}</strong>
          <span>A cos(ωt + φ)</span>
        </div>
        <div>
          <small>PHẦN ẢO</small>
          <strong>{imag.toFixed(3)}</strong>
          <span>A sin(ωt + φ)</span>
        </div>
        <div>
          <small>ĐỘ LỚN</small>
          <strong>{magnitude.toFixed(2)}</strong>
          <span>√(Re² + Im²)</span>
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

          <text className="phasor-angle-label" x={CX + 48} y={CY - 18}>ωt + φ</text>

          <text className="phasor-value-label" x={point.x + 8} y={CY - 8}>
            Re = {real.toFixed(2)}
          </text>
          <text className="phasor-value-label" x={CX + 8} y={point.y - 8}>
            Im = {imag.toFixed(2)}
          </text>

          <text className="phasor-formula-label" x="475" y="88">z(t) = A eʲ⁽ωᵗ⁺φ⁾</text>
          <text className="phasor-formula-label" x="475" y="125">= A cos(ωt+φ)</text>
          <text className="phasor-formula-label" x="475" y="156">+ j A sin(ωt+φ)</text>
          <text className="phasor-side-note" x="475" y="214">Giữ A cố định</text>
          <text className="phasor-side-note" x="475" y="236">và tăng ωt:</text>
          <text className="phasor-side-note" x="475" y="258">vector quay trên</text>
          <text className="phasor-side-note" x="475" y="280">mặt phẳng phức.</text>
        </svg>
      </div>
    </div>
  );
}
