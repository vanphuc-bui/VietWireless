import { useMemo, useState } from 'react';

const useful = Array.from({ length: 16 }, (_, n) => n);

export default function CyclicPrefixExplorer() {
  const [cpLength, setCpLength] = useState(4);
  const [channelDelay, setChannelDelay] = useState(3);

  const tx = useMemo(() => [...useful.slice(useful.length - cpLength), ...useful], [cpLength]);
  const sufficient = cpLength >= channelDelay;

  return (
    <div className="cp-lab">
      <div className="cp-controls">
        <label>
          <span>CP length <strong>{cpLength} samples</strong></span>
          <input type="range" min="0" max="8" step="1" value={cpLength}
            onChange={(e) => setCpLength(Number(e.target.value))} />
        </label>
        <label>
          <span>Channel memory <strong>{channelDelay} samples</strong></span>
          <input type="range" min="0" max="10" step="1" value={channelDelay}
            onChange={(e) => setChannelDelay(Number(e.target.value))} />
        </label>
      </div>

      <div className="cp-readout">
        <div><small>USEFUL</small><strong>16 samples</strong><span>FFT input after CP removal</span></div>
        <div><small>CP</small><strong>{cpLength}</strong><span>copy from end of symbol</span></div>
        <div><small>CHANNEL MEMORY</small><strong>{channelDelay}</strong><span>simplified max delay</span></div>
        <div className={sufficient ? 'ok' : 'warning'}><small>CONDITION</small><strong>{sufficient ? 'CP đủ dài' : 'CP quá ngắn'}</strong><span>{sufficient ? 'FFT window được bảo vệ' : 'previous symbol leaks in'}</span></div>
      </div>

      <div className="cp-visual">
        <div className="visual-caption"><span>TRANSMITTED OFDM SYMBOL</span><strong>CP + useful part</strong></div>
        <div className="cp-cell-row tx-row">
          {tx.map((value, idx) => (
            <i key={idx} className={idx < cpLength ? 'cp-cell' : 'useful-cell'}>
              <small>{idx < cpLength ? 'CP' : 'n'}</small>
              <strong>{value}</strong>
            </i>
          ))}
        </div>

        <div className="cp-copy-note">
          <span>CP copy</span>
          <b>← last {cpLength} samples of useful symbol</b>
        </div>

        <div className="cp-channel-memory">
          <span>Echo/channel memory extends roughly</span>
          <strong>{channelDelay} samples</strong>
          <i style={{ width: `${Math.min(100, channelDelay / 10 * 100)}%` }}></i>
        </div>

        <div className={`cp-fft-window ${sufficient ? 'safe' : 'unsafe'}`}>
          <strong>Receiver removes CP → FFT uses 16 useful samples</strong>
          <p>
            {sufficient
              ? 'Trong simplified model này, delayed copies của previous symbol không tràn vào useful FFT window.'
              : 'Channel memory dài hơn CP, nên tail của previous symbol có thể tràn vào useful FFT window và phá circular-convolution model.'}
          </p>
        </div>
      </div>
    </div>
  );
}
