import { useMemo, useState } from 'react';
import MathExpr, { SvgMathExpr } from './MathExpr.jsx';

const W = 760;
const H = 220;
const PAD = 34;

function pathFromFn(fn, scale = 70, points = 520) {
  const out = [];
  for (let n = 0; n <= points; n += 1) {
    const t = n / points;
    const x = PAD + t * (W - 2 * PAD);
    const y = H / 2 - scale * fn(t);
    out.push((n === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2));
  }
  return out.join(' ');
}

function zeroOrderHoldPath(samples) {
  const out = [];
  const count = samples.length;
  const left = PAD;
  const width = W - 2 * PAD;

  samples.forEach((sample, index) => {
    const x0 = left + (index / count) * width;
    const x1 = left + ((index + 1) / count) * width;
    const y = H / 2 - 70 * sample;

    if (index === 0) out.push('M' + x0.toFixed(2) + ' ' + y.toFixed(2));
    out.push('L' + x1.toFixed(2) + ' ' + y.toFixed(2));

    if (index < count - 1) {
      const nextY = H / 2 - 70 * samples[index + 1];
      out.push('L' + x1.toFixed(2) + ' ' + nextY.toFixed(2));
    }
  });

  return out.join(' ');
}

function spectrumX(value, min, max) {
  return 54 + ((value - min) / (max - min)) * 652;
}

export default function RFChainExplorer() {
  const [mode, setMode] = useState('dac');

  const [sampleCount, setSampleCount] = useState(24);
  const [basebandCycles, setBasebandCycles] = useState(2);
  const [dacPhase, setDacPhase] = useState(25);

  const [amplitude, setAmplitude] = useState(0.85);
  const [offset, setOffset] = useState(2);
  const [carrierCycles, setCarrierCycles] = useState(10);
  const [rfPhase, setRfPhase] = useState(20);

  const dacPhaseRad = (dacPhase * Math.PI) / 180;
  const idealIPath = useMemo(
    () => pathFromFn((t) => Math.cos(2 * Math.PI * basebandCycles * t + dacPhaseRad)),
    [basebandCycles, dacPhaseRad]
  );

  const dacSamples = useMemo(
    () => Array.from(
      { length: sampleCount },
      (_, n) => Math.cos(2 * Math.PI * basebandCycles * (n / sampleCount) + dacPhaseRad)
    ),
    [sampleCount, basebandCycles, dacPhaseRad]
  );

  const holdPath = useMemo(() => zeroOrderHoldPath(dacSamples), [dacSamples]);

  const rfPhaseRad = (rfPhase * Math.PI) / 180;
  const iPath = useMemo(
    () => pathFromFn((t) => amplitude * Math.cos(2 * Math.PI * offset * t + rfPhaseRad)),
    [amplitude, offset, rfPhaseRad]
  );
  const qPath = useMemo(
    () => pathFromFn((t) => amplitude * Math.sin(2 * Math.PI * offset * t + rfPhaseRad)),
    [amplitude, offset, rfPhaseRad]
  );
  const rfFrequency = carrierCycles + offset;
  const rfPath = useMemo(
    () => pathFromFn((t) => amplitude * Math.cos(2 * Math.PI * rfFrequency * t + rfPhaseRad)),
    [amplitude, rfFrequency, rfPhaseRad]
  );

  const spectrumMin = -4;
  const spectrumMax = carrierCycles + 5;
  const bbX = spectrumX(offset, spectrumMin, spectrumMax);
  const carrierX = spectrumX(carrierCycles, spectrumMin, spectrumMax);
  const rfX = spectrumX(rfFrequency, spectrumMin, spectrumMax);

  return (
    <div className="rf-chain-lab rf-chain-lab-v2">
      <div className="rf-lab-mode-tabs" role="tablist" aria-label="Chọn DAC reconstruction hoặc frequency translation">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'dac'}
          className={mode === 'dac' ? 'selected' : ''}
          onClick={() => setMode('dac')}
        >
          DAC & reconstruction
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'mix'}
          className={mode === 'mix' ? 'selected' : ''}
          onClick={() => setMode('mix')}
        >
          Frequency translation
        </button>
      </div>

      {mode === 'dac' ? (
        <>
          <div className="rf-chain-controls rf-chain-controls-v2">
            <label>
              <span>Samples / record <strong><MathExpr tex={'N=' + sampleCount} /></strong></span>
              <input
                type="range"
                min="12"
                max="48"
                step="4"
                value={sampleCount}
                onChange={(event) => setSampleCount(Number(event.target.value))}
              />
            </label>
            <label>
              <span>Baseband cycles <strong><MathExpr tex={String(basebandCycles)} /></strong></span>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={basebandCycles}
                onChange={(event) => setBasebandCycles(Number(event.target.value))}
              />
            </label>
            <label>
              <span>Phase <strong><MathExpr tex={'\\phi=' + dacPhase + '^\\circ'} /></strong></span>
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={dacPhase}
                onChange={(event) => setDacPhase(Number(event.target.value))}
              />
            </label>
          </div>

          <div className="rf-chain-readout metric-card-grid">
            <div className="metric-card">
              <small className="metric-card-label">DIGITAL OBJECT</small>
              <strong className="metric-card-value"><MathExpr tex="I[n]" /></strong>
              <span className="metric-card-formula">discrete sample sequence</span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">DAC OUTPUT MODEL</small>
              <strong className="metric-card-value">zero-order hold</strong>
              <span className="metric-card-formula">piecewise-held analog level</span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">RECONSTRUCTION TARGET</small>
              <strong className="metric-card-value"><MathExpr tex="I(t)" /></strong>
              <span className="metric-card-formula">wanted analog baseband</span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">OTHER BRANCH</small>
              <strong className="metric-card-value"><MathExpr tex="Q[n]\to Q(t)" /></strong>
              <span className="metric-card-formula">same idea on quadrature path</span>
            </div>
          </div>

          <div className="rf-dac-panel">
            <div className="visual-caption">
              <span>ONE BRANCH OF THE DAC PATH</span>
              <strong>samples → held output → reconstructed baseband</strong>
            </div>

            <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label="Digital samples, zero order hold and reconstructed baseband waveform">
              <line className="rfc-axis" x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} />
              <path className="rfc-dac-hold" d={holdPath} />
              <path className="rfc-dac-ideal" d={idealIPath} />
              {dacSamples.map((value, n) => {
                const x = PAD + ((n + 0.5) / sampleCount) * (W - 2 * PAD);
                const y = H / 2 - 70 * value;
                return (
                  <g key={n}>
                    <line className="rfc-dac-stem" x1={x} y1={H / 2} x2={x} y2={y} />
                    <circle className="rfc-dac-sample" cx={x} cy={y} r="3" />
                  </g>
                );
              })}
            </svg>

            <div className="rf-dac-legend">
              <span><i className="sample"></i>digital samples</span>
              <span><i className="hold"></i>illustrative DAC hold output</span>
              <span><i className="ideal"></i>wanted in-band analog waveform</span>
            </div>
          </div>

          <p className="rf-lab-caption">
            Đường smooth là reference cho wanted in-band waveform, không phải khẳng định một reconstruction filter thực sẽ tạo đúng đường này.
            Hardware filter chỉ cần giữ wanted band và suppress images đủ cho system requirement.
          </p>
        </>
      ) : (
        <>
          <div className="rf-chain-controls rf-chain-controls-v2">
            <label>
              <span>Baseband offset <strong><MathExpr tex={'f_b=' + offset} /></strong></span>
              <input
                type="range"
                min="-3"
                max="3"
                step="1"
                value={offset}
                onChange={(event) => setOffset(Number(event.target.value))}
              />
            </label>
            <label>
              <span>Carrier on screen <strong><MathExpr tex={'f_c=' + carrierCycles} /></strong></span>
              <input
                type="range"
                min="8"
                max="14"
                step="1"
                value={carrierCycles}
                onChange={(event) => setCarrierCycles(Number(event.target.value))}
              />
            </label>
            <label>
              <span>Amplitude <strong><MathExpr tex={'A=' + amplitude.toFixed(2)} /></strong></span>
              <input
                type="range"
                min="0.2"
                max="1"
                step="0.05"
                value={amplitude}
                onChange={(event) => setAmplitude(Number(event.target.value))}
              />
            </label>
          </div>

          <div className="rf-chain-readout metric-card-grid">
            <div className="metric-card">
              <small className="metric-card-label">COMPLEX BASEBAND</small>
              <strong className="metric-card-value"><MathExpr tex={String.raw`Ae^{j(2\pi f_bt+\phi)}`} /></strong>
              <span className="metric-card-formula">signed frequency offset</span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">LOCAL OSCILLATOR</small>
              <strong className="metric-card-value"><MathExpr tex="f_c" /></strong>
              <span className="metric-card-formula">center frequency reference</span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">RF TONE</small>
              <strong className="metric-card-value"><MathExpr tex={String.raw`f_c+f_b`} /></strong>
              <span className="metric-card-formula"><MathExpr tex={String(rfFrequency)} /> screen cycles</span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">SIDEBAND</small>
              <strong className="metric-card-value">{offset > 0 ? 'upper' : offset < 0 ? 'lower' : 'carrier center'}</strong>
              <span className="metric-card-formula">set by sign of baseband frequency</span>
            </div>
          </div>

          <div className="rf-translation-grid">
            <div className="rf-wave-stack rf-wave-stack-v2">
              <article>
                <small><MathExpr tex="I(t)" /> component</small>
                <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label="In phase baseband component">
                  <line className="rfc-axis" x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} />
                  <path className="rfc-wave i-wave" d={iPath} />
                </svg>
              </article>
              <article>
                <small><MathExpr tex="Q(t)" /> component</small>
                <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label="Quadrature baseband component">
                  <line className="rfc-axis" x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} />
                  <path className="rfc-wave q-wave" d={qPath} />
                </svg>
              </article>
              <article className="rf-sum">
                <small>real RF waveform after ideal upconversion</small>
                <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label="Real RF waveform after frequency translation">
                  <line className="rfc-axis" x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} />
                  <path className="rfc-wave rf-wave" d={rfPath} />
                </svg>
              </article>
            </div>

            <div className="rf-spectrum-shift-panel">
              <div className="visual-caption">
                <span>FREQUENCY TRANSLATION</span>
                <strong>signed baseband offset → RF side of carrier</strong>
              </div>

              <svg viewBox="0 0 760 250" role="img" aria-label="Complex baseband tone shifted around an RF carrier">
                <line className="rfc-axis" x1="54" y1="194" x2="706" y2="194" />
                <line className="rfc-spectrum-guide" x1={carrierX} y1="38" x2={carrierX} y2="194" />
                <line className="rfc-spectrum-bb" x1={bbX} y1="194" x2={bbX} y2="92" />
                <circle className="rfc-spectrum-bb-dot" cx={bbX} cy="92" r="5" />
                <line className="rfc-spectrum-rf" x1={rfX} y1="194" x2={rfX} y2="64" />
                <circle className="rfc-spectrum-rf-dot" cx={rfX} cy="64" r="6" />
                <SvgMathExpr tex="0" x={spectrumX(0, spectrumMin, spectrumMax) - 8} y={204} width={18} />
                <SvgMathExpr tex="f_c" x={carrierX - 15} y={204} width={34} />
                <SvgMathExpr tex="f_b" x={bbX - 12} y={66} width={30} />
                <SvgMathExpr tex={String.raw`f_c+f_b`} x={rfX - 34} y={34} width={72} />
              </svg>

              <p>
                Đây là single-tone example. Một arbitrary complex-baseband spectrum được dịch theo cùng nguyên tắc:
                offsets quanh zero trở thành offsets quanh carrier.
              </p>
            </div>
          </div>

          <p className="rf-lab-caption">
            Các “cycles” chỉ là normalized screen frequencies để nhìn được waveform.
            Radio thật có thể dùng carrier ở hàng trăm MHz hoặc nhiều GHz trong khi baseband bandwidth nhỏ hơn rất nhiều.
          </p>
        </>
      )}
    </div>
  );
}
