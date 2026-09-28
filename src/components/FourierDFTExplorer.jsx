import { useMemo, useState } from 'react';
import MathExpr, { SvgMathExpr } from './MathExpr.jsx';

const W = 760;
const H = 250;
const PAD = 36;
const FS = 64;

function dftComplex(samples) {
  const N = samples.length;
  return Array.from({ length: Math.floor(N / 2) + 1 }, (_, k) => {
    let re = 0;
    let im = 0;

    for (let n = 0; n < N; n += 1) {
      const angle = (-2 * Math.PI * k * n) / N;
      re += samples[n] * Math.cos(angle);
      im += samples[n] * Math.sin(angle);
    }

    return { k, re, im, magnitude: Math.hypot(re, im) };
  });
}

function hann(n, N) {
  if (N <= 1) return 1;
  return 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (N - 1));
}

function basisProducts(inputBin, candidateBin, N) {
  const points = [];
  let sumRe = 0;
  let sumIm = 0;

  for (let n = 0; n < N; n += 1) {
    const angle = (2 * Math.PI * (inputBin - candidateBin) * n) / N;
    const re = Math.cos(angle);
    const im = Math.sin(angle);
    points.push({ re, im });
    sumRe += re;
    sumIm += im;
  }

  return {
    points,
    sumRe,
    sumIm,
    normalizedMagnitude: Math.hypot(sumRe, sumIm) / N,
  };
}

export default function FourierDFTExplorer() {
  const [mode, setMode] = useState('basis');

  const [inputBin, setInputBin] = useState(7);
  const [candidateBin, setCandidateBin] = useState(7);

  const [tone, setTone] = useState(7.5);
  const [N, setN] = useState(64);
  const [windowName, setWindowName] = useState('rect');

  const basisN = 64;
  const basis = useMemo(
    () => basisProducts(inputBin, candidateBin, basisN),
    [inputBin, candidateBin]
  );

  const leakage = useMemo(() => {
    const raw = Array.from(
      { length: N },
      (_, n) => Math.cos((2 * Math.PI * tone * n) / FS)
    );
    const weights = Array.from(
      { length: N },
      (_, n) => (windowName === 'hann' ? hann(n, N) : 1)
    );
    const windowed = raw.map((value, n) => value * weights[n]);
    const coeffs = dftComplex(windowed);
    const coherentGain = weights.reduce((sum, value) => sum + value, 0) / N;
    const magnitudes = coeffs.map((bin) => ({
      ...bin,
      magnitude: (2 * bin.magnitude) / (N * coherentGain),
    }));

    return { raw, windowed, magnitudes };
  }, [tone, N, windowName]);

  const binSpacing = FS / N;
  const observationTime = N / FS;
  const toneInBins = tone / binSpacing;
  const closestBin = Math.round(toneInBins);
  const closestFrequency = closestBin * binSpacing;
  const binOffset = toneInBins - closestBin;
  const onBin = Math.abs(binOffset) < 1e-9;

  const timePoints = leakage.windowed
    .map((value, n) => {
      const x = PAD + (n / Math.max(N - 1, 1)) * (W - 2 * PAD);
      const y = H / 2 - 82 * value;
      return (n === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2);
    })
    .join(' ');

  const visibleBins = leakage.magnitudes
    .map((bin) => ({ ...bin, frequency: bin.k * binSpacing }))
    .filter((bin) => bin.frequency <= 24);
  const maxMagnitude = Math.max(...visibleBins.map((bin) => bin.magnitude), 1e-6);

  const planeCx = 180;
  const planeCy = 165;
  const planeR = 108;
  const sumEndX = planeCx + planeR * basis.normalizedMagnitude * (basis.sumRe === 0 ? 1 : basis.sumRe / Math.hypot(basis.sumRe, basis.sumIm));
  const sumEndY = planeCy - planeR * basis.normalizedMagnitude * (basis.sumIm === 0 ? 0 : basis.sumIm / Math.hypot(basis.sumRe, basis.sumIm));
  const residualCycles = inputBin - candidateBin;

  return (
    <div className="fourier-dft-lab fourier-dft-lab-v2">
      <div className="fourier-mode-tabs" role="tablist" aria-label="Chọn DFT basis projection hoặc leakage window">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'basis'}
          className={mode === 'basis' ? 'selected' : ''}
          onClick={() => setMode('basis')}
        >
          Basis projection
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'leakage'}
          className={mode === 'leakage' ? 'selected' : ''}
          onClick={() => setMode('leakage')}
        >
          Leakage & window
        </button>
      </div>

      {mode === 'basis' ? (
        <>
          <div className="fourier-controls fourier-basis-controls">
            <label>
              <span>Input bin <strong><MathExpr tex={'k_0=' + inputBin} /></strong></span>
              <input
                type="range"
                min="2"
                max="14"
                step="1"
                value={inputBin}
                onChange={(event) => setInputBin(Number(event.target.value))}
              />
            </label>

            <label>
              <span>Candidate bin <strong><MathExpr tex={'k=' + candidateBin} /></strong></span>
              <input
                type="range"
                min="2"
                max="14"
                step="1"
                value={candidateBin}
                onChange={(event) => setCandidateBin(Number(event.target.value))}
              />
            </label>
          </div>

          <div className="fourier-basis-readout metric-card-grid">
            <div className="metric-card">
              <small className="metric-card-label">INPUT</small>
              <strong className="metric-card-value"><MathExpr tex={'k_0=' + inputBin} /></strong>
              <span className="metric-card-formula"><MathExpr tex={String.raw`z[n]=e^{j2\pi k_0n/N}`} /></span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">CANDIDATE</small>
              <strong className="metric-card-value"><MathExpr tex={'k=' + candidateBin} /></strong>
              <span className="metric-card-formula"><MathExpr tex={String.raw`e^{-j2\pi kn/N}`} /></span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">RESIDUAL ROTATION</small>
              <strong className="metric-card-value"><MathExpr tex={residualCycles + '\\,\\text{cycle/record}'} /></strong>
              <span className="metric-card-formula"><MathExpr tex={String.raw`k_0-k`} /></span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">NORMALIZED SUM</small>
              <strong className="metric-card-value"><MathExpr tex={basis.normalizedMagnitude.toFixed(3)} /></strong>
              <span className="metric-card-formula">{inputBin === candidateBin ? 'coherent addition' : 'cancellation over the record'}</span>
            </div>
          </div>

          <div className="fourier-basis-demo">
            <div className="fourier-basis-chain">
              <div>
                <small>INPUT COMPLEX TONE</small>
                <strong><MathExpr tex={String.raw`e^{j2\pi k_0n/N}`} /></strong>
              </div>
              <b>×</b>
              <div>
                <small>CONJUGATE BASIS</small>
                <strong><MathExpr tex={String.raw`e^{-j2\pi kn/N}`} /></strong>
              </div>
              <b>→</b>
              <div>
                <small>PRODUCTS</small>
                <strong><MathExpr tex={String.raw`e^{j2\pi(k_0-k)n/N}`} /></strong>
              </div>
              <b>→ sum →</b>
              <div className="result">
                <small>DFT RESPONSE</small>
                <strong>{inputBin === candidateBin ? 'vectors align' : 'vectors cancel'}</strong>
              </div>
            </div>

            <div className="fourier-basis-plane">
              <div className="visual-caption">
                <span>PRODUCT PHASORS</span>
                <strong>mỗi sample đóng góp một unit vector trước khi cộng</strong>
              </div>

              <svg viewBox="0 0 360 330" role="img" aria-label="Các phasor products trong DFT basis matching">
                <line className="fourier-axis" x1="42" y1={planeCy} x2="325" y2={planeCy} />
                <line className="fourier-axis" x1={planeCx} y1="34" x2={planeCx} y2="296" />
                <circle className="fourier-basis-circle" cx={planeCx} cy={planeCy} r={planeR} />
                {basis.points.map((point, index) => (
                  <circle
                    key={index}
                    className="fourier-basis-point"
                    cx={planeCx + planeR * point.re}
                    cy={planeCy - planeR * point.im}
                    r={inputBin === candidateBin ? 3.2 : 2.5}
                  />
                ))}
                <line
                  className="fourier-basis-sum"
                  x1={planeCx}
                  y1={planeCy}
                  x2={sumEndX}
                  y2={sumEndY}
                />
                <circle className="fourier-basis-sum-tip" cx={sumEndX} cy={sumEndY} r="5" />
                <SvgMathExpr tex={String.raw`\operatorname{Re}`} x={300} y={planeCy - 9} width={46} />
                <SvgMathExpr tex={String.raw`\operatorname{Im}`} x={planeCx + 8} y={42} width={46} />
              </svg>

              <p>
                Khi <MathExpr tex="k=k_0" />, mọi product có angle zero nên cộng coherent.
                Với một integer-bin mismatch, product phasors đi đủ vòng và tổng lý tưởng triệt tiêu.
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="fourier-controls">
            <label>
              <span>Tone <strong><MathExpr tex={tone.toFixed(2) + '\\,\\mathrm{Hz}'} /></strong></span>
              <input
                type="range"
                min="2"
                max="18"
                step="0.25"
                value={tone}
                onChange={(event) => setTone(Number(event.target.value))}
              />
            </label>

            <label>
              <span>Số samples <strong><MathExpr tex={'N=' + N} /></strong></span>
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

          <div className="fourier-readout metric-card-grid">
            <div className="metric-card">
              <small className="metric-card-label">BIN SPACING</small>
              <strong className="metric-card-value"><MathExpr tex={binSpacing.toFixed(2) + '\\,\\mathrm{Hz}'} /></strong>
              <span className="metric-card-formula"><MathExpr tex={String.raw`\Delta f=f_s/N`} /></span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">OBSERVATION TIME</small>
              <strong className="metric-card-value"><MathExpr tex={observationTime.toFixed(2) + '\\,\\mathrm{s}'} /></strong>
              <span className="metric-card-formula"><MathExpr tex={String.raw`T_{\rm obs}=N/f_s`} /></span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">NEAREST BIN</small>
              <strong className="metric-card-value"><MathExpr tex={'k=' + closestBin} /></strong>
              <span className="metric-card-formula"><MathExpr tex={closestFrequency.toFixed(2) + '\\,\\mathrm{Hz}'} /></span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">FRACTIONAL BIN OFFSET</small>
              <strong className="metric-card-value"><MathExpr tex={binOffset.toFixed(2)} /></strong>
              <span className="metric-card-formula">{onBin ? 'bin-centered tone' : 'off-bin tone → leakage'}</span>
            </div>
          </div>

          <div className="fourier-panels">
            <div>
              <div className="visual-caption">
                <span>WINDOWED RECORD</span>
                <strong><MathExpr tex={'N=' + N} /> samples</strong>
              </div>
              <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label="Windowed time-domain samples used by the DFT">
                <line className="fourier-axis" x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} />
                <path className="fourier-time-wave" d={timePoints} />
                {leakage.windowed.map((value, n) => {
                  const x = PAD + (n / Math.max(N - 1, 1)) * (W - 2 * PAD);
                  const y = H / 2 - 82 * value;
                  return <circle key={n} className="fourier-sample" cx={x} cy={y} r={N > 64 ? 1.7 : 2.6} />;
                })}
              </svg>
            </div>

            <div>
              <div className="visual-caption">
                <span>DFT MAGNITUDE</span>
                <strong><MathExpr tex="|X[k]|" /></strong>
              </div>
              <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label="DFT magnitude across frequency bins">
                <line className="fourier-axis" x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} />
                {visibleBins.map((bin, index) => {
                  const binWidth = (W - 2 * PAD) / visibleBins.length;
                  const height = (bin.magnitude / maxMagnitude) * 170;
                  return (
                    <g key={bin.k}>
                      <rect
                        className={bin.k === closestBin ? 'fourier-bin active' : 'fourier-bin'}
                        x={PAD + index * binWidth + 1}
                        y={H - PAD - height}
                        width={Math.max(2, binWidth - 2)}
                        height={height}
                      />
                      {Math.abs(bin.frequency % 4) < 1e-6 && (
                        <text className="fourier-label" x={PAD + index * binWidth} y={H - 9}>
                          {bin.frequency.toFixed(0)}
                        </text>
                      )}
                    </g>
                  );
                })}
                <SvgMathExpr tex={String.raw`\mathrm{Hz}`} x={W - 58} y={16} width={38} />
              </svg>
            </div>
          </div>

          <p className="fourier-caption">
            Rectangular window là cách “cắt thẳng” record. Hann taper hai đầu để đổi leakage pattern.
            Window thay đổi spectral tradeoff; nó không tạo thêm information ngoài record đang có.
          </p>
        </>
      )}
    </div>
  );
}
