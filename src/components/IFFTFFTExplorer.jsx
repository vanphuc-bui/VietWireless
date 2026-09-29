import { useMemo, useState } from 'react';
import MathExpr, { SvgMathExpr } from './MathExpr.jsx';

const N = 8;
const qpsk = [
  { name: '00', re: 1 / Math.sqrt(2), im: 1 / Math.sqrt(2) },
  { name: '01', re: -1 / Math.sqrt(2), im: 1 / Math.sqrt(2) },
  { name: '11', re: -1 / Math.sqrt(2), im: -1 / Math.sqrt(2) },
  { name: '10', re: 1 / Math.sqrt(2), im: -1 / Math.sqrt(2) },
];

function idft(X) {
  return Array.from({ length: N }, (_, n) => {
    let re = 0;
    let im = 0;

    for (let k = 0; k < N; k += 1) {
      const angle = 2 * Math.PI * k * n / N;
      re += X[k].re * Math.cos(angle) - X[k].im * Math.sin(angle);
      im += X[k].re * Math.sin(angle) + X[k].im * Math.cos(angle);
    }

    return { re: re / N, im: im / N };
  });
}

function dft(x) {
  return Array.from({ length: N }, (_, k) => {
    let re = 0;
    let im = 0;

    for (let n = 0; n < N; n += 1) {
      const angle = -2 * Math.PI * k * n / N;
      re += x[n].re * Math.cos(angle) - x[n].im * Math.sin(angle);
      im += x[n].re * Math.sin(angle) + x[n].im * Math.cos(angle);
    }

    return { re, im };
  });
}

function contributionForBin(Xk, k, n) {
  const angle = 2 * Math.PI * k * n / N;
  return {
    re: (Xk.re * Math.cos(angle) - Xk.im * Math.sin(angle)) / N,
    im: (Xk.re * Math.sin(angle) + Xk.im * Math.cos(angle)) / N,
  };
}

function fftContribution(sample, q, n) {
  const angle = -2 * Math.PI * q * n / N;
  return {
    re: sample.re * Math.cos(angle) - sample.im * Math.sin(angle),
    im: sample.re * Math.sin(angle) + sample.im * Math.cos(angle),
  };
}

function complexText(value) {
  const re = Math.abs(value.re) < 0.0005 ? 0 : value.re;
  const im = Math.abs(value.im) < 0.0005 ? 0 : value.im;
  return re.toFixed(2) + (im >= 0 ? '+' : '-') + 'j' + Math.abs(im).toFixed(2);
}

export default function IFFTFFTExplorer() {
  const [mode, setMode] = useState('basis');

  const [basisK, setBasisK] = useState(1);
  const [basisQpsk, setBasisQpsk] = useState(0);

  const [bins, setBins] = useState([0, 1, -1, 2, 0, 3, -1, 0]);
  const [inspectN, setInspectN] = useState(3);
  const [inspectQ, setInspectQ] = useState(1);

  const X = bins.map((idx) => idx < 0 ? { re: 0, im: 0 } : qpsk[idx]);
  const x = useMemo(() => idft(X), [bins]);
  const Y = useMemo(() => dft(x), [x]);

  const basisCoefficient = qpsk[basisQpsk];
  const basisVector = useMemo(
    () => Array.from(
      { length: N },
      (_, n) => contributionForBin(basisCoefficient, basisK, n)
    ),
    [basisCoefficient, basisK]
  );

  const basisPhaseStepDeg = 360 * basisK / N;

  const selectedContributions = useMemo(
    () => X.map((value, k) => contributionForBin(value, k, inspectN)),
    [X, inspectN]
  );

  const selectedSum = selectedContributions.reduce(
    (sum, value) => ({ re: sum.re + value.re, im: sum.im + value.im }),
    { re: 0, im: 0 }
  );

  const fftContributions = useMemo(
    () => x.map((value, n) => fftContribution(value, inspectQ, n)),
    [x, inspectQ]
  );

  const fftSum = fftContributions.reduce(
    (sum, value) => ({ re: sum.re + value.re, im: sum.im + value.im }),
    { re: 0, im: 0 }
  );

  const roundTripError = Math.max(
    ...Y.map((value, k) => Math.hypot(value.re - X[k].re, value.im - X[k].im))
  );

  const maxTimeMagnitude = Math.max(...x.map((value) => Math.hypot(value.re, value.im)), 0.001);

  function cycleBin(k) {
    setBins((current) => current.map(
      (value, index) => index === k ? (value + 2) % 5 - 1 : value
    ));
  }

  function chooseMode(next) {
    setMode(next);
    if (next === 'basis') {
      setBasisK(1);
      setBasisQpsk(0);
    }
    if (next === 'sum') {
      setInspectN(3);
    }
    if (next === 'fft') {
      setInspectQ(1);
    }
  }

  const phCx = 185;
  const phCy = 165;
  const phScale = 105;

  return (
    <div className="ifft-fft-lab ifft-fft-lab-v2">
      <div className="ifft-mode-tabs" role="tablist" aria-label="Chọn góc nhìn IFFT và FFT">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'basis'}
          className={mode === 'basis' ? 'selected' : ''}
          onClick={() => chooseMode('basis')}
        >
          One bin → basis
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'sum'}
          className={mode === 'sum' ? 'selected' : ''}
          onClick={() => chooseMode('sum')}
        >
          Many bins → one sample
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'fft'}
          className={mode === 'fft' ? 'selected' : ''}
          onClick={() => chooseMode('fft')}
        >
          FFT projection
        </button>
      </div>

      {mode === 'basis' && (
        <>
          <div className="ifft-basis-controls">
            <label>
              <span>
                Bin index{" "}
                <strong><MathExpr tex={'k=' + basisK} /></strong>
              </span>
              <input
                type="range"
                min="0"
                max={N - 1}
                step="1"
                value={basisK}
                onChange={(event) => setBasisK(Number(event.target.value))}
              />
            </label>

            <div className="ifft-qpsk-select">
              <span>Coefficient <MathExpr tex="X[k]" /></span>
              <div>
                {qpsk.map((item, index) => (
                  <button
                    key={item.name}
                    type="button"
                    className={basisQpsk === index ? 'selected' : ''}
                    onClick={() => setBasisQpsk(index)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="ifft-readout metric-card-grid">
            <div className="metric-card">
              <small className="metric-card-label">FFT SIZE</small>
              <strong className="metric-card-value"><MathExpr tex={'N=' + N} /></strong>
              <span className="metric-card-formula">samples / bins</span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">ACTIVE BIN</small>
              <strong className="metric-card-value"><MathExpr tex={'k=' + basisK} /></strong>
              <span className="metric-card-formula">one basis frequency</span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">PHASE ADVANCE / SAMPLE</small>
              <strong className="metric-card-value"><MathExpr tex={basisPhaseStepDeg.toFixed(0) + '^\\circ'} /></strong>
              <span className="metric-card-formula"><MathExpr tex={String.raw`360^\circ k/N`} /></span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">COEFFICIENT</small>
              <strong className="metric-card-value"><MathExpr tex={complexText(basisCoefficient)} /></strong>
              <span className="metric-card-formula">sets common scale + initial phase</span>
            </div>
          </div>

          <div className="ifft-basis-grid">
            <div className="ifft-basis-circle">
              <div className="visual-caption">
                <span>BASIS PHASOR SAMPLES</span>
                <strong>each sample advances by the same phase increment</strong>
              </div>

              <svg viewBox="0 0 370 330" role="img" aria-label="Eight IFFT basis samples plotted on the complex plane">
                <line className="ifft-axis" x1="34" y1={phCy} x2="338" y2={phCy} />
                <line className="ifft-axis" x1={phCx} y1="28" x2={phCx} y2="302" />
                <circle className="ifft-unit-circle" cx={phCx} cy={phCy} r={phScale} />

                {basisVector.map((value, n) => {
                  const magnitudeScale = phScale * N;
                  const xPos = phCx + magnitudeScale * value.re;
                  const yPos = phCy - magnitudeScale * value.im;

                  return (
                    <g key={n}>
                      <line
                        className="ifft-basis-vector"
                        x1={phCx}
                        y1={phCy}
                        x2={xPos}
                        y2={yPos}
                      />
                      <circle className="ifft-basis-dot" cx={xPos} cy={yPos} r="4" />
                      <text className="ifft-basis-index" x={xPos + 6} y={yPos - 6}>{n}</text>
                    </g>
                  );
                })}

                <SvgMathExpr tex="I" x={315} y={phCy - 8} width={24} />
                <SvgMathExpr tex="Q" x={phCx + 8} y={40} width={24} />
              </svg>
            </div>

            <div className="ifft-basis-table">
              <div className="visual-caption">
                <span>ONE TERM OF THE IDFT</span>
                <strong><MathExpr tex={String.raw`x_k[n]=\frac{1}{N}X[k]e^{j2\pi kn/N}`} /></strong>
              </div>

              <div className="ifft-sample-table">
                <div className="header"><span><MathExpr tex="n" /></span><span>phase advance</span><span>contribution</span></div>
                {basisVector.map((value, n) => (
                  <div key={n}>
                    <span><MathExpr tex={String(n)} /></span>
                    <span><MathExpr tex={(basisPhaseStepDeg * n).toFixed(0) + '^\\circ'} /></span>
                    <span><MathExpr tex={complexText(value)} /></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {mode === 'sum' && (
        <>
          <div className="ifft-bin-editor ifft-bin-editor-v2">
            <div className="visual-caption">
              <span>FREQUENCY-DOMAIN VECTOR</span>
              <strong>click each bin to cycle OFF / QPSK</strong>
            </div>

            <div className="ifft-bin-row">
              {bins.map((idx, k) => (
                <button
                  type="button"
                  key={k}
                  className={idx >= 0 ? 'active' : ''}
                  onClick={() => cycleBin(k)}
                >
                  <small><MathExpr tex={'k=' + k} /></small>
                  <strong>{idx < 0 ? 'OFF' : qpsk[idx].name}</strong>
                  <span><MathExpr tex={idx < 0 ? '0' : complexText(qpsk[idx])} /></span>
                </button>
              ))}
            </div>
          </div>

          <div className="ifft-sum-controls">
            <label>
              <span>
                Inspect time sample{" "}
                <strong><MathExpr tex={'n=' + inspectN} /></strong>
              </span>
              <input
                type="range"
                min="0"
                max={N - 1}
                step="1"
                value={inspectN}
                onChange={(event) => setInspectN(Number(event.target.value))}
              />
            </label>
          </div>

          <div className="ifft-readout metric-card-grid">
            <div className="metric-card">
              <small className="metric-card-label">ACTIVE BINS</small>
              <strong className="metric-card-value"><MathExpr tex={String(bins.filter((value) => value >= 0).length)} /></strong>
              <span className="metric-card-formula">nonzero coefficients</span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">INSPECTED SAMPLE</small>
              <strong className="metric-card-value"><MathExpr tex={'n=' + inspectN} /></strong>
              <span className="metric-card-formula">one column of the synthesis sum</span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">SUM RESULT</small>
              <strong className="metric-card-value"><MathExpr tex={complexText(selectedSum)} /></strong>
              <span className="metric-card-formula"><MathExpr tex={String.raw`x[n]`} /></span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">MAX |TIME SAMPLE|</small>
              <strong className="metric-card-value"><MathExpr tex={maxTimeMagnitude.toFixed(3)} /></strong>
              <span className="metric-card-formula">depends on vector addition</span>
            </div>
          </div>

          <div className="ifft-contribution-panel">
            <div className="visual-caption">
              <span>WHAT CREATES ONE TIME SAMPLE?</span>
              <strong>one complex contribution from every active frequency bin</strong>
            </div>

            <div className="ifft-contribution-strip">
              {selectedContributions.map((value, k) => (
                <div key={k} className={bins[k] >= 0 ? 'active' : 'off'}>
                  <small><MathExpr tex={'k=' + k} /></small>
                  <strong><MathExpr tex={complexText(value)} /></strong>
                  <span>{bins[k] >= 0 ? 'contributes' : 'zero'}</span>
                </div>
              ))}
            </div>

            <div className="ifft-contribution-sum">
              <span>all contributions</span>
              <b>→ complex vector sum →</b>
              <strong><MathExpr tex={'x[' + inspectN + ']=' + complexText(selectedSum)} /></strong>
            </div>
          </div>

          <div className="ifft-time-panel ifft-time-panel-v2">
            <div className="visual-caption">
              <span>FULL TIME-DOMAIN BLOCK</span>
              <strong><MathExpr tex={'N=' + N} /> complex samples</strong>
            </div>

            <div className="ifft-sample-grid">
              {x.map((value, n) => (
                <div key={n} className={n === inspectN ? 'selected' : ''}>
                  <small><MathExpr tex={'n=' + n} /></small>
                  <i
                    className="real"
                    style={{
                      height: (Math.abs(value.re) / maxTimeMagnitude * 46) + '%',
                      transform: value.re >= 0 ? 'translateY(-50%)' : 'translateY(50%)',
                    }}
                  ></i>
                  <i
                    className="imag"
                    style={{
                      height: (Math.abs(value.im) / maxTimeMagnitude * 46) + '%',
                      transform: value.im >= 0 ? 'translateY(-50%)' : 'translateY(50%)',
                    }}
                  ></i>
                  <span><MathExpr tex={complexText(value)} /></span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {mode === 'fft' && (
        <>
          <div className="ifft-bin-editor ifft-bin-editor-v2">
            <div className="visual-caption">
              <span>SAME OFDM BLOCK</span>
              <strong>frequency coefficients used to generate the time samples</strong>
            </div>

            <div className="ifft-bin-row">
              {bins.map((idx, k) => (
                <button
                  type="button"
                  key={k}
                  className={idx >= 0 ? 'active' : ''}
                  onClick={() => cycleBin(k)}
                >
                  <small><MathExpr tex={'k=' + k} /></small>
                  <strong>{idx < 0 ? 'OFF' : qpsk[idx].name}</strong>
                  <span><MathExpr tex={idx < 0 ? '0' : complexText(qpsk[idx])} /></span>
                </button>
              ))}
            </div>
          </div>

          <div className="ifft-sum-controls">
            <label>
              <span>
                Inspect FFT output bin{" "}
                <strong><MathExpr tex={'q=' + inspectQ} /></strong>
              </span>
              <input
                type="range"
                min="0"
                max={N - 1}
                step="1"
                value={inspectQ}
                onChange={(event) => setInspectQ(Number(event.target.value))}
              />
            </label>
          </div>

          <div className="ifft-readout metric-card-grid">
            <div className="metric-card">
              <small className="metric-card-label">SELECTED FFT BIN</small>
              <strong className="metric-card-value"><MathExpr tex={'q=' + inspectQ} /></strong>
              <span className="metric-card-formula">projection basis index</span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">EXPECTED COEFFICIENT</small>
              <strong className="metric-card-value"><MathExpr tex={complexText(X[inspectQ])} /></strong>
              <span className="metric-card-formula"><MathExpr tex={'X[' + inspectQ + ']'} /></span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">FFT SUM</small>
              <strong className="metric-card-value"><MathExpr tex={complexText(fftSum)} /></strong>
              <span className="metric-card-formula"><MathExpr tex={'Y[' + inspectQ + ']'} /></span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">MAX ROUND-TRIP ERROR</small>
              <strong className="metric-card-value"><MathExpr tex={roundTripError.toExponential(1)} /></strong>
              <span className="metric-card-formula">floating-point numerical error</span>
            </div>
          </div>

          <div className="ifft-projection-grid">
            <div className="ifft-projection-terms">
              <div className="visual-caption">
                <span>FFT PROJECTION TERMS</span>
                <strong><MathExpr tex={String.raw`x[n]e^{-j2\pi qn/N}`} /></strong>
              </div>

              <div className="ifft-projection-strip">
                {fftContributions.map((value, n) => (
                  <div key={n}>
                    <small><MathExpr tex={'n=' + n} /></small>
                    <strong><MathExpr tex={complexText(value)} /></strong>
                  </div>
                ))}
              </div>

              <div className="ifft-contribution-sum">
                <span>sum across all <MathExpr tex="n" /></span>
                <b>→ coherent projection →</b>
                <strong><MathExpr tex={'Y[' + inspectQ + ']=' + complexText(fftSum)} /></strong>
              </div>
            </div>

            <div className="ifft-projection-phasors">
              <div className="visual-caption">
                <span>AFTER DE-ROTATION FOR THE SELECTED BIN</span>
                <strong>matching basis contributions line up coherently</strong>
              </div>

              <svg viewBox="0 0 370 330" role="img" aria-label="FFT projection contribution vectors and their coherent sum">
                <line className="ifft-axis" x1="34" y1={phCy} x2="338" y2={phCy} />
                <line className="ifft-axis" x1={phCx} y1="28" x2={phCx} y2="302" />

                {fftContributions.map((value, n) => {
                  const scale = 86;
                  const xPos = phCx + scale * value.re;
                  const yPos = phCy - scale * value.im;
                  return (
                    <line
                      key={n}
                      className="ifft-projection-vector"
                      x1={phCx}
                      y1={phCy}
                      x2={xPos}
                      y2={yPos}
                    />
                  );
                })}

                <line
                  className="ifft-projection-sum"
                  x1={phCx}
                  y1={phCy}
                  x2={phCx + 86 * fftSum.re}
                  y2={phCy - 86 * fftSum.im}
                />
                <circle
                  className="ifft-projection-sum-dot"
                  cx={phCx + 86 * fftSum.re}
                  cy={phCy - 86 * fftSum.im}
                  r="6"
                />

                <SvgMathExpr tex="I" x={315} y={phCy - 8} width={24} />
                <SvgMathExpr tex="Q" x={phCx + 8} y={40} width={24} />
              </svg>
            </div>
          </div>

          <div className="ifft-recovered ifft-recovered-v2">
            {Y.map((value, k) => {
              const error = Math.hypot(value.re - X[k].re, value.im - X[k].im);
              return (
                <div key={k} className={k === inspectQ ? 'selected' : ''}>
                  <small><MathExpr tex={'k=' + k} /></small>
                  <strong><MathExpr tex={complexText(value)} /></strong>
                  <span><MathExpr tex={String.raw`|e|=`} /> <MathExpr tex={error.toExponential(1)} /></span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
