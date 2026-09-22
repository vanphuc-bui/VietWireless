import { useMemo, useState } from 'react';

const W = 760;
const H = 210;
const PAD = 28;
const N = 128;

function wavePath(k, spacingScale, phase = 0) {
  const pts = [];
  for (let n = 0; n <= N; n += 1) {
    const t = n / N;
    const x = PAD + t * (W - 2 * PAD);
    const y = H / 2 - 65 * Math.cos(2 * Math.PI * k * spacingScale * t + phase);
    pts.push(`${n === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return pts.join(' ');
}

export default function OFDMOrthogonalityExplorer() {
  const [k1, setK1] = useState(2);
  const [k2, setK2] = useState(3);
  const [spacingScale, setSpacingScale] = useState(1);

  const inner = useMemo(() => {
    let re = 0;
    let im = 0;
    for (let n = 0; n < N; n += 1) {
      const t = n / N;
      const angle = 2 * Math.PI * (k1 - k2) * spacingScale * t;
      re += Math.cos(angle);
      im += Math.sin(angle);
    }
    return Math.hypot(re / N, im / N);
  }, [k1, k2, spacingScale]);

  const p1 = useMemo(() => wavePath(k1, spacingScale), [k1, spacingScale]);
  const p2 = useMemo(() => wavePath(k2, spacingScale), [k2, spacingScale]);

  return (
    <div className="ofdm-orthogonality-lab">
      <div className="ofdm-orth-controls">
        <label>
          <span>Subcarrier k₁ <strong>{k1}</strong></span>
          <input type="range" min="1" max="5" step="1" value={k1}
            onChange={(e) => setK1(Number(e.target.value))} />
        </label>
        <label>
          <span>Subcarrier k₂ <strong>{k2}</strong></span>
          <input type="range" min="1" max="5" step="1" value={k2}
            onChange={(e) => setK2(Number(e.target.value))} />
        </label>
        <label>
          <span>Spacing / (1/Tᵤ) <strong>{spacingScale.toFixed(2)}</strong></span>
          <input type="range" min="0.75" max="1.25" step="0.01" value={spacingScale}
            onChange={(e) => setSpacingScale(Number(e.target.value))} />
        </label>
      </div>

      <div className="ofdm-orth-readout">
        <div><small>USEFUL DURATION</small><strong>Tᵤ = 1</strong><span>normalized</span></div>
        <div><small>IDEAL SPACING</small><strong>Δf = 1/Tᵤ</strong><span>orthogonal grid</span></div>
        <div><small>|INNER PRODUCT|</small><strong>{inner.toFixed(3)}</strong><span>0 là orthogonal</span></div>
        <div className={inner < 0.03 ? 'ok' : 'warning'}><small>STATUS</small><strong>{inner < 0.03 ? 'Gần trực giao' : 'Mất trực giao'}</strong><span>trên interval Tᵤ</span></div>
      </div>

      <div className="ofdm-orth-wave">
        <div className="visual-caption"><span>REAL PART OVER ONE USEFUL SYMBOL</span><strong>hai complex exponentials</strong></div>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Two subcarriers across one useful OFDM symbol duration">
          <line className="ofdm-orth-axis" x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} />
          <path className="ofdm-orth-wave-a" d={p1} />
          <path className="ofdm-orth-wave-b" d={p2} />
        </svg>
        <div className="ofdm-orth-legend">
          <span><i className="a"></i> k₁ = {k1}</span>
          <span><i className="b"></i> k₂ = {k2}</span>
        </div>
      </div>
    </div>
  );
}
