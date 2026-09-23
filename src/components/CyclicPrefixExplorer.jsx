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
          <span>CP length <strong><MathExpr tex={String.raw`N_{\mathrm{CP}}=${cpLength}`} /></strong></span>
          <input type="range" min="0" max="8" step="1" value={cpLength}
            onChange={(e) => setCpLength(Number(e.target.value))} />
        </label>
        <label>
          <span>Maximum delay <strong><MathExpr tex={String.raw`D=${channelDelay}`} /></strong></span>
          <input type="range" min="0" max="10" step="1" value={channelDelay}
            onChange={(e) => setChannelDelay(Number(e.target.value))} />
        </label>
      </div>

      <div className="cp-readout">
        <div>
          <small>USEFUL BLOCK</small>
          <strong><MathExpr tex="N=16" /></strong>
          <span>samples đưa vào FFT</span>
        </div>
        <div>
          <small>CYCLIC PREFIX</small>
          <strong><MathExpr tex={String.raw`N_{\mathrm{CP}}=${cpLength}`} /></strong>
          <span>copy từ cuối current symbol</span>
        </div>
        <div>
          <small>MAX DELAY</small>
          <strong><MathExpr tex={String.raw`D=${channelDelay}`} /></strong>
          <span>simplified channel memory</span>
        </div>
        <div className={sufficient ? 'ok' : 'warning'}>
          <small>RESIDUAL ISI</small>
          <strong><MathExpr tex={String.raw`\max(0,D-N_{\mathrm{CP}})=${residual}`} /></strong>
          <span>{sufficient ? 'không còn trong useful window' : 'samples vẫn có thể bị nhiễu'}</span>
        </div>
      </div>

      <div className="cp-visual">
        <div className="visual-caption">
          <span>1 · TRANSMITTED SYMBOL</span>
          <strong>CP là copy của tail, không phải zero guard</strong>
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
          <span>CP copy</span>
          <b>← last <MathExpr tex={String.raw`${cpLength}`} /> samples of useful symbol</b>
        </div>

        <div className="cp-lab-comparison">
          <div className="visual-caption">
            <span>2 · MULTIPATH OVERLAP</span>
            <strong>Delay ăn vào đâu?</strong>
          </div>

          <div className="cp-lab-track">
            <small>không CP</small>
            <div className="cp-lab-prev">previous symbol</div>
            <div className="cp-lab-useful">useful current symbol</div>
            <i className="cp-lab-echo bad" style={{ width: `${delayWidth}%` }}>
              delayed tail
            </i>
          </div>

          <div className="cp-lab-track with-cp">
            <small>có CP</small>
            <div className="cp-lab-prev">previous symbol</div>
            <div className="cp-lab-prefix" style={{ flexBasis: `${Math.max(7, cpLength * 2.2)}%` }}>CP</div>
            <div className="cp-lab-useful">useful FFT window</div>
            <i className="cp-lab-echo protected" style={{ width: `${protectedWidth}%` }}>
              echo trong CP
            </i>
            {!sufficient && (
              <i className="cp-lab-echo residual" style={{ width: `${Math.max(7, residual * 2.8)}%` }}>
                residual ISI
              </i>
            )}
          </div>
        </div>

        <div className="cp-channel-memory">
          <span>Channel needs samples as far back as</span>
          <strong><MathExpr tex={String.raw`D=${channelDelay}`} /> samples</strong>
          <i style={{ width: `${Math.min(100, channelDelay / 10 * 100)}%` }}></i>
        </div>

        <div className={`cp-fft-window ${sufficient ? 'safe' : 'unsafe'}`}>
          <strong>
            Receiver removes CP → FFT uses <MathExpr tex="N=16" /> useful samples
          </strong>
          <p>
            {sufficient
              ? 'CP cover toàn bộ maximum delay trong model này. Delayed tail rơi vào prefix và bị bỏ trước FFT.'
              : `Channel dài hơn CP ${residual} sample(s). Phần vượt quá prefix vẫn tràn vào useful FFT window.`}
          </p>
        </div>

        <div className="cp-lab-rule">
          <small>SIMPLIFIED CONDITION</small>
          <strong><MathExpr tex={String.raw`N_{\mathrm{CP}}\ge D`} /></strong>
          <span>
            {sufficient
              ? 'Đang thỏa: useful block có thể giữ circular-convolution structure.'
              : 'Chưa thỏa: boundary vẫn chứa contribution từ previous symbol.'}
          </span>
        </div>
      </div>
    </div>
  );
}
