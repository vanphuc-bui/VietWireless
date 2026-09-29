import { useMemo, useState } from 'react';
import MathExpr, { SvgMathExpr } from './MathExpr.jsx';

const W = 760;
const H = 230;
const PAD = 34;
const ORTH_N = 192;

function channelMagnitude(f) {
  return (
    0.92
    + 0.22 * Math.cos(2 * Math.PI * (f + 0.08))
    - 0.18 * Math.cos(4 * Math.PI * (f - 0.11))
    - 0.42 * Math.exp(-Math.pow((f - 0.17) / 0.075, 2))
  );
}

function channelPath() {
  const points = 420;
  const values = Array.from({ length: points + 1 }, (_, index) => {
    const f = -0.5 + index / points;
    return { f, h: Math.max(0.08, channelMagnitude(f)) };
  });
  const maxH = Math.max(...values.map((item) => item.h));

  return values.map((item, index) => {
    const x = PAD + (index / points) * (W - 2 * PAD);
    const y = H - 36 - (item.h / maxH) * 150;
    return (index === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2);
  }).join(' ');
}

const CHANNEL_PATH = channelPath();

function orthWavePath(k, spacingScale, phase = 0) {
  const points = [];
  for (let n = 0; n <= ORTH_N; n += 1) {
    const t = n / ORTH_N;
    const x = PAD + t * (W - 2 * PAD);
    const y = H / 2 - 65 * Math.cos(2 * Math.PI * k * spacingScale * t + phase);
    points.push((n === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2));
  }
  return points.join(' ');
}

function sinc(value) {
  if (Math.abs(value) < 1e-9) return 1;
  return Math.sin(Math.PI * value) / (Math.PI * value);
}

function spectrumPath(center, spacingScale, plotScale = 1) {
  const points = 420;
  return Array.from({ length: points + 1 }, (_, index) => {
    const f = -4 + (8 * index) / points;
    const response = Math.abs(sinc((f - center * spacingScale) / spacingScale));
    const x = PAD + (index / points) * (W - 2 * PAD);
    const y = H - 34 - 145 * response * plotScale;
    return (index === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2);
  }).join(' ');
}

function aggregateTimePath(activeCount, phases) {
  const points = 360;
  const activeBins = Array.from({ length: activeCount }, (_, index) => index - Math.floor(activeCount / 2));

  const values = Array.from({ length: points + 1 }, (_, sample) => {
    const t = sample / points;
    let re = 0;
    for (let index = 0; index < activeBins.length; index += 1) {
      re += Math.cos(2 * Math.PI * activeBins[index] * t + phases[index]);
    }
    return re / Math.sqrt(activeCount);
  });

  const maxAbs = Math.max(...values.map((value) => Math.abs(value)), 1e-9);
  const path = values.map((value, index) => {
    const x = PAD + (index / points) * (W - 2 * PAD);
    const y = H / 2 - (value / maxAbs) * 72;
    return (index === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2);
  }).join(' ');

  return { path, peak: maxAbs };
}

export default function OFDMOrthogonalityExplorer() {
  const [mode, setMode] = useState('slice');

  const [subcarrierCount, setSubcarrierCount] = useState(8);
  const [selectedBin, setSelectedBin] = useState(4);

  const [k1, setK1] = useState(1);
  const [k2, setK2] = useState(2);
  const [spacingScale, setSpacingScale] = useState(1);

  const [activeCount, setActiveCount] = useState(8);
  const [phasePreset, setPhasePreset] = useState('spread');

  const binWidth = 1 / subcarrierCount;
  const safeBin = Math.min(selectedBin, subcarrierCount - 1);
  const binLeft = -0.5 + safeBin * binWidth;
  const binRight = binLeft + binWidth;
  const binCenter = (binLeft + binRight) / 2;

  const centerH = channelMagnitude(binCenter);
  const leftH = channelMagnitude(binLeft);
  const rightH = channelMagnitude(binRight);
  const withinBinVariation = Math.max(
    Math.abs(leftH - centerH),
    Math.abs(rightH - centerH)
  );

  const orthInner = useMemo(() => {
    let re = 0;
    let im = 0;
    for (let n = 0; n < ORTH_N; n += 1) {
      const t = n / ORTH_N;
      const angle = 2 * Math.PI * (k1 - k2) * spacingScale * t;
      re += Math.cos(angle);
      im += Math.sin(angle);
    }
    return Math.hypot(re / ORTH_N, im / ORTH_N);
  }, [k1, k2, spacingScale]);

  const wave1 = useMemo(() => orthWavePath(k1, spacingScale), [k1, spacingScale]);
  const wave2 = useMemo(() => orthWavePath(k2, spacingScale), [k2, spacingScale]);
  const spectrum1 = useMemo(() => spectrumPath(k1, spacingScale), [k1, spacingScale]);
  const spectrum2 = useMemo(() => spectrumPath(k2, spacingScale), [k2, spacingScale]);

  const timePhases = useMemo(() => {
    if (phasePreset === 'aligned') {
      return Array.from({ length: activeCount }, () => 0);
    }

    return Array.from(
      { length: activeCount },
      (_, index) => ((index * 137.5) % 360) * Math.PI / 180
    );
  }, [activeCount, phasePreset]);

  const aggregate = useMemo(
    () => aggregateTimePath(activeCount, timePhases),
    [activeCount, timePhases]
  );

  function selectMode(next) {
    setMode(next);
    if (next === 'slice') {
      setSubcarrierCount(8);
      setSelectedBin(4);
    }
    if (next === 'orth') {
      setK1(1);
      setK2(2);
      setSpacingScale(1);
    }
    if (next === 'sum') {
      setActiveCount(8);
      setPhasePreset('spread');
    }
  }

  return (
    <div className="ofdm-orthogonality-lab ofdm-overview-lab">
      <div className="ofdm-overview-tabs" role="tablist" aria-label="Chọn góc nhìn OFDM">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'slice'}
          className={mode === 'slice' ? 'selected' : ''}
          onClick={() => selectMode('slice')}
        >
          Channel slicing
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'orth'}
          className={mode === 'orth' ? 'selected' : ''}
          onClick={() => selectMode('orth')}
        >
          Orthogonality
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'sum'}
          className={mode === 'sum' ? 'selected' : ''}
          onClick={() => selectMode('sum')}
        >
          Parallel → one waveform
        </button>
      </div>

      {mode === 'slice' && (
        <>
          <div className="ofdm-overview-controls">
            <label>
              <span>
                Number of conceptual subcarriers{" "}
                <strong><MathExpr tex={'N=' + subcarrierCount} /></strong>
              </span>
              <input
                type="range"
                min="4"
                max="16"
                step="2"
                value={subcarrierCount}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setSubcarrierCount(next);
                  setSelectedBin(Math.min(safeBin, next - 1));
                }}
              />
            </label>

            <label>
              <span>
                Inspect subcarrier{" "}
                <strong><MathExpr tex={'k=' + safeBin} /></strong>
              </span>
              <input
                type="range"
                min="0"
                max={subcarrierCount - 1}
                step="1"
                value={safeBin}
                onChange={(event) => setSelectedBin(Number(event.target.value))}
              />
            </label>
          </div>

          <div className="ofdm-overview-readout metric-card-grid">
            <div className="metric-card">
              <small className="metric-card-label">NORMALIZED TOTAL BAND</small>
              <strong className="metric-card-value"><MathExpr tex="1" /></strong>
              <span className="metric-card-formula">fixed in this illustration</span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">SUBCARRIER WIDTH</small>
              <strong className="metric-card-value"><MathExpr tex={(binWidth).toFixed(3)} /></strong>
              <span className="metric-card-formula"><MathExpr tex={String.raw`B/N`} /></span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">CENTER CHANNEL MAGNITUDE</small>
              <strong className="metric-card-value"><MathExpr tex={centerH.toFixed(3)} /></strong>
              <span className="metric-card-formula"><MathExpr tex={String.raw`|H(f_k)|`} /></span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">WITHIN-BIN VARIATION</small>
              <strong className="metric-card-value"><MathExpr tex={withinBinVariation.toFixed(3)} /></strong>
              <span className="metric-card-formula">illustrative flatness error</span>
            </div>
          </div>

          <div className="ofdm-channel-slicing-panel">
            <div className="visual-caption">
              <span>ONE WIDEBAND CHANNEL RESPONSE</span>
              <strong>narrower slices see less variation locally</strong>
            </div>

            <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label="Frequency-selective channel divided into narrow OFDM subcarrier slices">
              <line className="ofdm-overview-axis" x1={PAD} y1={H - 36} x2={W - PAD} y2={H - 36} />

              {Array.from({ length: subcarrierCount + 1 }, (_, index) => {
                const x = PAD + (index / subcarrierCount) * (W - 2 * PAD);
                return (
                  <line
                    key={index}
                    className="ofdm-slice-boundary"
                    x1={x}
                    y1="28"
                    x2={x}
                    y2={H - 36}
                  />
                );
              })}

              <rect
                className="ofdm-selected-slice"
                x={PAD + (safeBin / subcarrierCount) * (W - 2 * PAD)}
                y="28"
                width={(W - 2 * PAD) / subcarrierCount}
                height={H - 64}
              />

              <path className="ofdm-channel-response" d={CHANNEL_PATH} />

              {Array.from({ length: subcarrierCount }, (_, index) => {
                const f = -0.5 + (index + 0.5) / subcarrierCount;
                const x = PAD + ((index + 0.5) / subcarrierCount) * (W - 2 * PAD);
                const h = Math.max(0.08, channelMagnitude(f));
                const y = H - 36 - (h / 1.55) * 150;
                return <circle key={index} className="ofdm-bin-sample" cx={x} cy={y} r={index === safeBin ? 5.5 : 3.5} />;
              })}

              <SvgMathExpr tex={String.raw`f`} x={W - 54} y={H - 29} width={22} />
              <SvgMathExpr tex={String.raw`|H(f)|`} x={PAD + 2} y={22} width={54} />
            </svg>

            <p>
              Curve này chỉ là một illustrative frequency-selective response.
              Điều cần nhìn là khi cùng total bandwidth được chia thành nhiều lát hẹp hơn,
              local variation của <MathExpr tex="H(f)" /> trong mỗi lát thường nhỏ hơn.
            </p>
          </div>
        </>
      )}

      {mode === 'orth' && (
        <>
          <div className="ofdm-orth-controls ofdm-orth-controls-v2">
            <label>
              <span>
                Subcarrier{" "}
                <MathExpr tex="k_1" />{" "}
                <strong><MathExpr tex={String(k1)} /></strong>
              </span>
              <input
                type="range"
                min="0"
                max="4"
                step="1"
                value={k1}
                onChange={(event) => setK1(Number(event.target.value))}
              />
            </label>

            <label>
              <span>
                Subcarrier{" "}
                <MathExpr tex="k_2" />{" "}
                <strong><MathExpr tex={String(k2)} /></strong>
              </span>
              <input
                type="range"
                min="0"
                max="4"
                step="1"
                value={k2}
                onChange={(event) => setK2(Number(event.target.value))}
              />
            </label>

            <label>
              <span>
                Actual spacing / ideal spacing{" "}
                <strong><MathExpr tex={spacingScale.toFixed(2)} /></strong>
              </span>
              <input
                type="range"
                min="0.75"
                max="1.25"
                step="0.01"
                value={spacingScale}
                onChange={(event) => setSpacingScale(Number(event.target.value))}
              />
            </label>
          </div>

          <div className="ofdm-overview-readout metric-card-grid">
            <div className="metric-card">
              <small className="metric-card-label">USEFUL DURATION</small>
              <strong className="metric-card-value"><MathExpr tex="T_u=1" /></strong>
              <span className="metric-card-formula">normalized interval</span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">IDEAL SPACING</small>
              <strong className="metric-card-value"><MathExpr tex={String.raw`\Delta f=1/T_u`} /></strong>
              <span className="metric-card-formula">integer frequency grid</span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">INNER PRODUCT MAGNITUDE</small>
              <strong className="metric-card-value"><MathExpr tex={orthInner.toFixed(3)} /></strong>
              <span className="metric-card-formula">0 means orthogonal for different bins</span>
            </div>
            <div className={'metric-card ' + (k1 !== k2 && orthInner < 0.03 ? 'ofdm-good' : 'ofdm-warning')}>
              <small className="metric-card-label">STATUS</small>
              <strong className="metric-card-value">
                {k1 === k2
                  ? 'same basis'
                  : orthInner < 0.03
                    ? 'orthogonal'
                    : 'ICI-like coupling'}
              </strong>
              <span className="metric-card-formula">over the useful interval</span>
            </div>
          </div>

          <div className="ofdm-orth-grid-v2">
            <div className="ofdm-orth-wave">
              <div className="visual-caption">
                <span>REAL PART OVER ONE USEFUL SYMBOL</span>
                <strong>different integer-frequency bases</strong>
              </div>

              <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label="Two OFDM basis functions over one useful symbol interval">
                <line className="ofdm-orth-axis" x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} />
                <path className="ofdm-orth-wave-a" d={wave1} />
                <path className="ofdm-orth-wave-b" d={wave2} />
              </svg>

              <div className="ofdm-orth-legend">
                <span><i className="a"></i><MathExpr tex={'k_1=' + k1} /></span>
                <span><i className="b"></i><MathExpr tex={'k_2=' + k2} /></span>
              </div>
            </div>

            <div className="ofdm-spectrum-overlap">
              <div className="visual-caption">
                <span>RECTANGULAR-WINDOW SPECTRA</span>
                <strong>spectral overlap does not automatically destroy orthogonality</strong>
              </div>

              <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label="Overlapping sinc spectra of two OFDM subcarriers">
                <line className="ofdm-orth-axis" x1={PAD} y1={H - 34} x2={W - PAD} y2={H - 34} />
                <path className="ofdm-spectrum-a" d={spectrum1} />
                <path className="ofdm-spectrum-b" d={spectrum2} />
              </svg>

              <p>
                Với ideal spacing, FFT basis centers nằm tại zero crossings phù hợp của neighboring sinc responses.
                Khi spacing bị lệch, inner products không còn triệt tiêu đúng.
              </p>
            </div>
          </div>
        </>
      )}

      {mode === 'sum' && (
        <>
          <div className="ofdm-overview-controls">
            <label>
              <span>
                Active subcarriers{" "}
                <strong><MathExpr tex={'N_{\\rm act}=' + activeCount} /></strong>
              </span>
              <input
                type="range"
                min="2"
                max="16"
                step="2"
                value={activeCount}
                onChange={(event) => setActiveCount(Number(event.target.value))}
              />
            </label>

            <div className="ofdm-phase-preset">
              <span>Subcarrier phases</span>
              <div>
                <button
                  type="button"
                  className={phasePreset === 'spread' ? 'selected' : ''}
                  onClick={() => setPhasePreset('spread')}
                >
                  Spread phases
                </button>
                <button
                  type="button"
                  className={phasePreset === 'aligned' ? 'selected' : ''}
                  onClick={() => setPhasePreset('aligned')}
                >
                  Aligned phases
                </button>
              </div>
            </div>
          </div>

          <div className="ofdm-overview-readout metric-card-grid">
            <div className="metric-card">
              <small className="metric-card-label">ACTIVE SUBCARRIERS</small>
              <strong className="metric-card-value"><MathExpr tex={String(activeCount)} /></strong>
              <span className="metric-card-formula">parallel frequency coefficients</span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">USEFUL INTERVAL</small>
              <strong className="metric-card-value"><MathExpr tex="T_u" /></strong>
              <span className="metric-card-formula">all bins coexist in same block</span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">TIME WAVEFORM PEAK</small>
              <strong className="metric-card-value"><MathExpr tex={aggregate.peak.toFixed(2)} /></strong>
              <span className="metric-card-formula">normalized illustration</span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">PHASE PRESET</small>
              <strong className="metric-card-value">{phasePreset === 'aligned' ? 'aligned' : 'spread'}</strong>
              <span className="metric-card-formula">shows why time-domain peaks can vary</span>
            </div>
          </div>

          <div className="ofdm-sum-panel">
            <div className="visual-caption">
              <span>MANY FREQUENCY-DOMAIN COEFFICIENTS</span>
              <strong>one real-part view of the summed time-domain block</strong>
            </div>

            <div className="ofdm-bin-strip">
              {Array.from({ length: activeCount }, (_, index) => (
                <span key={index}>
                  <small><MathExpr tex={'k=' + index} /></small>
                  <strong><MathExpr tex={String.raw`X[k]`} /></strong>
                </span>
              ))}
            </div>

            <b className="ofdm-sum-arrow">IFFT / synthesis ↓</b>

            <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label="Time-domain OFDM waveform formed by summing many active subcarriers">
              <line className="ofdm-orth-axis" x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} />
              <path className="ofdm-time-sum" d={aggregate.path} />
            </svg>

            <p>
              Đây không phải power-amplifier simulation.
              Nó chỉ cho thấy một OFDM time block là <strong>superposition của nhiều basis functions</strong>,
              nên các subcarrier phases có thể tạo peaks rất khác nhau.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
