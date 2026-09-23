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

      <div className="numerology-readout">
        <div><small>SCS</small><strong><MathExpr tex={`${row.scs}\\,\\mathrm{kHz}`} /></strong><span><MathExpr tex="15\\cdot2^{\\mu}" /></span></div>
        <div><small>USEFUL <MathExpr tex="T_u" /></small><strong><MathExpr tex={`${usefulUs.toFixed(3)}\\,\\mu\\mathrm{s}`} /></strong><span><MathExpr tex="1/\\Delta f" />, excludes CP</span></div>
        <div><small>SLOTS / <MathExpr tex="1\\,\\mathrm{ms}" /></small><strong>{row.slots}</strong><span>normal CP</span></div>
        <div><small>SLOT DURATION</small><strong><MathExpr tex={`${slotMs.toFixed(5)}\\,\\mathrm{ms}`} /></strong><span><MathExpr tex="1\\,\\mathrm{ms}/2^{\\mu}" /></span></div>
      </div>

      <div className="numerology-subframe">
        <div className="visual-caption"><span>ONE <MathExpr tex="1\\,\\mathrm{ms}" /> SUBFRAME</span><strong>{row.slots} slot{row.slots > 1 ? 's' : ''}</strong></div>
        <div className={`numerology-slot-strip ${row.slots > 16 ? 'dense' : ''}`}>
          {displaySlots.map((slot) => (
            <i key={slot}><small>{row.slots <= 16 ? slot : ''}</small></i>
          ))}
          {row.slots > 16 && <span>× {row.slots / 16} finer than each visible segment</span>}
        </div>
      </div>

      <div className="numerology-symbol-story">
        <div>
          <small>USEFUL PART</small>
          <strong><MathExpr tex="T_u=1/\\Delta f" /></strong>
          <span><MathExpr tex={`${usefulUs.toFixed(3)}\\,\\mu\\mathrm{s}`} /></span>
        </div>
        <b>+</b>
        <div>
          <small>CYCLIC PREFIX</small>
          <strong>CP duration</strong>
          <span>depends on numerology/symbol position</span>
        </div>
        <b>→</b>
        <div>
          <small>NORMAL-CP SLOT</small>
          <strong>14 OFDM symbols</strong>
          <span>average symbol interval <MathExpr tex={`\\approx${averageSymbolUs.toFixed(3)}\\,\\mu\\mathrm{s}`} /></span>
        </div>
      </div>
    </div>
  );
}
