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
    points.push((i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2));
  }
  return points.join(' ');
}

function frequencyX(value, maxFrequency) {
  return LEFT + ((value + maxFrequency) / (2 * maxFrequency)) * PLOT_W;
}

export default function SamplingAliasExplorer() {
  const [frequency, setFrequency] = useState(7);
  const [sampleRate, setSampleRate] = useState(10);
  const [view, setView] = useState('time');

  const aliasFrequency = useMemo(() => foldAlias(frequency, sampleRate), [frequency, sampleRate]);
  const nyquistFrequency = sampleRate / 2;
  const isBoundary = Math.abs(frequency - nyquistFrequency) < 1e-9;
  const isAliasing = frequency > nyquistFrequency + 1e-9;
  const status = isBoundary ? 'boundary' : isAliasing ? 'aliasing' : 'safe';

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

  const spectrum = useMemo(() => {
    const maxFrequency = Math.max(sampleRate * 1.6, frequency * 1.25, 12);
    const replicaLines = [];

    for (let m = -2; m <= 2; m += 1) {
      replicaLines.push(m * sampleRate + frequency);
      replicaLines.push(m * sampleRate - frequency);
    }

    return {
      maxFrequency,
      replicaLines: [...new Set(replicaLines.map((value) => Number(value.toFixed(8))))]
        .filter((value) => Math.abs(value) <= maxFrequency),
    };
  }, [frequency, sampleRate]);

  function setSafePreset() {
    setFrequency(3);
    setSampleRate(16);
  }

  function setBoundaryPreset() {
    setFrequency(5);
    setSampleRate(10);
  }

  function setAliasPreset() {
    setFrequency(7);
    setSampleRate(10);
  }

  return (
    <div className="sampling-alias-lab sampling-alias-lab-v2">
      <div className="sampling-lab-toolbar">
        <div className="sampling-lab-controls">
          <label>
            <span>Tần số signal <strong><MathExpr tex={frequency.toFixed(1) + '\\,\\mathrm{Hz}'} /></strong></span>
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
            <span>Sampling rate <strong><MathExpr tex={sampleRate.toFixed(0) + '\\,\\mathrm{Hz}'} /></strong></span>
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
          <button type="button" onClick={setSafePreset}>Safe</button>
          <button type="button" onClick={setBoundaryPreset}>Boundary</button>
          <button type="button" onClick={setAliasPreset}>Aliasing</button>
        </div>
      </div>

      <div className="sampling-view-tabs" role="tablist" aria-label="Chọn cách nhìn aliasing">
        <button
          type="button"
          role="tab"
          aria-selected={view === 'time'}
          className={view === 'time' ? 'selected' : ''}
          onClick={() => setView('time')}
        >
          Time view
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'spectrum'}
          className={view === 'spectrum' ? 'selected' : ''}
          onClick={() => setView('spectrum')}
        >
          Spectrum view
        </button>
      </div>

      <div className="sampling-lab-readout sampling-lab-readout-v2">
        <div>
          <small>NYQUIST FREQUENCY</small>
          <strong><MathExpr tex={nyquistFrequency.toFixed(1) + '\\,\\mathrm{Hz}'} /></strong>
          <span><MathExpr tex="f_s/2" /></span>
        </div>
        <div>
          <small>INPUT TONE</small>
          <strong><MathExpr tex={frequency.toFixed(1) + '\\,\\mathrm{Hz}'} /></strong>
          <span><MathExpr tex={String.raw`\cos(2\pi f t)`} /></span>
        </div>
        <div className={'sampling-status ' + status}>
          <small>STATUS</small>
          <strong>{status === 'safe' ? 'SAFE REGION' : status === 'boundary' ? 'NYQUIST BOUNDARY' : 'ALIASING'}</strong>
          <span>
            {status === 'safe'
              ? 'input nằm dưới f_s/2'
              : status === 'boundary'
                ? 'phase-sensitive edge case'
                : 'fold về ' + aliasFrequency.toFixed(1) + ' Hz'}
          </span>
        </div>
      </div>

      <div className="sampling-lab-plot">
        {view === 'time' ? (
          <>
            <div className="sampling-lab-legend">
              <span><i className="legend-original"></i> waveform gốc</span>
              {isAliasing && <span><i className="legend-alias"></i> waveform alias cũng đi qua các sample</span>}
              <span><i className="legend-sample"></i> samples</span>
            </div>

            <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label="So sánh waveform liên tục, samples và waveform alias">
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
          </>
        ) : (
          <>
            <div className="sampling-lab-legend">
              <span><i className="legend-original"></i> original tone locations</span>
              <span><i className="legend-replica"></i> sampling replicas</span>
              <span><i className="legend-zone"></i> principal Nyquist interval</span>
            </div>

            <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label="Các spectral replicas cách nhau bởi sampling rate">
              <rect
                className="sampling-principal-zone"
                x={frequencyX(-nyquistFrequency, spectrum.maxFrequency)}
                y={TOP}
                width={frequencyX(nyquistFrequency, spectrum.maxFrequency) - frequencyX(-nyquistFrequency, spectrum.maxFrequency)}
                height={H - TOP - BOTTOM}
              />
              <line className="sampling-lab-axis" x1={LEFT} y1={H - BOTTOM} x2={W - RIGHT} y2={H - BOTTOM} />
              <line
                className="sampling-spectrum-boundary"
                x1={frequencyX(-nyquistFrequency, spectrum.maxFrequency)}
                y1={TOP}
                x2={frequencyX(-nyquistFrequency, spectrum.maxFrequency)}
                y2={H - BOTTOM}
              />
              <line
                className="sampling-spectrum-boundary"
                x1={frequencyX(nyquistFrequency, spectrum.maxFrequency)}
                y1={TOP}
                x2={frequencyX(nyquistFrequency, spectrum.maxFrequency)}
                y2={H - BOTTOM}
              />

              {spectrum.replicaLines.map((lineFrequency) => {
                const isOriginal = Math.abs(Math.abs(lineFrequency) - frequency) < 1e-8;
                return (
                  <line
                    key={lineFrequency}
                    className={isOriginal ? 'sampling-spectrum-line original' : 'sampling-spectrum-line replica'}
                    x1={frequencyX(lineFrequency, spectrum.maxFrequency)}
                    y1={H - BOTTOM}
                    x2={frequencyX(lineFrequency, spectrum.maxFrequency)}
                    y2={isOriginal ? 62 : 88}
                  />
                );
              })}

              <line
                className="sampling-spectrum-line alias-location"
                x1={frequencyX(aliasFrequency, spectrum.maxFrequency)}
                y1={H - BOTTOM}
                x2={frequencyX(aliasFrequency, spectrum.maxFrequency)}
                y2={48}
              />
              <line
                className="sampling-spectrum-line alias-location"
                x1={frequencyX(-aliasFrequency, spectrum.maxFrequency)}
                y1={H - BOTTOM}
                x2={frequencyX(-aliasFrequency, spectrum.maxFrequency)}
                y2={48}
              />

              <text className="sampling-lab-svg-label" x={frequencyX(-nyquistFrequency, spectrum.maxFrequency) - 24} y={H - 8}>-fs/2</text>
              <text className="sampling-lab-svg-label" x={frequencyX(0, spectrum.maxFrequency) - 4} y={H - 8}>0</text>
              <text className="sampling-lab-svg-label" x={frequencyX(nyquistFrequency, spectrum.maxFrequency) - 18} y={H - 8}>fs/2</text>
            </svg>
          </>
        )}
      </div>

      <div className="sampling-lab-caption sampling-lab-caption-v2">
        {status === 'aliasing' ? (
          <p>
            Tone <MathExpr tex={frequency.toFixed(1) + '\\,\\mathrm{Hz}'} /> nằm ngoài principal Nyquist interval và có một discrete-time equivalent tại{' '}
            <MathExpr tex={aliasFrequency.toFixed(1) + '\\,\\mathrm{Hz}'} />.
            Trong time view, hai waveform đi qua cùng sample values. Trong spectrum view, các copies do sampling cho thấy vì sao frequency bị fold.
          </p>
        ) : status === 'boundary' ? (
          <p>
            Đây là đúng biên <MathExpr tex="f_s/2" />, không nên coi như một vùng “safe” bình thường.
            Với một sinusoid có phase bất kỳ, <MathExpr tex={String.raw`x[n]=\cos(\pi n+\phi)=(-1)^n\cos\phi`} /> nên phần thông tin liên quan tới quadrature/phase có thể mất.
            Vì vậy bài dùng điều kiện nghiêm ngặt <MathExpr tex="f_s>2B" /> cho reconstruction lý tưởng.
          </p>
        ) : (
          <p>
            Tone đang nằm dưới <MathExpr tex="f_s/2" /> trong ví dụ real low-pass này.
            Spectrum copies vẫn tồn tại, nhưng tone gốc còn nằm trong principal Nyquist interval thay vì bị fold vào một frequency thấp khác.
          </p>
        )}
      </div>
    </div>
  );
}
