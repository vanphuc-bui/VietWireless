import { useState } from 'react';
import MathExpr from './MathExpr.jsx';

const N_SC = 24;
const N_SYM = 14;

export default function ResourceGridExplorer() {
  const [selectedK, setSelectedK] = useState(7);
  const [selectedL, setSelectedL] = useState(3);

  const rb = Math.floor(selectedK / 12);
  const kInRb = selectedK % 12;

  const rows = Array.from({ length: N_SC }, (_, r) => N_SC - 1 - r);
  const cols = Array.from({ length: N_SYM }, (_, l) => l);

  return (
    <div className="resource-grid-lab">
      <div className="resource-grid-readout">
        <div><small>SELECTED RE</small><strong><MathExpr tex={`(k,\\ell)=(${selectedK},${selectedL})`} /></strong><span>frequency, time</span></div>
        <div><small>RB INDEX</small><strong><MathExpr tex={`n_{\\mathrm{RB}}=${rb}`} /></strong><span>demo has 2 RBs</span></div>
        <div><small><MathExpr tex="k" /> WITHIN RB</small><strong><MathExpr tex={`${kInRb}`} /></strong><span><MathExpr tex="0,\\ldots,11" /></span></div>
        <div><small>VALUE</small><strong><MathExpr tex={`X[${selectedK},${selectedL}]`} /></strong><span>one complex modulation symbol</span></div>
      </div>

      <div className="resource-grid-interactive-wrap">
        <div className="resource-grid-y-label">frequency ↑</div>
        <div className="resource-grid-interactive">
          <div className="resource-grid-top-axis">
            {cols.map((l) => <span key={l}><MathExpr tex={`${l}`} /></span>)}
          </div>
          <div className="resource-grid-body">
            {rows.map((k) => (
              <div className="resource-grid-row" key={k}>
                <span className="resource-grid-k"><MathExpr tex={`${k}`} /></span>
                {cols.map((l) => {
                  const isSelected = k === selectedK && l === selectedL;
                  const sameRb = Math.floor(k / 12) === rb;
                  return (
                    <button
                      key={l}
                      className={`${sameRb ? 'same-rb' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => { setSelectedK(k); setSelectedL(l); }}
                      aria-label={`Resource element k ${k}, l ${l}`}
                      title={`RE (k,l)=(${k},${l})`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="resource-grid-x-label">OFDM symbol index <MathExpr tex="\\ell" /> →</div>
        </div>
      </div>

      <p className="resource-grid-lab-note">
        Vùng nhạt đánh dấu resource block chứa RE đang chọn. Trong NR, một resource block là 12 subcarriers liên tiếp
        theo frequency; resource element mới là một ô đơn tại một subcarrier và một OFDM-symbol position.
      </p>
    </div>
  );
}
