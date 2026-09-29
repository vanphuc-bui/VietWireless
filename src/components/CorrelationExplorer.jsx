import { useMemo, useState } from 'react';
import MathExpr, { SvgMathExpr } from './MathExpr.jsx';

const reference = [1, 1, 1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1];
const L = reference.length;
const RX_LEN = 72;

function pseudoUniform(index, salt) {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453123;
  return value - Math.floor(value);
}

function gaussian(index) {
  const u1 = Math.max(1e-9, pseudoUniform(index, 1));
  const u2 = pseudoUniform(index, 2);
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

const noiseVector = Array.from({ length: RX_LEN }, (_, n) => gaussian(n));

function buildRx(delay, noiseStd, signalPresent = true) {
  return Array.from({ length: RX_LEN }, (_, n) => {
    const seqIndex = n - delay;
    const wanted = signalPresent && seqIndex >= 0 && seqIndex < L
      ? reference[seqIndex]
      : 0;
    return wanted + noiseStd * noiseVector[n];
  });
}

function normalizedCorrelation(rx) {
  const refEnergy = reference.reduce((sum, value) => sum + value * value, 0);
  const maxLag = RX_LEN - L;

  return Array.from({ length: maxLag + 1 }, (_, lag) => {
    let dot = 0;
    let segmentEnergy = 0;

    for (let n = 0; n < L; n += 1) {
      const sample = rx[lag + n];
      dot += sample * reference[n];
      segmentEnergy += sample * sample;
    }

    const denominator = Math.sqrt(refEnergy * segmentEnergy);
    return denominator > 0 ? Math.abs(dot) / denominator : 0;
  });
}

function argMax(values) {
  let index = 0;
  let value = -Infinity;
  values.forEach((candidate, candidateIndex) => {
    if (candidate > value) {
      value = candidate;
      index = candidateIndex;
    }
  });
  return { index, value };
}

function cfoCoherentGain(epsilon) {
  let re = 0;
  let im = 0;

  for (let n = 0; n < L; n += 1) {
    const angle = 2 * Math.PI * epsilon * n;
    re += Math.cos(angle);
    im += Math.sin(angle);
  }

  return {
    re,
    im,
    magnitude: Math.hypot(re, im) / L,
  };
}

export default function CorrelationExplorer() {
  const [mode, setMode] = useState('slide');

  const [delay, setDelay] = useState(24);
  const [noiseStd, setNoiseStd] = useState(0.45);
  const [candidateLag, setCandidateLag] = useState(18);

  const [signalPresent, setSignalPresent] = useState(true);
  const [threshold, setThreshold] = useState(0.72);

  const [epsilon, setEpsilon] = useState(0.02);

  const rx = useMemo(
    () => buildRx(delay, noiseStd, true),
    [delay, noiseStd]
  );

  const corr = useMemo(() => normalizedCorrelation(rx), [rx]);
  const detected = useMemo(() => argMax(corr), [corr]);

  const selectedLag = Math.min(candidateLag, corr.length - 1);
  const selectedProducts = useMemo(
    () => reference.map((refValue, n) => {
      const received = rx[selectedLag + n];
      return {
        ref: refValue,
        received,
        product: refValue * received,
      };
    }),
    [rx, selectedLag]
  );

  const selectedSignedDot = selectedProducts.reduce((sum, item) => sum + item.product, 0);
  const selectedSegmentEnergy = selectedProducts.reduce(
    (sum, item) => sum + item.received * item.received,
    0
  );
  const selectedMetric = Math.abs(selectedSignedDot) / Math.sqrt(L * selectedSegmentEnergy);

  const detectRx = useMemo(
    () => buildRx(delay, noiseStd, signalPresent),
    [delay, noiseStd, signalPresent]
  );
  const detectCorr = useMemo(() => normalizedCorrelation(detectRx), [detectRx]);
  const detectPeak = useMemo(() => argMax(detectCorr), [detectCorr]);

  let detectionResult = 'Correct reject';
  if (signalPresent) {
    if (detectPeak.value < threshold) detectionResult = 'Miss';
    else if (detectPeak.index === delay) detectionResult = 'Detection';
    else detectionResult = 'Wrong peak';
  } else if (detectPeak.value >= threshold) {
    detectionResult = 'False alarm';
  }

  const cfo = useMemo(() => cfoCoherentGain(epsilon), [epsilon]);
  const totalPhaseDriftDeg = 360 * epsilon * (L - 1);

  const cfoCurve = useMemo(() => {
    const points = 260;
    const minEps = -0.1;
    const maxEps = 0.1;
    const W = 720;
    const H = 230;
    const left = 38;
    const right = 18;
    const top = 22;
    const bottom = 36;

    const path = Array.from({ length: points + 1 }, (_, index) => {
      const eps = minEps + ((maxEps - minEps) * index) / points;
      const gain = cfoCoherentGain(eps).magnitude;
      const x = left + (index / points) * (W - left - right);
      const y = top + (1 - gain) * (H - top - bottom);
      return (index === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2);
    }).join(' ');

    const probeX = left + ((epsilon - minEps) / (maxEps - minEps)) * (W - left - right);

    return { W, H, left, right, top, bottom, path, probeX };
  }, [epsilon]);

  const phCx = 185;
  const phCy = 165;
  const phScale = 105;
  const contributionPhasors = Array.from({ length: L }, (_, n) => {
    const angle = 2 * Math.PI * epsilon * n;
    return {
      x: phCx + phScale * Math.cos(angle),
      y: phCy - phScale * Math.sin(angle),
    };
  });
  const sumX = phCx + phScale * cfo.re / L;
  const sumY = phCy - phScale * cfo.im / L;

  function chooseMode(next) {
    setMode(next);
    if (next === 'slide') {
      setNoiseStd(0.45);
      setDelay(24);
      setCandidateLag(18);
    }
    if (next === 'detect') {
      setNoiseStd(0.7);
      setDelay(24);
      setThreshold(0.72);
      setSignalPresent(true);
    }
    if (next === 'cfo') {
      setEpsilon(0.02);
    }
  }

  return (
    <div className="correlation-lab correlation-lab-v2">
      <div className="correlation-mode-tabs" role="tablist" aria-label="Chọn thí nghiệm correlation">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'slide'}
          className={mode === 'slide' ? 'selected' : ''}
          onClick={() => chooseMode('slide')}
        >
          Sliding match
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'detect'}
          className={mode === 'detect' ? 'selected' : ''}
          onClick={() => chooseMode('detect')}
        >
          Threshold detector
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'cfo'}
          className={mode === 'cfo' ? 'selected' : ''}
          onClick={() => chooseMode('cfo')}
        >
          CFO coherence
        </button>
      </div>

      {mode !== 'cfo' && (
        <div className="correlation-controls correlation-controls-v2">
          <label>
            <span>
              True sequence start{" "}
              <strong><MathExpr tex={'n_0=' + delay} /></strong>
            </span>
            <input
              type="range"
              min="4"
              max="48"
              step="1"
              value={delay}
              onChange={(event) => {
                const next = Number(event.target.value);
                setDelay(next);
                if (mode === 'slide') setCandidateLag(Math.min(candidateLag, RX_LEN - L));
              }}
            />
          </label>

          <label>
            <span>
              Noise standard deviation{" "}
              <strong><MathExpr tex={noiseStd.toFixed(2)} /></strong>
            </span>
            <input
              type="range"
              min="0"
              max="1.6"
              step="0.05"
              value={noiseStd}
              onChange={(event) => setNoiseStd(Number(event.target.value))}
            />
          </label>

          {mode === 'slide' && (
            <label>
              <span>
                Candidate lag{" "}
                <strong><MathExpr tex={'\\ell=' + selectedLag} /></strong>
              </span>
              <input
                type="range"
                min="0"
                max={RX_LEN - L}
                step="1"
                value={selectedLag}
                onChange={(event) => setCandidateLag(Number(event.target.value))}
              />
            </label>
          )}

          {mode === 'detect' && (
            <label>
              <span>
                Detection threshold{" "}
                <strong><MathExpr tex={'\\gamma_{\\rm th}=' + threshold.toFixed(2)} /></strong>
              </span>
              <input
                type="range"
                min="0.25"
                max="0.95"
                step="0.01"
                value={threshold}
                onChange={(event) => setThreshold(Number(event.target.value))}
              />
            </label>
          )}
        </div>
      )}

      {mode === 'slide' && (
        <>
          <div className="correlation-readout metric-card-grid">
            <div className="metric-card">
              <small className="metric-card-label">TRUE START</small>
              <strong className="metric-card-value"><MathExpr tex={'n_0=' + delay} /></strong>
              <span className="metric-card-formula">hidden location</span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">CANDIDATE LAG</small>
              <strong className="metric-card-value"><MathExpr tex={'\\ell=' + selectedLag} /></strong>
              <span className="metric-card-formula">{selectedLag === delay ? 'aligned' : 'misaligned'}</span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">NORMALIZED METRIC</small>
              <strong className="metric-card-value"><MathExpr tex={selectedMetric.toFixed(3)} /></strong>
              <span className="metric-card-formula"><MathExpr tex={String.raw`0\le\gamma[\ell]\le1`} /></span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">GLOBAL MAXIMUM</small>
              <strong className="metric-card-value"><MathExpr tex={'\\ell=' + detected.index} /></strong>
              <span className="metric-card-formula"><MathExpr tex={detected.value.toFixed(3)} /></span>
            </div>
          </div>

          <div className="correlation-sample-matrix">
            <div className="visual-caption">
              <span>WHAT ONE CANDIDATE LAG ACTUALLY DOES</span>
              <strong>reference × received window → sum</strong>
            </div>

            <div className="correlation-sample-row header-row">
              <span>index</span>
              {reference.map((_, index) => <b key={index}>{index}</b>)}
            </div>
            <div className="correlation-sample-row">
              <span>reference</span>
              {selectedProducts.map((item, index) => (
                <b key={index} className={item.ref > 0 ? 'positive' : 'negative'}>
                  {item.ref > 0 ? '+1' : '−1'}
                </b>
              ))}
            </div>
            <div className="correlation-sample-row">
              <span>received</span>
              {selectedProducts.map((item, index) => (
                <b key={index}>{item.received.toFixed(2)}</b>
              ))}
            </div>
            <div className="correlation-sample-row product-row">
              <span>product</span>
              {selectedProducts.map((item, index) => (
                <b key={index} className={item.product >= 0 ? 'positive' : 'negative'}>
                  {item.product.toFixed(2)}
                </b>
              ))}
            </div>

            <div className="correlation-sum-line">
              <span>
                signed dot product{" "}
                <strong><MathExpr tex={selectedSignedDot.toFixed(2)} /></strong>
              </span>
              <b>→ normalize →</b>
              <span>
                <MathExpr tex={String.raw`\gamma[\ell]`} />{" "}
                <strong><MathExpr tex={selectedMetric.toFixed(3)} /></strong>
              </span>
            </div>
          </div>

          <div className="correlation-curve-panel">
            <div className="visual-caption">
              <span>NORMALIZED SLIDING CORRELATION</span>
              <strong>one value per candidate lag</strong>
            </div>

            <div className="correlation-bars correlation-bars-v2" aria-label="Normalized correlation magnitude for every candidate lag">
              {corr.map((value, lag) => (
                <i
                  key={lag}
                  className={[
                    lag === detected.index ? 'peak' : '',
                    lag === selectedLag ? 'selected' : '',
                    lag === delay ? 'true-lag' : '',
                  ].join(' ')}
                  style={{ height: Math.max(2, value * 100) + '%' }}
                  title={'lag=' + lag + ', gamma=' + value.toFixed(3)}
                />
              ))}
            </div>

            <div className="correlation-curve-legend">
              <span><i className="selected"></i>candidate lag</span>
              <span><i className="true"></i>true lag</span>
              <span><i className="peak"></i>global max</span>
            </div>
          </div>
        </>
      )}

      {mode === 'detect' && (
        <>
          <div className="correlation-presence-toggle">
            <span>Is the known sequence actually present?</span>
            <div>
              <button
                type="button"
                className={signalPresent ? 'selected' : ''}
                onClick={() => setSignalPresent(true)}
              >
                Present
              </button>
              <button
                type="button"
                className={!signalPresent ? 'selected' : ''}
                onClick={() => setSignalPresent(false)}
              >
                Absent
              </button>
            </div>
          </div>

          <div className="correlation-readout metric-card-grid">
            <div className="metric-card">
              <small className="metric-card-label">MAX METRIC</small>
              <strong className="metric-card-value"><MathExpr tex={detectPeak.value.toFixed(3)} /></strong>
              <span className="metric-card-formula"><MathExpr tex={'\\ell=' + detectPeak.index} /></span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">THRESHOLD</small>
              <strong className="metric-card-value"><MathExpr tex={threshold.toFixed(2)} /></strong>
              <span className="metric-card-formula"><MathExpr tex={String.raw`\gamma_{\rm th}`} /></span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">SEQUENCE STATE</small>
              <strong className="metric-card-value">{signalPresent ? 'present' : 'absent'}</strong>
              <span className="metric-card-formula">ground truth</span>
            </div>
            <div className={'metric-card ' + (
              detectionResult === 'Detection' || detectionResult === 'Correct reject'
                ? 'correlation-good'
                : 'correlation-bad'
            )}>
              <small className="metric-card-label">DECISION</small>
              <strong className="metric-card-value">{detectionResult}</strong>
              <span className="metric-card-formula">
                {detectPeak.value >= threshold ? 'peak crossed threshold' : 'no peak crossed threshold'}
              </span>
            </div>
          </div>

          <div className="correlation-threshold-panel">
            <div className="visual-caption">
              <span>DETECTOR VIEW</span>
              <strong>argmax proposes a lag; threshold decides whether to trust it</strong>
            </div>

            <div className="correlation-threshold-plot">
              <div
                className="correlation-threshold-line"
                style={{ bottom: (threshold * 100) + '%' }}
              >
                <span><MathExpr tex={String.raw`\gamma_{\rm th}`} /></span>
              </div>
              {detectCorr.map((value, lag) => (
                <i
                  key={lag}
                  className={[
                    lag === detectPeak.index ? 'peak' : '',
                    signalPresent && lag === delay ? 'true-lag' : '',
                  ].join(' ')}
                  style={{ height: Math.max(2, value * 100) + '%' }}
                />
              ))}
            </div>

            <p>
              Khi sequence absent, <strong>argmax vẫn luôn trả về một lag</strong>.
              Chỉ có comparison với threshold mới cho phép detector nói “không thấy sequence”.
            </p>
          </div>
        </>
      )}

      {mode === 'cfo' && (
        <>
          <div className="correlation-cfo-controls">
            <label>
              <span>
                Normalized CFO{" "}
                <strong><MathExpr tex={'\\epsilon=\\Delta fT_s=' + epsilon.toFixed(3)} /></strong>
              </span>
              <input
                type="range"
                min="-0.1"
                max="0.1"
                step="0.002"
                value={epsilon}
                onChange={(event) => setEpsilon(Number(event.target.value))}
              />
            </label>
          </div>

          <div className="correlation-readout metric-card-grid">
            <div className="metric-card">
              <small className="metric-card-label">REFERENCE LENGTH</small>
              <strong className="metric-card-value"><MathExpr tex={'L=' + L} /></strong>
              <span className="metric-card-formula">coherent contributions</span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">NORMALIZED CFO</small>
              <strong className="metric-card-value"><MathExpr tex={epsilon.toFixed(3)} /></strong>
              <span className="metric-card-formula"><MathExpr tex={String.raw`\epsilon=\Delta fT_s`} /></span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">PHASE DRIFT</small>
              <strong className="metric-card-value"><MathExpr tex={totalPhaseDriftDeg.toFixed(0) + '^\\circ'} /></strong>
              <span className="metric-card-formula">first → last contribution</span>
            </div>
            <div className="metric-card">
              <small className="metric-card-label">COHERENT GAIN</small>
              <strong className="metric-card-value"><MathExpr tex={cfo.magnitude.toFixed(3)} /></strong>
              <span className="metric-card-formula">normalized correlation magnitude</span>
            </div>
          </div>

          <div className="correlation-cfo-grid">
            <div className="correlation-cfo-curve">
              <div className="visual-caption">
                <span>CORRELATION LOSS VERSUS CFO</span>
                <strong><MathExpr tex={String.raw`G(\epsilon)=\frac1L\left|\sum_{n=0}^{L-1}e^{j2\pi\epsilon n}\right|`} /></strong>
              </div>

              <svg
                viewBox={'0 0 ' + cfoCurve.W + ' ' + cfoCurve.H}
                role="img"
                aria-label="Normalized coherent correlation gain versus normalized carrier frequency offset"
              >
                <line
                  className="corr-cfo-axis"
                  x1={cfoCurve.left}
                  y1={cfoCurve.H - cfoCurve.bottom}
                  x2={cfoCurve.W - cfoCurve.right}
                  y2={cfoCurve.H - cfoCurve.bottom}
                />
                <line
                  className="corr-cfo-axis"
                  x1={cfoCurve.W / 2}
                  y1={cfoCurve.top}
                  x2={cfoCurve.W / 2}
                  y2={cfoCurve.H - cfoCurve.bottom}
                />
                <path className="corr-cfo-response" d={cfoCurve.path} />
                <line
                  className="corr-cfo-probe"
                  x1={cfoCurve.probeX}
                  y1={cfoCurve.top}
                  x2={cfoCurve.probeX}
                  y2={cfoCurve.H - cfoCurve.bottom}
                />
                <SvgMathExpr tex={String.raw`-0.1`} x={cfoCurve.left - 12} y={cfoCurve.H - 29} width={34} />
                <SvgMathExpr tex="0" x={cfoCurve.W / 2 - 8} y={cfoCurve.H - 29} width={18} />
                <SvgMathExpr tex={String.raw`+0.1`} x={cfoCurve.W - 56} y={cfoCurve.H - 29} width={38} />
              </svg>
            </div>

            <div className="correlation-cfo-phasors">
              <div className="visual-caption">
                <span>ONE PHASOR PER SAMPLE CONTRIBUTION</span>
                <strong>CFO makes them fan out before summation</strong>
              </div>

              <svg viewBox="0 0 370 330" role="img" aria-label="Per-sample correlation contribution phasors under carrier frequency offset">
                <line className="corr-cfo-axis" x1="35" y1={phCy} x2="338" y2={phCy} />
                <line className="corr-cfo-axis" x1={phCx} y1="28" x2={phCx} y2="300" />
                <circle className="corr-cfo-unit-circle" cx={phCx} cy={phCy} r={phScale} />

                {contributionPhasors.map((point, index) => (
                  <line
                    key={index}
                    className="corr-cfo-contribution"
                    x1={phCx}
                    y1={phCy}
                    x2={point.x}
                    y2={point.y}
                  />
                ))}

                <line
                  className="corr-cfo-sum"
                  x1={phCx}
                  y1={phCy}
                  x2={sumX}
                  y2={sumY}
                />
                <circle className="corr-cfo-sum-dot" cx={sumX} cy={sumY} r="6" />

                <SvgMathExpr tex={String.raw`\operatorname{Re}`} x={306} y={phCy - 8} width={46} />
                <SvgMathExpr tex={String.raw`\operatorname{Im}`} x={phCx + 8} y={40} width={46} />
              </svg>

              <p>
                Với zero CFO, tất cả contributions cùng hướng.
                CFO làm phase tăng dần theo sample index nên vector sum ngắn lại.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
