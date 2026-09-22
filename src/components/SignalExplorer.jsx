import { useEffect, useMemo, useState } from 'react';

const W = 720;
const H = 260;
const PAD = 30;

function linePath(values, min = -2, max = 2) {
  return values
    .map((v, i) => {
      const x = PAD + (i / Math.max(values.length - 1, 1)) * (W - PAD * 2);
      const y = PAD + ((max - v) / (max - min)) * (H - PAD * 2);
      return (i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2);
    })
    .join(' ');
}

function dftMagnitude(samples, sampleRate) {
  const n = samples.length;
  const output = [];
  for (let k = 0; k <= n / 2; k += 1) {
    let re = 0;
    let im = 0;
    for (let i = 0; i < n; i += 1) {
      const angle = (-2 * Math.PI * k * i) / n;
      re += samples[i] * Math.cos(angle);
      im += samples[i] * Math.sin(angle);
    }
    output.push({
      frequency: (k * sampleRate) / n,
      magnitude: (2 * Math.hypot(re, im)) / n,
    });
  }
  return output;
}

function TimeFrequencyLab() {
  const [f1, setF1] = useState(5);
  const [f2, setF2] = useState(12);
  const [view, setView] = useState('time');
  const sampleRate = 64;
  const n = 64;

  const samples = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => {
        const t = i / sampleRate;
        return Math.sin(2 * Math.PI * f1 * t) + 0.65 * Math.sin(2 * Math.PI * f2 * t + 0.35);
      }),
    [f1, f2]
  );

  const smooth = useMemo(
    () =>
      Array.from({ length: 320 }, (_, i) => {
        const t = i / 319;
        return Math.sin(2 * Math.PI * f1 * t) + 0.65 * Math.sin(2 * Math.PI * f2 * t + 0.35);
      }),
    [f1, f2]
  );

  const spectrum = useMemo(
    () => dftMagnitude(samples, sampleRate).filter((bin) => bin.frequency <= 24),
    [samples]
  );

  return (
    <div className="interactive-panel">
      <div className="lab-toolbar">
        <div className="segmented" aria-label="Chọn miền hiển thị">
          <button className={view === 'time' ? 'selected' : ''} onClick={() => setView('time')}>
            Time domain
          </button>
          <button className={view === 'frequency' ? 'selected' : ''} onClick={() => setView('frequency')}>
            Frequency domain
          </button>
        </div>
        <div className="tone-controls">
          <label>
            Tone A <strong>{f1} Hz</strong>
            <input type="range" min="2" max="10" value={f1} onChange={(e) => setF1(Number(e.target.value))} />
          </label>
          <label>
            Tone B <strong>{f2} Hz</strong>
            <input type="range" min="11" max="22" value={f2} onChange={(e) => setF2(Number(e.target.value))} />
          </label>
        </div>
      </div>

      <div className="plot-wrap">
        {view === 'time' ? (
          <svg viewBox={"0 0 " + W + " " + H} role="img" aria-label="Waveform trong time domain">
            <line x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} className="plot-axis" />
            <path d={linePath(smooth)} className="plot-wave" />
            {samples.map((v, i) => {
              const x = PAD + (i / (samples.length - 1)) * (W - PAD * 2);
              const y = PAD + ((2 - v) / 4) * (H - PAD * 2);
              return <circle key={i} cx={x} cy={y} r="2.6" className="sample-dot" />;
            })}
            <text x={PAD} y={H - 7} className="plot-label">0 s</text>
            <text x={W - PAD - 26} y={H - 7} className="plot-label">1 s</text>
          </svg>
        ) : (
          <svg viewBox={"0 0 " + W + " " + H} role="img" aria-label="Magnitude spectrum trong frequency domain">
            <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} className="plot-axis" />
            {spectrum.map((bin, i) => {
              const usableW = W - PAD * 2;
              const bw = usableW / spectrum.length;
              const h = Math.min(bin.magnitude / 1.15, 1) * (H - PAD * 2);
              return (
                <g key={bin.frequency}>
                  <rect
                    x={PAD + i * bw + 2}
                    y={H - PAD - h}
                    width={Math.max(bw - 4, 2)}
                    height={h}
                    rx="3"
                    className="spectrum-bar"
                  />
                  {bin.frequency % 4 === 0 && (
                    <text x={PAD + i * bw} y={H - 7} className="plot-label">
                      {bin.frequency}
                    </text>
                  )}
                </g>
              );
            })}
            <text x={W - 62} y={20} className="plot-label">Hz</text>
          </svg>
        )}
      </div>

      <div className="lab-readout">
        {view === 'time' ? (
          <>
            <strong>Ở time domain, mình đang nhìn waveform tổng.</strong>
            <span>Hai tone đã cộng vào nhau nên khó đoán bằng mắt rằng bên trong có {f1} Hz và {f2} Hz.</span>
          </>
        ) : (
          <>
            <strong>Sang frequency domain, hai thành phần tách ra rõ hơn.</strong>
            <span>Hai peak chính xuất hiện quanh {f1} Hz và {f2} Hz.</span>
          </>
        )}
      </div>
    </div>
  );
}

function IQLab() {
  const [phase, setPhase] = useState(35);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => {
      setPhase((value) => (value + 2) % 360);
    }, 45);
    return () => window.clearInterval(timer);
  }, [playing]);

  const rad = (phase * Math.PI) / 180;
  const i = Math.cos(rad);
  const q = Math.sin(rad);
  const cx = 170;
  const cy = 145;
  const radius = 95;
  const px = cx + i * radius;
  const py = cy - q * radius;

  return (
    <div className="interactive-panel iq-panel">
      <div className="iq-grid">
        <svg viewBox="0 0 340 290" role="img" aria-label="Complex plane với I và Q">
          <circle cx={cx} cy={cy} r={radius} className="iq-circle" />
          <line x1="45" y1={cy} x2="295" y2={cy} className="plot-axis" />
          <line x1={cx} y1="20" x2={cx} y2="270" className="plot-axis" />
          <line x1={cx} y1={cy} x2={px} y2={py} className="phasor" />
          <line x1={px} y1={py} x2={px} y2={cy} className="projection" />
          <line x1={px} y1={py} x2={cx} y2={py} className="projection" />
          <circle cx={px} cy={py} r="7" className="phasor-dot" />
          <text x="300" y={cy - 7} className="plot-label">I</text>
          <text x={cx + 8} y="20" className="plot-label">Q</text>
        </svg>

        <div className="iq-readout">
          <p className="formula">s = I + jQ</p>
          <div><span>I</span><strong>{i.toFixed(3)}</strong></div>
          <div><span>Q</span><strong>{q.toFixed(3)}</strong></div>
          <div><span>Amplitude</span><strong>1.000</strong></div>
          <div><span>Phase</span><strong>{Math.round(phase)}°</strong></div>
          <button className="play-button" onClick={() => setPlaying((v) => !v)}>
            {playing ? 'Tạm dừng phasor' : 'Cho phasor quay'}
          </button>
        </div>
      </div>
      <label className="phase-slider">
        Phase
        <input
          type="range"
          min="0"
          max="359"
          value={phase}
          onChange={(e) => {
            setPlaying(false);
            setPhase(Number(e.target.value));
          }}
        />
      </label>
      <p className="lab-caption">
        Điểm quay trên complex plane có amplitude không đổi nhưng phase thay đổi. I và Q chỉ là hai projection
        vuông góc của cùng một phasor.
      </p>
    </div>
  );
}

export default function SignalExplorer() {
  const [lab, setLab] = useState('fft');

  return (
    <div className="signal-explorer">
      <div className="lab-tabs">
        <button className={lab === 'fft' ? 'selected' : ''} onClick={() => setLab('fft')}>
          Time ↔ Frequency
        </button>
        <button className={lab === 'iq' ? 'selected' : ''} onClick={() => setLab('iq')}>
          I/Q phasor
        </button>
      </div>
      {lab === 'fft' ? <TimeFrequencyLab /> : <IQLab />}
    </div>
  );
}
