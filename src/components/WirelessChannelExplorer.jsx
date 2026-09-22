import { useMemo, useState } from 'react';

const W = 760;
const H = 220;
const PAD = 28;

function pathFromValues(values, scale = 72) {
  return values.map((v, n) => {
    const x = PAD + (n / Math.max(values.length - 1, 1)) * (W - 2 * PAD);
    const y = H / 2 - scale * v;
    return `${n === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');
}

export default function WirelessChannelExplorer() {
  const [gainDb, setGainDb] = useState(-8);
  const [delay, setDelay] = useState(10);
  const [phase, setPhase] = useState(35);

  const gain = Math.pow(10, gainDb / 20);
  const phaseRad = phase * Math.PI / 180;
  const N = 160;

  const input = useMemo(
    () => Array.from({ length: N }, (_, n) => Math.cos(2 * Math.PI * 6 * n / N)),
    []
  );

  const output = useMemo(() => Array.from({ length: N }, (_, n) => {
    const src = n - delay;
    if (src < 0) return 0;
    const theta = 2 * Math.PI * 6 * src / N + phaseRad;
    return gain * Math.cos(theta);
  }), [delay, gain, phaseRad]);

  const inputPath = useMemo(() => pathFromValues(input), [input]);
  const outputPath = useMemo(() => pathFromValues(output), [output]);

  const symbolPhase = 40 * Math.PI / 180;
  const txI = Math.cos(symbolPhase);
  const txQ = Math.sin(symbolPhase);
  const rxI = gain * Math.cos(symbolPhase + phaseRad);
  const rxQ = gain * Math.sin(symbolPhase + phaseRad);

  const cx = 180;
  const cy = 165;
  const scale = 105;

  return (
    <div className="wireless-channel-lab">
      <div className="channel-controls">
        <label>
          <span>Attenuation <strong>{gainDb.toFixed(0)} dB</strong></span>
          <input type="range" min="-24" max="0" step="1" value={gainDb}
            onChange={(e) => setGainDb(Number(e.target.value))} />
        </label>
        <label>
          <span>Delay <strong>{delay} samples</strong></span>
          <input type="range" min="0" max="28" step="1" value={delay}
            onChange={(e) => setDelay(Number(e.target.value))} />
        </label>
        <label>
          <span>Phase rotation <strong>{phase.toFixed(0)}°</strong></span>
          <input type="range" min="-180" max="180" step="5" value={phase}
            onChange={(e) => setPhase(Number(e.target.value))} />
        </label>
      </div>

      <div className="channel-readout">
        <div><small>|h|</small><strong>{gain.toFixed(3)}</strong><span>linear voltage gain</span></div>
        <div><small>∠h</small><strong>{phase.toFixed(0)}°</strong><span>phase rotation</span></div>
        <div><small>DELAY</small><strong>{delay}</strong><span>sample shift</span></div>
        <div><small>MODEL</small><strong>y = hx</strong><span>+ delay, no noise</span></div>
      </div>

      <div className="channel-lab-grid">
        <div className="channel-wave-panel">
          <div className="visual-caption"><span>TIME DOMAIN</span><strong>delay + attenuation + phase</strong></div>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Input and output waveform through a simple flat channel">
            <line className="channel-axis" x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} />
            <path className="channel-input-wave" d={inputPath} />
            <path className="channel-output-wave" d={outputPath} />
          </svg>
          <div className="channel-legend">
            <span><i className="channel-input-key"></i> input</span>
            <span><i className="channel-output-key"></i> output</span>
          </div>
        </div>

        <div className="channel-plane-panel">
          <div className="visual-caption"><span>COMPLEX PLANE</span><strong>h rotates and scales</strong></div>
          <svg viewBox="0 0 360 325" role="img" aria-label="Transmitted and received symbol after channel rotation and attenuation">
            <line className="channel-axis" x1="38" y1={cy} x2="326" y2={cy} />
            <line className="channel-axis" x1={cx} y1="26" x2={cx} y2="296" />
            <line className="channel-tx-vector" x1={cx} y1={cy} x2={cx + scale * txI} y2={cy - scale * txQ} />
            <circle className="channel-tx-dot" cx={cx + scale * txI} cy={cy - scale * txQ} r="6" />
            <line className="channel-rx-vector" x1={cx} y1={cy} x2={cx + scale * rxI} y2={cy - scale * rxQ} />
            <circle className="channel-rx-dot" cx={cx + scale * rxI} cy={cy - scale * rxQ} r="6" />
            <text className="channel-label" x="309" y={cy - 8}>I</text>
            <text className="channel-label" x={cx + 8} y="40">Q</text>
          </svg>
          <div className="channel-legend">
            <span><i className="channel-tx-key"></i> X</span>
            <span><i className="channel-rx-key"></i> Y = hX</span>
          </div>
        </div>
      </div>
    </div>
  );
}
