import { useMemo, useState } from 'react';
import MathExpr, { SvgMathExpr } from './MathExpr.jsx';

const schemes = {
  BPSK: [
    { bits: '0', i: -1, q: 0 },
    { bits: '1', i: 1, q: 0 },
  ],
  QPSK: [
    { bits: '00', i: 1, q: 1 },
    { bits: '01', i: -1, q: 1 },
    { bits: '11', i: -1, q: -1 },
    { bits: '10', i: 1, q: -1 },
  ],
  '16QAM': [
    { bits: '0000', i: -3, q: 3 }, { bits: '0001', i: -1, q: 3 }, { bits: '0011', i: 1, q: 3 }, { bits: '0010', i: 3, q: 3 },
    { bits: '0100', i: -3, q: 1 }, { bits: '0101', i: -1, q: 1 }, { bits: '0111', i: 1, q: 1 }, { bits: '0110', i: 3, q: 1 },
    { bits: '1100', i: -3, q: -1 }, { bits: '1101', i: -1, q: -1 }, { bits: '1111', i: 1, q: -1 }, { bits: '1110', i: 3, q: -1 },
    { bits: '1000', i: -3, q: -3 }, { bits: '1001', i: -1, q: -3 }, { bits: '1011', i: 1, q: -3 }, { bits: '1010', i: 3, q: -3 },
  ],
};

function normalizedPoint(point, scheme) {
  if (scheme === 'BPSK') return point;
  if (scheme === 'QPSK') return { ...point, i: point.i / Math.sqrt(2), q: point.q / Math.sqrt(2) };
  return { ...point, i: point.i / Math.sqrt(10), q: point.q / Math.sqrt(10) };
}

export default function ModulationExplorer() {
  const [scheme, setScheme] = useState('QPSK');
  const [index, setIndex] = useState(0);

  const points = useMemo(() => schemes[scheme].map(p => normalizedPoint(p, scheme)), [scheme]);
  const activeIndex = Math.min(index, points.length - 1);
  const active = points[activeIndex];
  const bitsPerSymbol = Math.log2(points.length);
  const magnitude = Math.hypot(active.i, active.q);
  const phase = Math.atan2(active.q, active.i) * 180 / Math.PI;

  const cx = 190;
  const cy = 180;
  const scale = 110;

  function chooseScheme(next) {
    setScheme(next);
    setIndex(0);
  }

  return (
    <div className="modulation-lab">
      <div className="modulation-tabs">
        {Object.keys(schemes).map(name => (
          <button key={name} className={scheme === name ? 'selected' : ''} onClick={() => chooseScheme(name)}>{name}</button>
        ))}
      </div>

      <div className="modulation-readout">
        <div><small>BITS / SYMBOL</small><strong>{bitsPerSymbol}</strong><span><MathExpr tex={`\\log_2(M)`} /></span></div>
        <div><small>BITS ĐANG CHỌN</small><strong>{active.bits}</strong><span>một mapping Gray minh họa</span></div>
        <div><small><MathExpr tex="I+jQ" /></small><strong><MathExpr tex={`${active.i.toFixed(3)}${active.q >= 0 ? '+' : '-'}j${Math.abs(active.q).toFixed(3)}`} /></strong><span>normalized symbol</span></div>
        <div><small>MAG / PHASE</small><strong>{magnitude.toFixed(3)} · {phase.toFixed(1)}°</strong><span>polar view</span></div>
      </div>

      <div className="modulation-body">
        <div className="modulation-constellation">
          <div className="visual-caption"><span>CONSTELLATION</span><strong>{scheme}</strong></div>
          <svg viewBox="0 0 380 360" role="img" aria-label={`Constellation ${scheme} với một symbol được chọn`}>
            <line className="mod-axis" x1="35" y1={cy} x2="345" y2={cy} />
            <line className="mod-axis" x1={cx} y1="25" x2={cx} y2="335" />
            <SvgMathExpr tex="I" x={330} y={cy - 8} width={24} />
            <SvgMathExpr tex="Q" x={cx + 8} y={38} width={24} />
            {points.map((point, idx) => {
              const x = cx + point.i * scale;
              const y = cy - point.q * scale;
              return (
                <g key={point.bits} className={idx === activeIndex ? 'active' : ''} onClick={() => setIndex(idx)}>
                  <circle className="mod-point" cx={x} cy={y} r={idx === activeIndex ? 8 : 5} />
                  <text className="mod-bit-label" x={x + 8} y={y - 8}>{point.bits}</text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="modulation-symbol-picker">
          <span className="card-label">CHỌN NHÓM BITS</span>
          <div className="modulation-bit-grid">
            {points.map((point, idx) => (
              <button key={point.bits} className={idx === activeIndex ? 'selected' : ''} onClick={() => setIndex(idx)}>
                {point.bits}
              </button>
            ))}
          </div>

          <div className="modulation-chain-mini">
            <div><small>BITS</small><strong>{active.bits}</strong></div>
            <b>→</b>
            <div><small>MAPPER</small><strong>{scheme}</strong></div>
            <b>→</b>
            <div><small>SYMBOL</small><strong><MathExpr tex="X[k]" /></strong></div>
          </div>

          <p>
            Mapper không gửi chữ “{active.bits}” ra anten. Nó chọn một complex value. Trong OFDM,
            complex symbol đó có thể được đặt lên một subcarrier trước khi IFFT tạo time-domain samples.
          </p>
        </div>
      </div>
    </div>
  );
}
