import { useMemo, useState } from 'react';
import MathExpr from './MathExpr.jsx';

const rows = [
  { mu: 0, scs: 15, slots: 1 },
  { mu: 1, scs: 30, slots: 2 },
  { mu: 2, scs: 60, slots: 4 },
  { mu: 3, scs: 120, slots: 8 },
  { mu: 4, scs: 240, slots: 16 },
  { mu: 5, scs: 480, slots: 32 },
  { mu: 6, scs: 960, slots: 64 },
];

export default function NumerologyExplorer() {
  const [mu, setMu] = useState(1);

  const row = rows[mu];
  const slotMs = 1 / row.slots;
  const usefulUs = 1000 / row.scs;
  const symbolCount = 14;
  const averageSymbolUs = slotMs * 1000 / symbolCount;
  const rbKhz = 12 * row.scs;
  const normalized1kHz = 1 / row.scs;
  const delayFraction5us = 5 / usefulUs;
  const displaySlots = useMemo(() => Array.from({ length: Math.min(row.slots, 16) }, (_, i) => i), [row.slots]);

  return (
    <div className="numerology-lab">
      <div className="numerology-controls">
        <label>
          <span>Numerology <strong><MathExpr tex={`\\mu=${mu}`} /></strong></span>
          <input type="range" min="0" max="6" step="1" value={mu}
            onChange={(e) => setMu(Number(e.target.value))} />
        </label>
      </div>

      <div className="numerology-readout metric-card-grid">
        <div className="metric-card"><small className="metric-card-label">SCS</small><strong className="metric-card-value"><MathExpr tex={`${row.scs}\\,\\mathrm{kHz}`} /></strong><span className="metric-card-formula"><MathExpr tex={`15\\cdot2^{\\mu}`} /></span></div>
        <div className="metric-card"><small className="metric-card-label">USEFUL <MathExpr tex="T_u" /></small><strong className="metric-card-value"><MathExpr tex={`${usefulUs.toFixed(3)}\\,\\mu\\mathrm{s}`} /></strong><span className="metric-card-formula"><MathExpr tex={`1/\\Delta f`} />, chưa gồm CP</span></div>
        <div className="metric-card"><small className="metric-card-label">SLOT / <MathExpr tex={`1\\,\\mathrm{ms}`} /></small><strong className="metric-card-value">{row.slots}</strong><span className="metric-card-formula">normal CP</span></div>
        <div className="metric-card"><small className="metric-card-label">ĐỘ DÀI SLOT</small><strong className="metric-card-value"><MathExpr tex={`${slotMs.toFixed(5)}\\,\\mathrm{ms}`} /></strong><span className="metric-card-formula"><MathExpr tex={`1\\,\\mathrm{ms}/2^{\\mu}`} /></span></div>
      </div>

      <div className="numerology-sensitivity-grid metric-card-grid">
        <div className="metric-card">
          <small className="metric-card-label">ĐỘ RỘNG 1 RB</small>
          <strong className="metric-card-value"><MathExpr tex={rbKhz >= 1000 ? `${(rbKhz / 1000).toFixed(2)}\\,\\mathrm{MHz}` : `${rbKhz}\\,\\mathrm{kHz}`} /></strong>
          <span className="metric-card-formula"><MathExpr tex={String.raw`12\Delta f`} /></span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">1 kHz / SCS</small>
          <strong className="metric-card-value"><MathExpr tex={normalized1kHz.toFixed(4)} /></strong>
          <span className="metric-card-formula">normalized frequency error</span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">5 μs / <MathExpr tex="T_u" /></small>
          <strong className="metric-card-value"><MathExpr tex={`${(delayFraction5us * 100).toFixed(1)}\\%`} /></strong>
          <span className="metric-card-formula">fixed-delay fraction minh họa</span>
        </div>
      </div>

      <div className="numerology-subframe">
        <div className="visual-caption"><span>MỘT SUBFRAME <MathExpr tex={`1\\,\\mathrm{ms}`} /></span><strong>{row.slots} slot</strong></div>
        <div className={`numerology-slot-strip ${row.slots > 16 ? 'dense' : ''}`}>
          {displaySlots.map((slot) => (
            <i key={slot}><small>{row.slots <= 16 ? slot : ''}</small></i>
          ))}
          {row.slots > 16 && <span>× {row.slots / 16} slot trong mỗi đoạn đang vẽ</span>}
        </div>
      </div>

      <div className="numerology-symbol-story">
        <div>
          <small>PHẦN HỮU ÍCH</small>
          <strong><MathExpr tex={`T_u=1/\\Delta f`} /></strong>
          <span><MathExpr tex={`${usefulUs.toFixed(3)}\\,\\mu\\mathrm{s}`} /></span>
        </div>
        <b>+</b>
        <div>
          <small>CYCLIC PREFIX</small>
          <strong>độ dài CP</strong>
          <span>phụ thuộc numerology và vị trí symbol</span>
        </div>
        <b>→</b>
        <div>
          <small>SLOT NORMAL CP</small>
          <strong>14 OFDM symbols</strong>
          <span>khoảng symbol trung bình <MathExpr tex={`\\approx${averageSymbolUs.toFixed(3)}\\,\\mu\\mathrm{s}`} /></span>
        </div>
      </div>
      <style>{`
        .numerology-lab .numerology-readout.metric-card-grid,
        .numerology-lab .numerology-sensitivity-grid.metric-card-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .numerology-lab .numerology-sensitivity-grid.metric-card-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          border-bottom: 1px solid var(--line);
        }

        .numerology-lab .metric-card {
          min-width: 0;
          min-height: 0;
        }

        .numerology-lab .metric-card-value,
        .numerology-lab .metric-card-value .katex,
        .numerology-lab .metric-card-formula {
          font-size: var(--lesson-box-content-size);
        }

        .numerology-lab .metric-card-formula {
          line-height: 1.5;
        }

        .numerology-lab .numerology-symbol-story > div > span {
          font-size: var(--lesson-box-content-size);
          line-height: 1.5;
        }

        @media (max-width: 820px) {
          .numerology-lab .numerology-readout.metric-card-grid,
          .numerology-lab .numerology-sensitivity-grid.metric-card-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 520px) {
          .numerology-lab .numerology-readout.metric-card-grid,
          .numerology-lab .numerology-sensitivity-grid.metric-card-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
