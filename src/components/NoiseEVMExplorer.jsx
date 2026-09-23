import { useMemo, useState } from 'react';
import MathExpr, { SvgMathExpr } from './MathExpr.jsx';

const refs = [
  { i: 1 / Math.sqrt(2), q: 1 / Math.sqrt(2) },
  { i: -1 / Math.sqrt(2), q: 1 / Math.sqrt(2) },
  { i: -1 / Math.sqrt(2), q: -1 / Math.sqrt(2) },
  { i: 1 / Math.sqrt(2), q: -1 / Math.sqrt(2) },
];

function deterministicNoise(index, salt) {
  const a = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  const b = Math.sin(index * 4.123 + salt * 19.17) * 9631.417;
  return ((a - Math.floor(a)) + (b - Math.floor(b)) - 1);
}

export default function NoiseEVMExplorer() {
  const [noiseLevel, setNoiseLevel] = useState(0.12);
  const [phaseError, setPhaseError] = useState(0);

  const samples = useMemo(() => {
    const phase = phaseError * Math.PI / 180;
    return Array.from({ length: 120 }, (_, n) => {
      const ref = refs[n % refs.length];
      const ri = ref.i * Math.cos(phase) - ref.q * Math.sin(phase);
      const rq = ref.i * Math.sin(phase) + ref.q * Math.cos(phase);
      const ni = deterministicNoise(n, 1) * noiseLevel;
      const nq = deterministicNoise(n, 2) * noiseLevel;
      return { ref, i: ri + ni, q: rq + nq };
    });
  }, [noiseLevel, phaseError]);

  const metrics = useMemo(() => {
    let signalPower = 0;
    let errorPower = 0;
    for (const s of samples) {
      signalPower += s.ref.i * s.ref.i + s.ref.q * s.ref.q;
      const ei = s.i - s.ref.i;
      const eq = s.q - s.ref.q;
      errorPower += ei * ei + eq * eq;
    }
    signalPower /= samples.length;
    errorPower /= samples.length;
    const evm = Math.sqrt(errorPower / signalPower);
    const snr = errorPower > 0 ? 10 * Math.log10(signalPower / errorPower) : 99;
    return { signalPower, errorPower, evm, snr };
  }, [samples]);

  const cx = 190;
  const cy = 185;
  const scale = 120;

  return (
    <div className="noise-evm-lab">
      <div className="noise-controls">
        <label>
          <span>Noise level <strong>{noiseLevel.toFixed(2)}</strong></span>
          <input type="range" min="0" max="0.4" step="0.01" value={noiseLevel}
            onChange={(e) => setNoiseLevel(Number(e.target.value))} />
        </label>
        <label>
          <span>Common phase error <strong><MathExpr tex={`${phaseError.toFixed(0)}^\\circ`} /></strong></span>
          <input type="range" min="-30" max="30" step="1" value={phaseError}
            onChange={(e) => setPhaseError(Number(e.target.value))} />
        </label>
      </div>

      <div className="noise-readout">
        <div><small>SIGNAL POWER</small><strong>{metrics.signalPower.toFixed(3)}</strong><span>normalized</span></div>
        <div><small>ERROR POWER</small><strong>{metrics.errorPower.toFixed(4)}</strong><span>noise + phase error</span></div>
        <div><small>SNR-LIKE RATIO</small><strong><MathExpr tex={`${metrics.snr.toFixed(1)}\\,\\mathrm{dB}`} /></strong><span>from total error power</span></div>
        <div><small>EVM RMS</small><strong>{(metrics.evm * 100).toFixed(1)}%</strong><span>normalized to reference power</span></div>
      </div>

      <div className="noise-constellation-wrap">
        <div className="visual-caption"><span>QPSK CONSTELLATION</span><strong>ideal vs received</strong></div>
        <svg viewBox="0 0 380 370" role="img" aria-label="QPSK constellation with noise and common phase error">
          <line className="noise-axis" x1="32" y1={cy} x2="348" y2={cy} />
          <line className="noise-axis" x1={cx} y1="28" x2={cx} y2="340" />
          {refs.map((p, idx) => (
            <circle key={idx} className="noise-ideal-point" cx={cx + p.i * scale} cy={cy - p.q * scale} r="7" />
          ))}
          {samples.map((p, idx) => (
            <circle key={idx} className="noise-rx-point" cx={cx + p.i * scale} cy={cy - p.q * scale} r="2.5" />
          ))}
          <SvgMathExpr tex="I" x={330} y={cy - 8} width={24} />
          <SvgMathExpr tex="Q" x={cx + 8} y={40} width={24} />
        </svg>
      </div>
      <p className="noise-lab-note">
        SNR và EVM ở demo này được tính từ cùng reference symbols. Khi chỉ có additive error và normalization nhất quán,
        chúng liên hệ gần như <MathExpr tex={`\\mathrm{EVM}\\approx1/\\sqrt{\\mathrm{SNR}}`} /> theo dạng linear. Hệ đo thực tế có thể còn channel, equalizer, filtering,
        synchronization và convention chuẩn hóa khác.
      </p>
    </div>
  );
}
