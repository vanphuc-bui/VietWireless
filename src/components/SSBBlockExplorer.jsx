import { useMemo, useState } from 'react';
import MathExpr from './MathExpr.jsx';

const N_SC = 240;
const N_SYM = 4;

function resourceType(symbol, k, v) {
  if (symbol === 0) {
    return k >= 56 && k <= 182 ? 'pss' : 'zero';
  }

  if (symbol === 2) {
    if (k >= 56 && k <= 182) return 'sss';
    if ((k >= 48 && k <= 55) || (k >= 183 && k <= 191)) return 'zero';
    if ((k <= 47 || k >= 192) && k % 4 === v) return 'dmrs';
    return 'pbch';
  }

  if (k % 4 === v) return 'dmrs';
  return 'pbch';
}

function countTypes(symbol, v) {
  const counts = { pss: 0, sss: 0, pbch: 0, dmrs: 0, zero: 0 };
  for (let k = 0; k < N_SC; k += 1) {
    counts[resourceType(symbol, k, v)] += 1;
  }
  return counts;
}

const labels = {
  pss: 'PSS',
  sss: 'SSS',
  pbch: 'PBCH',
  dmrs: 'PBCH DM-RS',
  zero: 'set to 0',
};

export default function SSBBlockExplorer() {
  const [v, setV] = useState(1);
  const [selectedSymbol, setSelectedSymbol] = useState(2);

  const counts = useMemo(
    () => Array.from({ length: N_SYM }, (_, symbol) => countTypes(symbol, v)),
    [v],
  );

  const total = useMemo(() => {
    const sum = { pss: 0, sss: 0, pbch: 0, dmrs: 0, zero: 0 };
    for (const symbolCounts of counts) {
      for (const key of Object.keys(sum)) sum[key] += symbolCounts[key];
    }
    return sum;
  }, [counts]);

  const selectedCounts = counts[selectedSymbol];

  return (
    <div className="ssb-explorer">
      <div className="ssb-explorer-controls">
        <label>
          <span>PBCH DM-RS offset <strong><MathExpr tex={'v=' + v} /></strong></span>
          <input
            type="range"
            min="0"
            max="3"
            step="1"
            value={v}
            onChange={(event) => setV(Number(event.target.value))}
          />
          <small><MathExpr tex={String.raw`v=N_{\mathrm{ID}}^{\mathrm{cell}}\bmod4`} /></small>
        </label>
      </div>

      <div className="ssb-total-readout metric-card-grid">
        <div className="metric-card">
          <small className="metric-card-label">TOÀN SSB</small>
          <strong className="metric-card-value">960 RE</strong>
          <span className="metric-card-formula">4 symbols × 240 subcarriers</span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">PSS + SSS</small>
          <strong className="metric-card-value">{total.pss + total.sss} RE</strong>
          <span className="metric-card-formula">127 + 127</span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">PBCH</small>
          <strong className="metric-card-value">{total.pbch} RE</strong>
          <span className="metric-card-formula">không tính PBCH DM-RS</span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">PBCH DM-RS</small>
          <strong className="metric-card-value">{total.dmrs} RE</strong>
          <span className="metric-card-formula">reference cho PBCH</span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">SET TO 0</small>
          <strong className="metric-card-value">{total.zero} RE</strong>
          <span className="metric-card-formula">theo mapping của block</span>
        </div>
      </div>

      <div className="ssb-explorer-main">
        <div className="ssb-frequency-axis">
          <span><MathExpr tex="k=239" /></span>
          <strong>tần số ↑</strong>
          <span><MathExpr tex="k=0" /></span>
        </div>

        <div className="ssb-exact-grid" aria-label="Resource mapping chính xác tương đối bên trong một SS/PBCH block">
          {Array.from({ length: N_SYM }, (_, symbol) => (
            <button
              type="button"
              key={symbol}
              className={'ssb-exact-column ' + (selectedSymbol === symbol ? 'selected' : '')}
              onClick={() => setSelectedSymbol(symbol)}
              aria-label={'Chọn OFDM symbol ' + symbol}
            >
              <span className="ssb-column-title">symbol {symbol}</span>
              <span className="ssb-column-cells">
                {Array.from({ length: N_SC }, (_, row) => {
                  const k = N_SC - 1 - row;
                  const type = resourceType(symbol, k, v);
                  return <i key={k} className={type} title={'k=' + k + ': ' + labels[type]}></i>;
                })}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="ssb-explorer-legend">
        <span><i className="pss"></i>PSS</span>
        <span><i className="sss"></i>SSS</span>
        <span><i className="pbch"></i>PBCH</span>
        <span><i className="dmrs"></i>PBCH DM-RS</span>
        <span><i className="zero"></i>set to 0</span>
      </div>

      <div className="ssb-symbol-detail">
        <div>
          <small>ĐANG CHỌN</small>
          <strong>OFDM symbol {selectedSymbol}</strong>
          <span>click một cột khác để inspect mapping</span>
        </div>
        <div>
          <small>PSS</small>
          <strong>{selectedCounts.pss}</strong>
          <span>RE</span>
        </div>
        <div>
          <small>SSS</small>
          <strong>{selectedCounts.sss}</strong>
          <span>RE</span>
        </div>
        <div>
          <small>PBCH</small>
          <strong>{selectedCounts.pbch}</strong>
          <span>RE</span>
        </div>
        <div>
          <small>PBCH DM-RS</small>
          <strong>{selectedCounts.dmrs}</strong>
          <span>RE</span>
        </div>
        <div>
          <small>SET TO 0</small>
          <strong>{selectedCounts.zero}</strong>
          <span>RE</span>
        </div>
      </div>

      <p className="ssb-explorer-note">
        Grid dùng đúng relative indexes <MathExpr tex={String.raw`k=0,\ldots,239`} /> và
        <MathExpr tex={String.raw`\ell=0,\ldots,3`} /> bên trong một SS/PBCH block.
        Màu PBCH chỉ tính các RE còn lại sau khi PBCH DM-RS đã puncture mapping.
      </p>
    </div>
  );
}
