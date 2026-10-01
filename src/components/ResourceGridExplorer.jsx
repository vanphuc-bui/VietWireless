import { useMemo, useState } from 'react';
import MathExpr from './MathExpr.jsx';

const N_SC = 24;
const N_SYM = 14;
const BWP_START_CRB = 42;

const MODES = [
  { id: 're', label: 'Xem một RE' },
  { id: 'signals', label: 'Bản đồ signal' },
  { id: 'indexing', label: 'CRB / PRB' },
];

function classifyCell(k, l) {
  if ((k + 2 * l) % 17 === 0) return 'unused';
  if ((l === 3 || l === 10) && k % 3 === 0) return 'dmrs';
  if (l < 2 && k >= 12) return 'control';
  return 'data';
}

function valueForCell(k, l, type) {
  if (type === 'unused') return null;

  if (type === 'dmrs' || type === 'control') {
    const signs = [
      [1, 1],
      [-1, 1],
      [-1, -1],
      [1, -1],
    ];
    const pair = signs[(k + l) % signs.length];
    const scale = Math.sqrt(2);
    return { i: pair[0] / scale, q: pair[1] / scale, modulation: 'QPSK' };
  }

  const levels = [-3, -1, 1, 3];
  const i = levels[(k + l) % 4];
  const q = levels[(2 * k + l + 1) % 4];
  const scale = Math.sqrt(10);
  return { i: i / scale, q: q / scale, modulation: '16-QAM' };
}

function formatComplex(value) {
  if (!value) return String.raw`\varnothing`;
  const i = value.i.toFixed(2);
  const qAbs = Math.abs(value.q).toFixed(2);
  const sign = value.q >= 0 ? '+' : '-';
  return i + sign + 'j' + qAbs;
}

export default function ResourceGridExplorer() {
  const [mode, setMode] = useState('re');
  const [selectedK, setSelectedK] = useState(7);
  const [selectedL, setSelectedL] = useState(3);

  const rb = Math.floor(selectedK / 12);
  const prb = rb;
  const crb = BWP_START_CRB + prb;
  const kInRb = selectedK % 12;
  const rows = Array.from({ length: N_SC }, (_, r) => N_SC - 1 - r);
  const cols = Array.from({ length: N_SYM }, (_, l) => l);

  const selectedType = classifyCell(selectedK, selectedL);
  const selectedValue = valueForCell(selectedK, selectedL, selectedType);

  const constellationPoints = useMemo(() => {
    if (selectedValue?.modulation === 'QPSK') {
      const scale = Math.sqrt(2);
      return [
        [-1 / scale, -1 / scale],
        [-1 / scale, 1 / scale],
        [1 / scale, -1 / scale],
        [1 / scale, 1 / scale],
      ];
    }

    const scale = Math.sqrt(10);
    return [-3, -1, 1, 3].flatMap((i) =>
      [-3, -1, 1, 3].map((q) => [i / scale, q / scale])
    );
  }, [selectedValue?.modulation]);

  const typeLabel = {
    data: 'Data',
    dmrs: 'DM-RS',
    control: 'Control',
    unused: 'Unused',
  }[selectedType];

  const coordTex = '(k,\\ell)=(' + selectedK + ',' + selectedL + ')';
  const prbTex = 'n_{\\mathrm{PRB}}=' + prb;
  const indexTex = 'n_{\\mathrm{CRB}}=' + crb + ',\\;k_{\\mathrm{RB}}=' + kInRb;
  const valueTex = 'a_{' + selectedK + ',' + selectedL + '}=' + formatComplex(selectedValue);

  return (
    <div className="resource-grid-lab resource-grid-lab-v2">
      <div className="rg-mode-tabs" role="tablist" aria-label="Chế độ resource-grid explorer">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={mode === item.id}
            className={mode === item.id ? 'selected' : ''}
            onClick={() => setMode(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="resource-grid-readout rg-readout-v2 metric-card-grid">
        <div className="metric-card">
          <small className="metric-card-label">RE ĐANG CHỌN</small>
          <strong className="metric-card-value"><MathExpr tex={coordTex} /></strong>
          <span className="metric-card-formula">tọa độ tần số × thời gian</span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">NHÓM TẦN SỐ</small>
          <strong className="metric-card-value"><MathExpr tex={prbTex} /></strong>
          <span className="metric-card-formula">nhóm 12 subcarrier trong BWP minh họa</span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">CRB / SUBCARRIER TRONG RB</small>
          <strong className="metric-card-value"><MathExpr tex={indexTex} /></strong>
          <span className="metric-card-formula">reference khác nhau → index khác nhau</span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">NỘI DUNG RE</small>
          <strong className="metric-card-value">{typeLabel}</strong>
          <span className="metric-card-formula">{selectedValue ? selectedValue.modulation : 'không có giá trị trong mapping minh họa'}</span>
        </div>
      </div>

      <div className="rg-explorer-layout">
        <div className="resource-grid-interactive-wrap">
          <div className="resource-grid-y-label">tần số ↑</div>
          <div className="resource-grid-interactive">
            <div className="resource-grid-top-axis">
              {cols.map((l) => <span key={l}><MathExpr tex={String(l)} /></span>)}
            </div>

            <div className={'resource-grid-body mode-' + mode}>
              {rows.map((k) => {
                const sameRb = Math.floor(k / 12) === rb;
                const boundary = k === 12;
                return (
                  <div className={'resource-grid-row' + (boundary ? ' rb-boundary' : '')} key={k}>
                    <span className={'resource-grid-k' + (sameRb ? ' selected-rb-frequency' : '')}>
                      <MathExpr tex={String(k)} />
                    </span>

                    {cols.map((l) => {
                      const type = classifyCell(k, l);
                      const isSelected = k === selectedK && l === selectedL;
                      const cellClass = [
                        'rg-cell',
                        mode === 'signals' ? 'type-' + type : '',
                        isSelected ? 'selected' : '',
                      ].filter(Boolean).join(' ');
                      return (
                        <button
                          key={l}
                          type="button"
                          className={cellClass}
                          onClick={() => { setSelectedK(k); setSelectedL(l); }}
                          aria-label={'Resource element k ' + k + ', l ' + l + ', ' + type}
                          title={'RE (k,l)=(' + k + ',' + l + ') · ' + type}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="resource-grid-x-label">chỉ số OFDM symbol <MathExpr tex={String.raw`\ell`} /> →</div>
          </div>
        </div>

        <aside className="rg-detail-panel">
          {mode === 're' && (
            <>
              <span className="card-label">RE → GIÁ TRỊ PHỨC</span>
              <h3><MathExpr tex={'a_{' + selectedK + ',' + selectedL + '}'} /></h3>
              <p>
                Một ô grid là một tọa độ. Nếu tọa độ đang được sử dụng, PHY đặt một giá trị phức của modulation/reference signal vào đó.
              </p>

              <div className="rg-constellation">
                <div className="rg-const-axis horizontal"></div>
                <div className="rg-const-axis vertical"></div>
                <span className="rg-axis-i"><MathExpr tex="I" /></span>
                <span className="rg-axis-q"><MathExpr tex="Q" /></span>
                {constellationPoints.map((point, index) => {
                  const i = point[0];
                  const q = point[1];
                  const selected = selectedValue
                    && Math.abs(i - selectedValue.i) < 1e-6
                    && Math.abs(q - selectedValue.q) < 1e-6;
                  return (
                    <i
                      key={index}
                      className={selected ? 'selected' : ''}
                      style={{
                        left: (50 + i * 31) + '%',
                        top: (50 - q * 31) + '%',
                      }}
                    />
                  );
                })}
              </div>

              <div className="rg-value-equation">
                <MathExpr tex={valueTex} />
              </div>
              <small>{selectedValue?.modulation || 'Unused RE'} trong mapping minh họa</small>
            </>
          )}

          {mode === 'signals' && (
            <>
              <span className="card-label">BẢN ĐỒ SIGNAL MINH HỌA</span>
              <h3>Data, reference, control và các RE không dùng cùng chia sẻ một grid.</h3>
              <div className="rg-signal-legend">
                <span><i className="data"></i>Data</span>
                <span><i className="dmrs"></i>DM-RS</span>
                <span><i className="control"></i>Control</span>
                <span><i className="unused"></i>Unused</span>
              </div>
              <p>
                Pattern màu trong lab chỉ để minh họa cách nhiều loại resource cùng tồn tại trên một grid.
                Nó không phải mapping của một physical channel cụ thể trong 3GPP.
              </p>
              <div className="rg-selected-type">
                <small>LOẠI RE ĐANG CHỌN</small>
                <strong>{typeLabel}</strong>
              </div>
            </>
          )}

          {mode === 'indexing' && (
            <>
              <span className="card-label">GÓC NHÌN INDEXING</span>
              <h3>PRB và CRB đang trả lời hai câu hỏi khác nhau.</h3>
              <div className="rg-index-equations">
                <div>
                  <small>THEO BWP</small>
                  <strong><MathExpr tex={prbTex} /></strong>
                </div>
                <div>
                  <small>COMMON GRID</small>
                  <strong><MathExpr tex={'n_{\\mathrm{CRB}}=' + crb} /></strong>
                </div>
                <div>
                  <small>TRONG RB</small>
                  <strong><MathExpr tex={'k_{\\mathrm{RB}}=' + kInRb} /></strong>
                </div>
              </div>
              <p>
                Demo đặt BWP bắt đầu tại CRB 42. Vì vậy PRB 0 ↔ CRB 42 và PRB 1 ↔ CRB 43.
                Con số chỉ minh họa reference change, không phải carrier configuration chuẩn.
              </p>
            </>
          )}
        </aside>
      </div>

      {mode === 'indexing' && (
        <div className="rg-index-strip">
          <div className="point-a-marker">Point A</div>
          {[40, 41, 42, 43, 44, 45].map((crbIndex) => {
            const inBwp = crbIndex >= BWP_START_CRB && crbIndex < BWP_START_CRB + 2;
            const prbIndex = inBwp ? crbIndex - BWP_START_CRB : null;
            return (
              <div
                key={crbIndex}
                className={'rg-crb-box' + (inBwp ? ' in-bwp' : '') + (crbIndex === crb ? ' selected' : '')}
              >
                <small>CRB {crbIndex}</small>
                <strong>{inBwp ? 'PRB ' + prbIndex : 'ngoài BWP'}</strong>
              </div>
            );
          })}
        </div>
      )}

      <p className="resource-grid-lab-note">
        Phần highlight RB nằm trên trục tần số để nhấn mạnh đúng định nghĩa: một RB là 12 subcarrier liên tiếp. Trục thời gian chỉ tạo thêm các vị trí RE khi ta nhìn resource usage qua nhiều OFDM symbols.
      </p>
      <style>{`
        .resource-grid-lab-v2 .rg-readout-v2.metric-card-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .resource-grid-lab-v2 .rg-readout-v2 .metric-card {
          min-width: 0;
          min-height: 0;
        }

        .resource-grid-lab-v2 .rg-readout-v2 .metric-card-value,
        .resource-grid-lab-v2 .rg-readout-v2 .metric-card-value .katex,
        .resource-grid-lab-v2 .rg-readout-v2 .metric-card-formula,
        .resource-grid-lab-v2 .rg-detail-panel > p,
        .resource-grid-lab-v2 .resource-grid-lab-note {
          font-size: var(--lesson-box-content-size);
          line-height: 1.55;
        }

        .resource-grid-lab-v2 .rg-readout-v2 .metric-card > span {
          font-size: var(--lesson-box-content-size);
          line-height: 1.45;
        }

        .resource-grid-lab-v2 .rg-mode-tabs {
          overflow-x: auto;
        }

        .resource-grid-lab-v2 .rg-mode-tabs > button {
          white-space: nowrap;
        }

        @media (max-width: 980px) {
          .resource-grid-lab-v2 .rg-explorer-layout {
            grid-template-columns: 1fr;
          }

          .resource-grid-lab-v2 .rg-explorer-layout > .resource-grid-interactive-wrap {
            border-right: 0;
            border-bottom: 1px solid var(--line);
          }
        }

        @media (max-width: 820px) {
          .resource-grid-lab-v2 .rg-readout-v2.metric-card-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 520px) {
          .resource-grid-lab-v2 .rg-readout-v2.metric-card-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
