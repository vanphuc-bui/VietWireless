import { useMemo, useState } from 'react';
import MathExpr, { SvgMathExpr } from './MathExpr.jsx';

const schemes = {
  BPSK: {
    scale: 1,
    points: [
      { bits: '0', i: -1, q: 0 },
      { bits: '1', i: 1, q: 0 },
    ],
  },
  QPSK: {
    scale: Math.sqrt(2),
    points: [
      { bits: '00', i: 1, q: 1 },
      { bits: '01', i: -1, q: 1 },
      { bits: '11', i: -1, q: -1 },
      { bits: '10', i: 1, q: -1 },
    ],
  },
  '16QAM': {
    scale: Math.sqrt(10),
    points: [
      { bits: '0000', i: -3, q: 3 }, { bits: '0001', i: -1, q: 3 }, { bits: '0011', i: 1, q: 3 }, { bits: '0010', i: 3, q: 3 },
      { bits: '0100', i: -3, q: 1 }, { bits: '0101', i: -1, q: 1 }, { bits: '0111', i: 1, q: 1 }, { bits: '0110', i: 3, q: 1 },
      { bits: '1100', i: -3, q: -1 }, { bits: '1101', i: -1, q: -1 }, { bits: '1111', i: 1, q: -1 }, { bits: '1110', i: 3, q: -1 },
      { bits: '1000', i: -3, q: -3 }, { bits: '1001', i: -1, q: -3 }, { bits: '1011', i: 1, q: -3 }, { bits: '1010', i: 3, q: -3 },
    ],
  },
};

function normalizedPoints(scheme) {
  const config = schemes[scheme];
  return config.points.map((point) => ({
    ...point,
    i: point.i / config.scale,
    q: point.q / config.scale,
  }));
}

function complexTex(i, q, name = 'd') {
  const sign = q >= 0 ? '+' : '-';
  return name + '=' + i.toFixed(3) + sign + 'j' + Math.abs(q).toFixed(3);
}

function nearestPoint(points, received) {
  return points.reduce((best, point, index) => {
    const distance2 = (received.i - point.i) ** 2 + (received.q - point.q) ** 2;
    if (!best || distance2 < best.distance2) return { point, index, distance2 };
    return best;
  }, null);
}

function minDistance(points) {
  let best = Infinity;
  for (let a = 0; a < points.length; a += 1) {
    for (let b = a + 1; b < points.length; b += 1) {
      best = Math.min(
        best,
        Math.hypot(points[a].i - points[b].i, points[a].q - points[b].q)
      );
    }
  }
  return best;
}

function bitErrors(a, b) {
  return a.split('').reduce((count, bit, index) => count + (bit !== b[index] ? 1 : 0), 0);
}

export default function ModulationExplorer() {
  const [mode, setMode] = useState('mapping');
  const [scheme, setScheme] = useState('QPSK');
  const [index, setIndex] = useState(0);
  const [errorI, setErrorI] = useState(0);
  const [errorQ, setErrorQ] = useState(0);

  const points = useMemo(() => normalizedPoints(scheme), [scheme]);
  const activeIndex = Math.min(index, points.length - 1);
  const active = points[activeIndex];
  const bitsPerSymbol = Math.log2(points.length);
  const dMin = useMemo(() => minDistance(points), [points]);

  const received = {
    i: active.i + errorI,
    q: active.q + errorQ,
  };
  const decision = nearestPoint(points, received);
  const detected = decision.point;

  const magnitude = Math.hypot(active.i, active.q);
  const phase = Math.atan2(active.q, active.i) * 180 / Math.PI;
  const errorMagnitude = Math.hypot(errorI, errorQ);
  const detectedBitErrors = bitErrors(active.bits, detected.bits);

  const cx = 210;
  const cy = 190;
  const scale = 118;
  const activeX = cx + active.i * scale;
  const activeY = cy - active.q * scale;
  const receivedX = cx + received.i * scale;
  const receivedY = cy - received.q * scale;

  function chooseScheme(next) {
    setScheme(next);
    setIndex(0);
    setErrorI(0);
    setErrorQ(0);
  }

  function resetError() {
    setErrorI(0);
    setErrorQ(0);
  }

  function applyErrorPreset(kind) {
    if (kind === 'i') {
      setErrorI(scheme === '16QAM' ? dMin * 0.62 : dMin * 0.58);
      setErrorQ(0);
    } else if (kind === 'q') {
      setErrorI(0);
      setErrorQ(dMin * 0.62);
    } else {
      setErrorI(dMin * 0.46);
      setErrorQ(-dMin * 0.46);
    }
  }

  const decisionThresholds = scheme === '16QAM'
    ? [-2, 0, 2].map((level) => level / Math.sqrt(10))
    : scheme === 'QPSK'
      ? [0]
      : [0];

  return (
    <div className="modulation-lab modulation-lab-v2">
      <div className="modulation-mode-tabs" role="tablist" aria-label="Chọn mapping hoặc noisy decision">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'mapping'}
          className={mode === 'mapping' ? 'selected' : ''}
          onClick={() => setMode('mapping')}
        >
          Mapping
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'decision'}
          className={mode === 'decision' ? 'selected' : ''}
          onClick={() => setMode('decision')}
        >
          Noisy decision
        </button>
      </div>

      <div className="modulation-tabs modulation-tabs-v2">
        {Object.keys(schemes).map((name) => (
          <button
            type="button"
            key={name}
            className={scheme === name ? 'selected' : ''}
            onClick={() => chooseScheme(name)}
          >
            {name}
          </button>
        ))}
      </div>

      {mode === 'decision' && (
        <div className="modulation-error-controls">
          <label>
            <span>Error on <MathExpr tex="I" /> <strong><MathExpr tex={errorI.toFixed(2)} /></strong></span>
            <input
              type="range"
              min="-1.2"
              max="1.2"
              step="0.02"
              value={errorI}
              onChange={(event) => setErrorI(Number(event.target.value))}
            />
          </label>
          <label>
            <span>Error on <MathExpr tex="Q" /> <strong><MathExpr tex={errorQ.toFixed(2)} /></strong></span>
            <input
              type="range"
              min="-1.2"
              max="1.2"
              step="0.02"
              value={errorQ}
              onChange={(event) => setErrorQ(Number(event.target.value))}
            />
          </label>
          <div className="modulation-error-presets">
            <button type="button" onClick={resetError}>No error</button>
            <button type="button" onClick={() => applyErrorPreset('i')}>Cross I boundary</button>
            <button type="button" onClick={() => applyErrorPreset('q')}>Cross Q boundary</button>
            <button type="button" onClick={() => applyErrorPreset('diag')}>Diagonal error</button>
          </div>
        </div>
      )}

      <div className="modulation-readout metric-card-grid">
        <div className="metric-card">
          <small className="metric-card-label">BITS / SYMBOL</small>
          <strong className="metric-card-value"><MathExpr tex={String(bitsPerSymbol)} /></strong>
          <span className="metric-card-formula"><MathExpr tex={String.raw`\log_2 M`} /></span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">SELECTED LABEL</small>
          <strong className="metric-card-value">{active.bits}</strong>
          <span className="metric-card-formula">illustrative Gray labeling</span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">IDEAL SYMBOL</small>
          <strong className="metric-card-value"><MathExpr tex={complexTex(active.i, active.q)} /></strong>
          <span className="metric-card-formula"><MathExpr tex="d[m]" /></span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">{mode === 'mapping' ? 'MINIMUM DISTANCE' : 'DETECTED LABEL'}</small>
          <strong className="metric-card-value">
            {mode === 'mapping'
              ? <MathExpr tex={dMin.toFixed(3)} />
              : detected.bits}
          </strong>
          <span className="metric-card-formula">
            {mode === 'mapping'
              ? <MathExpr tex="d_{\min}" />
              : detectedBitErrors + ' bit error(s) in this label example'}
          </span>
        </div>
      </div>

      <div className="modulation-body modulation-body-v2">
        <div className="modulation-constellation">
          <div className="visual-caption">
            <span>CONSTELLATION</span>
            <strong>{scheme} · normalized average symbol energy</strong>
          </div>

          <svg viewBox="0 0 420 390" role="img" aria-label={'Constellation ' + scheme + ' với ideal symbol và received sample'}>
            <line className="mod-axis" x1="35" y1={cy} x2="385" y2={cy} />
            <line className="mod-axis" x1={cx} y1="25" x2={cx} y2="355" />

            {scheme === 'BPSK' && (
              <line className="mod-decision-boundary" x1={cx} y1="35" x2={cx} y2="345" />
            )}

            {scheme !== 'BPSK' && decisionThresholds.map((threshold) => (
              <g key={'v-' + threshold}>
                <line
                  className="mod-decision-boundary"
                  x1={cx + threshold * scale}
                  y1="35"
                  x2={cx + threshold * scale}
                  y2="345"
                />
                <line
                  className="mod-decision-boundary"
                  x1="45"
                  y1={cy - threshold * scale}
                  x2="375"
                  y2={cy - threshold * scale}
                />
              </g>
            ))}

            <SvgMathExpr tex="I" x={365} y={cy - 8} width={24} />
            <SvgMathExpr tex="Q" x={cx + 8} y={38} width={24} />

            {points.map((point, idx) => {
              const x = cx + point.i * scale;
              const y = cy - point.q * scale;
              return (
                <g
                  key={point.bits}
                  className={idx === activeIndex ? 'active' : ''}
                  onClick={() => {
                    setIndex(idx);
                    resetError();
                  }}
                >
                  <circle className="mod-point" cx={x} cy={y} r={idx === activeIndex ? 8 : 5} />
                  <text className="mod-bit-label" x={x + 8} y={y - 8}>{point.bits}</text>
                </g>
              );
            })}

            {mode === 'decision' && (
              <>
                <line
                  className="mod-error-vector"
                  x1={activeX}
                  y1={activeY}
                  x2={receivedX}
                  y2={receivedY}
                />
                <circle className="mod-received-point" cx={receivedX} cy={receivedY} r="7" />
              </>
            )}
          </svg>

          {mode === 'decision' && (
            <div className="modulation-constellation-legend">
              <span><i className="ideal"></i>ideal constellation points</span>
              <span><i className="received"></i>received sample</span>
              <span><i className="boundary"></i>nearest-neighbor decision boundaries</span>
            </div>
          )}
        </div>

        <aside className="modulation-symbol-picker modulation-symbol-picker-v2">
          <span className="card-label">CHỌN BIT LABEL</span>
          <div className="modulation-bit-grid">
            {points.map((point, idx) => (
              <button
                type="button"
                key={point.bits}
                className={idx === activeIndex ? 'selected' : ''}
                onClick={() => {
                  setIndex(idx);
                  resetError();
                }}
              >
                {point.bits}
              </button>
            ))}
          </div>

          <div className="modulation-symbol-details">
            <div>
              <small>IDEAL COMPLEX SYMBOL</small>
              <strong><MathExpr tex={complexTex(active.i, active.q)} /></strong>
            </div>
            <div>
              <small>MAGNITUDE</small>
              <strong><MathExpr tex={magnitude.toFixed(3)} /></strong>
            </div>
            <div>
              <small>PHASE</small>
              <strong><MathExpr tex={phase.toFixed(1) + '^\\circ'} /></strong>
            </div>
          </div>

          {mode === 'mapping' ? (
            <>
              <div className="modulation-chain-mini modulation-chain-mini-v2">
                <div><small>BIT LABEL</small><strong>{active.bits}</strong></div>
                <b>→</b>
                <div><small>MAPPER</small><strong>{scheme}</strong></div>
                <b>→</b>
                <div><small>SYMBOL</small><strong><MathExpr tex="d[m]" /></strong></div>
              </div>

              <p>
                Mapper chọn một complex point trong constellation set.
                Nó chưa quyết định point đó sau này sẽ được pulse-shape theo single-carrier hay đặt vào một multicarrier waveform.
              </p>
            </>
          ) : (
            <>
              <div className="modulation-decision-summary">
                <div>
                  <small>RECEIVED SAMPLE</small>
                  <strong><MathExpr tex={complexTex(received.i, received.q, 'y')} /></strong>
                </div>
                <div>
                  <small>ERROR MAGNITUDE</small>
                  <strong><MathExpr tex={errorMagnitude.toFixed(3)} /></strong>
                </div>
                <div>
                  <small>NEAREST POINT</small>
                  <strong>{detected.bits}</strong>
                </div>
              </div>

              <p>
                Hard nearest-neighbor detector chọn constellation point có Euclidean distance nhỏ nhất.
                Khi received sample vượt decision boundary, detected symbol có thể đổi sang một label khác.
              </p>
            </>
          )}
        </aside>
      </div>

      <p className="modulation-caption-v2">
        Geometry và bit labeling là hai lớp khác nhau.
        Constellation points quyết định Euclidean distances; labels quyết định một symbol error sẽ biến thành bao nhiêu bit errors.
      </p>
    </div>
  );
}
