import { useMemo, useState } from 'react';
import MathExpr from './MathExpr.jsx';

const W = 760;
const H = 250;
const PAD = 36;

function dft(samples) {
  const N = samples.length;
  const out = [];
  for (let k = 0; k <= N / 2; k += 1) {
    let re = 0;
    let im = 0;
    for (let n = 0; n < N; n += 1) {
      const angle = (-2 * Math.PI * k * n) / N;
      re += samples[n] * Math.cos(angle);
      im += samples[n] * Math.sin(angle);
    }
    out.push(Math.hypot(re, im));
  }
  return out;
}

function hann(n, N) {
  if (N <= 1) return 1;
  return 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (N - 1));
}

export default function FourierDFTExplorer() {
  const [tone, setTone] = useState(7);
  const [N, setN] = useState(64);
  const [windowName, setWindowName] = useState('rect');
  const fs = 64;

  const data = useMemo(() => {
    const raw = Array.from({ length: N }, (_, n) => Math.cos(2 * Math.PI * tone * n / fs));
    const windowed = raw.map((v, n) => v * (windowName === 'hann' ? hann(n, N) : 1));
    const mag = dft(windowed);
    const coherentGain = windowName === 'hann'
      ? Array.from({ length: N }, (_, n) => hann(n, N)).reduce((a, b) => a + b, 0) / N
      : 1;
    return { raw, windowed, mag: mag.map(v => (2 * v) / (N * coherentGain)) };
  }, [tone, N, windowName]);

  const binSpacing = fs / N;
  const closestBin = Math.round(tone / binSpacing);
  const closestFrequency = closestBin * binSpacing;
  const onBin = Math.abs(tone - closestFrequency) < 1e-9;

  const timePoints = data.windowed.map((v, n) => {
    const x = PAD + (n / Math.max(N - 1, 1)) * (W - 2 * PAD);
    const y = H / 2 - 82 * v;
    return `${n === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');

  const visibleBins = data.mag.map((m, k) => ({ k, f: k * binSpacing, m })).filter(x => x.f <= 24);
  const maxMag = Math.max(...visibleBins.map(x => x.m), 1e-6);

  return (
    <div className="fourier-dft-lab">
      <div className="fourier-controls">
        <label>
          <span>Tone <strong><MathExpr tex={`${tone.toFixed(1)}\\,\\mathrm{Hz}`} /></strong></span>
          <input
            type="range"
            min="2"
            max="18"
            step="0.5"
            value={tone}
            onChange={(event) => setTone(Number(event.target.value))}
          />
        </label>
        <label>
          <span>Số sample <strong><MathExpr tex={`N=${N}`} /></strong></span>
          <select value={N} onChange={(event) => setN(Number(event.target.value))}>
            <option value="32">32</option>
            <option value="64">64</option>
            <option value="128">128</option>
          </select>
        </label>
        <label>
          <span>Window <strong>{windowName === 'rect' ? 'Rectangular' : 'Hann'}</strong></span>
          <select value={windowName} onChange={(event) => setWindowName(event.target.value)}>
            <option value="rect">Rectangular</option>
            <option value="hann">Hann</option>
          </select>
        </label>
      </div>

      <div className="fourier-readout">
        <div><small><MathExpr tex="f_s" /></small><strong><MathExpr tex={`${fs}\\,\\mathrm{Hz}`} /></strong><span>sampling rate</span></div>
        <div><small><MathExpr tex={`\\Delta f`} /></small><strong><MathExpr tex={`${binSpacing.toFixed(2)}\\,\\mathrm{Hz}`} /></strong><span><MathExpr tex="f_s/N" /></span></div>
        <div><small>BIN GẦN NHẤT</small><strong><MathExpr tex={`k=${closestBin}`} /></strong><span><MathExpr tex={`${closestFrequency.toFixed(2)}\\,\\mathrm{Hz}`} /></span></div>
        <div className={onBin ? 'ok' : 'warning'}><small>BIN ALIGNMENT</small><strong>{onBin ? 'Đúng bin' : 'Lệch bin'}</strong><span>{onBin ? 'ít leakage lý tưởng' : 'energy trải sang bins khác'}</span></div>
      </div>

      <div className="fourier-panels">
        <div>
          <div className="visual-caption"><span>TIME DOMAIN</span><strong><MathExpr tex={`N=${N}`} /> samples</strong></div>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Các sample time domain dùng cho DFT">
            <line className="fourier-axis" x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} />
            <path className="fourier-time-wave" d={timePoints} />
            {data.windowed.map((v, n) => {
              const x = PAD + (n / Math.max(N - 1, 1)) * (W - 2 * PAD);
              const y = H / 2 - 82 * v;
              return <circle key={n} className="fourier-sample" cx={x} cy={y} r={N > 64 ? 1.7 : 2.6} />;
            })}
          </svg>
        </div>

        <div>
          <div className="visual-caption"><span>DFT MAGNITUDE</span><strong><MathExpr tex="X[k]" /></strong></div>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Magnitude DFT theo các frequency bins">
            <line className="fourier-axis" x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} />
            {visibleBins.map((bin, index) => {
              const bw = (W - 2 * PAD) / visibleBins.length;
              const height = (bin.m / maxMag) * 170;
              return (
                <g key={bin.k}>
                  <rect
                    className="fourier-bin"
                    x={PAD + index * bw + 1}
                    y={H - PAD - height}
                    width={Math.max(2, bw - 2)}
                    height={height}
                  />
                  {Math.abs(bin.f % 4) < 1e-6 && (
                    <text className="fourier-label" x={PAD + index * bw} y={H - 9}>{bin.f.toFixed(0)}</text>
                  )}
                </g>
              );
            })}
            <text className="fourier-label" x={W - 56} y="20">Hz</text>
          </svg>
        </div>
      </div>

      <p className="fourier-caption">
        DFT chỉ kiểm tra một tập frequency bins rời rạc <MathExpr tex="k f_s/N" />. Khi tone không rơi đúng bin, một record hữu hạn
        bị cắt ở biên và energy trải sang nhiều bins. Window thay đổi cách leakage phân bố, nhưng không tạo thêm thông tin mới.
      </p>
    </div>
  );
}
