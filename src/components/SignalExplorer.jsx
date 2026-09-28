import { useMemo, useState } from 'react';
import MathExpr, { SvgMathExpr } from './MathExpr.jsx';

const W = 720;
const H = 260;
const PAD = 30;

function linePath(values, min = -2, max = 2) {
  return values
    .map((value, index) => {
      const x = PAD + (index / Math.max(values.length - 1, 1)) * (W - PAD * 2);
      const y = PAD + ((max - value) / (max - min)) * (H - PAD * 2);
      return (index === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2);
    })
    .join(' ');
}

function dftMagnitude(samples, sampleRate) {
  const n = samples.length;
  const output = [];

  for (let k = 0; k <= n / 2; k += 1) {
    let re = 0;
    let im = 0;

    for (let index = 0; index < n; index += 1) {
      const angle = (-2 * Math.PI * k * index) / n;
      re += samples[index] * Math.cos(angle);
      im += samples[index] * Math.sin(angle);
    }

    output.push({
      frequency: (k * sampleRate) / n,
      magnitude: (2 * Math.hypot(re, im)) / n,
    });
  }

  return output;
}

export default function SignalExplorer() {
  const [f1, setF1] = useState(5);
  const [f2, setF2] = useState(12);
  const [view, setView] = useState('time');

  const sampleRate = 64;
  const n = 64;

  const samples = useMemo(
    () =>
      Array.from({ length: n }, (_, index) => {
        const t = index / sampleRate;
        return Math.sin(2 * Math.PI * f1 * t)
          + 0.65 * Math.sin(2 * Math.PI * f2 * t + 0.35);
      }),
    [f1, f2]
  );

  const smooth = useMemo(
    () =>
      Array.from({ length: 320 }, (_, index) => {
        const t = index / 319;
        return Math.sin(2 * Math.PI * f1 * t)
          + 0.65 * Math.sin(2 * Math.PI * f2 * t + 0.35);
      }),
    [f1, f2]
  );

  const spectrum = useMemo(
    () => dftMagnitude(samples, sampleRate).filter((bin) => bin.frequency <= 24),
    [samples]
  );

  return (
    <div className="signal-explorer signal-explorer-foundation">
      <div className="lab-toolbar signal-foundation-toolbar">
        <div className="segmented" aria-label="Chọn representation">
          <button type="button" className={view === 'time' ? 'selected' : ''} onClick={() => setView('time')}>
            Time domain
          </button>
          <button type="button" className={view === 'frequency' ? 'selected' : ''} onClick={() => setView('frequency')}>
            Frequency domain
          </button>
        </div>

        <div className="tone-controls">
          <label>
            Tone A <strong><MathExpr tex={f1 + '\\,\\mathrm{Hz}'} /></strong>
            <input type="range" min="2" max="10" value={f1} onChange={(event) => setF1(Number(event.target.value))} />
          </label>
          <label>
            Tone B <strong><MathExpr tex={f2 + '\\,\\mathrm{Hz}'} /></strong>
            <input type="range" min="11" max="22" value={f2} onChange={(event) => setF2(Number(event.target.value))} />
          </label>
        </div>
      </div>

      <div className="signal-foundation-readout">
        <div>
          <small>SIGNAL</small>
          <strong>tone A + tone B</strong>
          <span>cùng một dữ liệu, hai representation để quan sát</span>
        </div>
        <div>
          <small>SAMPLING RATE</small>
          <strong><MathExpr tex={String.raw`64\,\mathrm{Hz}`} /></strong>
          <span>fixed trong demo này</span>
        </div>
        <div>
          <small>CURRENT VIEW</small>
          <strong>{view === 'time' ? 'Time domain' : 'Frequency domain'}</strong>
          <span>{view === 'time' ? 'waveform + sample points' : 'magnitude by frequency bin'}</span>
        </div>
      </div>

      <div className="interactive-panel">
        <div className="plot-wrap">
          {view === 'time' ? (
            <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label="Waveform và samples trong time domain">
              <line x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} className="plot-axis" />
              <path d={linePath(smooth)} className="plot-wave" />
              {samples.map((value, index) => {
                const x = PAD + (index / (samples.length - 1)) * (W - PAD * 2);
                const y = PAD + ((2 - value) / 4) * (H - PAD * 2);
                return <circle key={index} cx={x} cy={y} r="2.6" className="sample-dot" />;
              })}
              <SvgMathExpr tex={String.raw`0\,\mathrm{s}`} x={PAD} y={H - 13} width={38} />
              <SvgMathExpr tex={String.raw`1\,\mathrm{s}`} x={W - PAD - 26} y={H - 13} width={38} />
            </svg>
          ) : (
            <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label="Magnitude spectrum trong frequency domain">
              <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} className="plot-axis" />
              {spectrum.map((bin, index) => {
                const usableW = W - PAD * 2;
                const barWidth = usableW / spectrum.length;
                const barHeight = Math.min(bin.magnitude / 1.15, 1) * (H - PAD * 2);

                return (
                  <g key={bin.frequency}>
                    <rect
                      x={PAD + index * barWidth + 2}
                      y={H - PAD - barHeight}
                      width={Math.max(barWidth - 4, 2)}
                      height={barHeight}
                      rx="3"
                      className="spectrum-bar"
                    />
                    {bin.frequency % 4 === 0 && (
                      <text x={PAD + index * barWidth} y={H - 7} className="plot-label">
                        {bin.frequency}
                      </text>
                    )}
                  </g>
                );
              })}
              <SvgMathExpr tex={String.raw`\mathrm{Hz}`} x={W - 62} y={18} width={34} />
            </svg>
          )}
        </div>

        <div className="lab-readout">
          {view === 'time' ? (
            <>
              <strong>Time domain cho thấy waveform tổng thay đổi theo thời gian.</strong>
              <span>
                Các chấm là samples của cùng waveform. Chỉ nhìn đường cong này, không dễ đọc ra ngay hai thành phần <MathExpr tex={f1 + '\\,\\mathrm{Hz}'} /> và <MathExpr tex={f2 + '\\,\\mathrm{Hz}'} />.
              </span>
            </>
          ) : (
            <>
              <strong>Frequency domain làm các thành phần sinusoid tách ra rõ hơn.</strong>
              <span>
                Hai peak chính xuất hiện quanh <MathExpr tex={f1 + '\\,\\mathrm{Hz}'} /> và <MathExpr tex={f2 + '\\,\\mathrm{Hz}'} />.
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
