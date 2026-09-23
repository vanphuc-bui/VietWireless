import { useMemo, useState } from 'react';
import MathExpr from './MathExpr.jsx';

const W = 760;
const H = 230;
const LEFT = 34;
const RIGHT = 16;
const TOP = 18;
const BOTTOM = 30;
const PLOT_W = W - LEFT - RIGHT;
const MID = (TOP + H - BOTTOM) / 2;
const AMP = 68;
const DURATION = 1;

function foldAlias(frequency, sampleRate) {
  const wrapped = ((frequency + sampleRate / 2) % sampleRate + sampleRate) % sampleRate - sampleRate / 2;
  return Math.abs(wrapped);
}

function wavePath(frequency, phase = 0) {
  const points = [];
  const count = 520;
  for (let i = 0; i <= count; i += 1) {
    const t = (i / count) * DURATION;
    const x = LEFT + (t / DURATION) * PLOT_W;
    const y = MID - AMP * Math.cos(2 * Math.PI * frequency * t + phase);
    points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return points.join(' ');
}

export default function SamplingAliasExplorer() {
  const [frequency, setFrequency] = useState(7);
  const [sampleRate, setSampleRate] = useState(10);

  const aliasFrequency = useMemo(() => foldAlias(frequency, sampleRate), [frequency, sampleRate]);
  const nyquistFrequency = sampleRate / 2;
  const isAliasing = frequency > nyquistFrequency + 1e-9;

  const samples = useMemo(() => {
    const count = Math.floor(DURATION * sampleRate);
    return Array.from({ length: count + 1 }, (_, n) => {
      const t = n / sampleRate;
      return {
        n,
        x: LEFT + (t / DURATION) * PLOT_W,
        y: MID - AMP * Math.cos(2 * Math.PI * frequency * t),
      };
    });
  }, [frequency, sampleRate]);

  const originalPath = useMemo(() => wavePath(frequency), [frequency]);
  const aliasPath = useMemo(() => wavePath(aliasFrequency), [aliasFrequency]);

  function setSafePreset() {
    setFrequency(3);
    setSampleRate(16);
  }

  function setAliasPreset() {
    setFrequency(7);
    setSampleRate(10);
  }

  return (
    <div className="sampling-alias-lab">
      <div className="sampling-lab-toolbar">
        <div className="sampling-lab-controls">
          <label>
            <span>Tần số signal <strong><MathExpr tex={`${frequency.toFixed(1)}\\,\\mathrm{Hz}`} /></strong></span>
            <input
              type="range"
              min="1"
              max="18"
              step="0.5"
              value={frequency}
              onChange={(event) => setFrequency(Number(event.target.value))}
            />
          </label>
          <label>
            <span>Sampling rate <strong><MathExpr tex={`${sampleRate.toFixed(0)}\\,\\mathrm{Hz}`} /></strong></span>
            <input
              type="range"
              min="4"
              max="24"
              step="1"
              value={sampleRate}
              onChange={(event) => setSampleRate(Number(event.target.value))}
            />
          </label>
        </div>
        <div className="sampling-presets" aria-label="Ví dụ nhanh">
          <button type="button" onClick={setSafePreset}><MathExpr tex={String.raw`3\\,\\mathrm{Hz}`} /> @ <MathExpr tex={String.raw`16\\,\\mathrm{Hz}`} /></button>
          <button type="button" onClick={setAliasPreset}><MathExpr tex={String.raw`7\\,\\mathrm{Hz}`} /> @ <MathExpr tex={String.raw`10\\,\\mathrm{Hz}`} /></button>
        </div>
      </div>

      <div className="sampling-lab-readout">
        <div>
          <small>NYQUIST FREQUENCY</small>
          <strong><MathExpr tex={`${nyquistFrequency.toFixed(1)}\\,\\mathrm{Hz}`} /></strong>
          <span><MathExpr tex="f_s/2" /></span>
        </div>
        <div>
          <small>INPUT TONE</small>
          <strong><MathExpr tex={`${frequency.toFixed(1)}\\,\\mathrm{Hz}`} /></strong>
          <span><MathExpr tex={String.raw`\\cos(2\\pi f t)`} /></span>
        </div>
        <div className={isAliasing ? 'warning' : 'ok'}>
          <small>SAU SAMPLING</small>
          <strong><MathExpr tex={`${aliasFrequency.toFixed(1)}\\,\\mathrm{Hz}`} /></strong>
          <span>{isAliasing ? 'alias xuất hiện' : 'không bị fold'}</span>
        </div>
      </div>

      <div className="sampling-lab-plot">
        <div className="sampling-lab-legend">
          <span><i className="legend-original"></i> waveform gốc</span>
          {isAliasing && <span><i className="legend-alias"></i> waveform alias cũng đi qua các sample</span>}
          <span><i className="legend-sample"></i> samples</span>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="So sánh waveform liên tục, samples và waveform alias">
          <line className="sampling-lab-axis" x1={LEFT} y1={MID} x2={W - RIGHT} y2={MID} />
          <line className="sampling-lab-axis" x1={LEFT} y1={TOP} x2={LEFT} y2={H - BOTTOM} />
          <text className="sampling-lab-svg-label" x={W - RIGHT - 12} y={MID - 8}>thời gian</text>

          <path className="sampling-lab-original" d={originalPath} />
          {isAliasing && <path className="sampling-lab-alias" d={aliasPath} />}

          {samples.map((sample) => (
            <g key={sample.n}>
              <line className="sampling-lab-stem" x1={sample.x} y1={MID} x2={sample.x} y2={sample.y} />
              <circle className="sampling-lab-dot" cx={sample.x} cy={sample.y} r="4.5" />
            </g>
          ))}
        </svg>
      </div>

      <p className="sampling-lab-caption">
        {isAliasing ? (
          <>
            Ở các thời điểm lấy mẫu, tone <MathExpr tex={`${frequency.toFixed(1)}\\,\\mathrm{Hz}`} /> và tone{' '}
            <MathExpr tex={`${aliasFrequency.toFixed(1)}\\,\\mathrm{Hz}`} /> tạo ra cùng các giá trị sample.
            Sau khi đã lấy mẫu, receiver không còn đủ thông tin để phân biệt hai waveform này chỉ từ dãy sample.
          </>
        ) : (
          <>
            Tần số signal đang nằm dưới <MathExpr tex="f_s/2" />. Các spectral replica chưa fold phần tone này
            về một tần số thấp hơn trong dải quan sát.
          </>
        )}
      </p>
    </div>
  );
}
