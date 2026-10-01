import { useMemo, useState } from 'react';
import MathExpr from './MathExpr.jsx';

const useful = Array.from({ length: 16 }, (_, n) => n);

export default function CyclicPrefixExplorer() {
  const [cpLength, setCpLength] = useState(4);
  const [channelDelay, setChannelDelay] = useState(3);

  const tx = useMemo(() => [...useful.slice(useful.length - cpLength), ...useful], [cpLength]);
  const sufficient = cpLength >= channelDelay;
  const residual = Math.max(0, channelDelay - cpLength);
  const delayWidth = Math.min(38, 8 + channelDelay * 2.6);
  const protectedWidth = Math.min(38, 8 + Math.min(channelDelay, cpLength) * 2.6);

  return (
    <div className="cp-lab">
      <div className="cp-controls">
        <label>
          <span>Độ dài CP <strong className="metric-card-value"><MathExpr tex={String.raw`N_{\mathrm{CP}}=${cpLength}`} /></strong></span>
          <input type="range" min="0" max="8" step="1" value={cpLength}
            onChange={(e) => setCpLength(Number(e.target.value))} />
        </label>
        <label>
          <span>Delay cực đại <strong className="metric-card-value"><MathExpr tex={String.raw`D=${channelDelay}`} /></strong></span>
          <input type="range" min="0" max="10" step="1" value={channelDelay}
            onChange={(e) => setChannelDelay(Number(e.target.value))} />
        </label>
      </div>

      <div className="cp-readout metric-card-grid">
        <div className="metric-card">
          <small className="metric-card-label">BLOCK HỮU ÍCH</small>
          <strong className="metric-card-value"><MathExpr tex="N=16" /></strong>
          <span className="metric-card-formula">sample đưa vào FFT</span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">CYCLIC PREFIX</small>
          <strong className="metric-card-value"><MathExpr tex={String.raw`N_{\mathrm{CP}}=${cpLength}`} /></strong>
          <span className="metric-card-formula">copy từ cuối symbol hiện tại</span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">DELAY CỰC ĐẠI</small>
          <strong className="metric-card-value"><MathExpr tex={String.raw`D=${channelDelay}`} /></strong>
          <span className="metric-card-formula">channel memory minh họa</span>
        </div>
        <div className={`metric-card ${sufficient ? 'ok' : 'warning'}`}>
          <small className="metric-card-label">ISI CÒN LẠI</small>
          <strong className="metric-card-value"><MathExpr tex={String.raw`\max(0,D-N_{\mathrm{CP}})=${residual}`} /></strong>
          <span className="metric-card-formula">{sufficient ? 'không còn trong cửa sổ FFT hữu ích' : 'sample vẫn có thể bị nhiễu'}</span>
        </div>
      </div>

      <div className="cp-visual">
        <div className="visual-caption">
          <span>1 · SYMBOL ĐƯỢC PHÁT</span>
          <strong>CP là bản copy của phần đuôi, không phải zero guard</strong>
        </div>

        <div className="cp-cell-row tx-row">
          {tx.map((value, idx) => (
            <i key={idx} className={idx < cpLength ? 'cp-cell' : 'useful-cell'}>
              <small>{idx < cpLength ? 'CP' : <MathExpr tex="n" />}</small>
              <strong>{value}</strong>
            </i>
          ))}
        </div>

        <div className="cp-copy-note">
          <span>CP được copy</span>
          <b>← <MathExpr tex={String.raw`${cpLength}`} /> sample cuối của useful symbol</b>
        </div>

        <div className="cp-lab-comparison">
          <div className="visual-caption">
            <span>2 · MULTIPATH CHỒNG LÊN BOUNDARY</span>
            <strong>Phần trễ chồng vào đâu?</strong>
          </div>

          <div className="cp-lab-track">
            <small>không CP</small>
            <div className="cp-lab-prev">symbol trước</div>
            <div className="cp-lab-useful">useful symbol hiện tại</div>
            <i className="cp-lab-echo bad" style={{ width: `${delayWidth}%` }}>
              đuôi đến muộn
            </i>
          </div>

          <div className="cp-lab-track with-cp">
            <small>có CP</small>
            <div className="cp-lab-prev">symbol trước</div>
            <div className="cp-lab-prefix" style={{ flexBasis: `${Math.max(7, cpLength * 2.2)}%` }}>CP</div>
            <div className="cp-lab-useful">cửa sổ FFT hữu ích</div>
            <i className="cp-lab-echo protected" style={{ width: `${protectedWidth}%` }}>
              bản trễ trong CP
            </i>
            {!sufficient && (
              <i className="cp-lab-echo residual" style={{ width: `${Math.max(7, residual * 2.8)}%` }}>
                ISI còn lại
              </i>
            )}
          </div>
        </div>

        <div className="cp-channel-memory">
          <span>Kênh cần nhìn lùi tối đa</span>
          <strong><MathExpr tex={String.raw`D=${channelDelay}`} /> sample</strong>
          <i style={{ width: `${Math.min(100, channelDelay / 10 * 100)}%` }}></i>
        </div>

        <div className={`cp-fft-window ${sufficient ? 'safe' : 'unsafe'}`}>
          <strong>
            Receiver bỏ CP → FFT dùng <MathExpr tex="N=16" /> sample hữu ích
          </strong>
          <p>
            {sufficient
              ? 'CP bao phủ toàn bộ channel memory trong mô hình này. Phần overlap nằm trong prefix và bị bỏ trước FFT.'
              : `Channel dài hơn CP ${residual} sample. Phần vượt quá prefix vẫn tràn vào cửa sổ FFT hữu ích.`}
          </p>
        </div>

        <div className="cp-lab-rule">
          <small>ĐIỀU KIỆN MINH HỌA</small>
          <strong><MathExpr tex={String.raw`N_{\mathrm{CP}}\ge D`} /></strong>
          <span>
            {sufficient
              ? 'Đang thỏa: block hữu ích có thể giữ circular-convolution structure.'
              : 'Chưa thỏa: biên block vẫn còn đóng góp từ symbol trước.'}
          </span>
        </div>
      </div>
      <style>{`
        .cp-lab .cp-readout.metric-card-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .cp-lab .cp-readout .metric-card {
          min-width: 0;
          min-height: 0;
        }

        .cp-lab .cp-readout .metric-card-value,
        .cp-lab .cp-readout .metric-card-value .katex,
        .cp-lab .cp-readout .metric-card-formula {
          font-size: var(--lesson-box-content-size);
        }

        .cp-lab .cp-readout .metric-card-formula,
        .cp-lab .cp-fft-window p,
        .cp-lab .cp-lab-rule > span {
          line-height: 1.55;
        }

        .cp-lab .cp-fft-window p,
        .cp-lab .cp-lab-rule > span,
        .cp-lab .cp-copy-note,
        .cp-lab .cp-channel-memory {
          font-size: var(--lesson-box-content-size);
        }

        .cp-lab .cp-lab-prev,
        .cp-lab .cp-lab-prefix,
        .cp-lab .cp-lab-useful {
          font-size: 0.9rem;
        }

        @media (max-width: 820px) {
          .cp-lab .cp-readout.metric-card-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 520px) {
          .cp-lab .cp-readout.metric-card-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
