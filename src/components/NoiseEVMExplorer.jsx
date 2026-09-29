import { useMemo, useState } from 'react';
import MathExpr, { SvgMathExpr } from './MathExpr.jsx';

const refs = [
  { bits: '00', i: 1 / Math.sqrt(2), q: 1 / Math.sqrt(2) },
  { bits: '01', i: -1 / Math.sqrt(2), q: 1 / Math.sqrt(2) },
  { bits: '11', i: -1 / Math.sqrt(2), q: -1 / Math.sqrt(2) },
  { bits: '10', i: 1 / Math.sqrt(2), q: -1 / Math.sqrt(2) },
];

const SAMPLE_COUNT = 160;

function pseudoUniform(index, salt) {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453123;
  return value - Math.floor(value);
}

function gaussianPair(index) {
  const u1 = Math.max(1e-9, pseudoUniform(index + 1, 1));
  const u2 = pseudoUniform(index + 1, 2);
  const radius = Math.sqrt(-2 * Math.log(u1));
  const angle = 2 * Math.PI * u2;
  return {
    i: radius * Math.cos(angle),
    q: radius * Math.sin(angle),
  };
}

const rawGaussian = Array.from({ length: SAMPLE_COUNT }, (_, n) => gaussianPair(n));
const rawComplexPower = rawGaussian.reduce(
  (sum, point) => sum + point.i * point.i + point.q * point.q,
  0
) / SAMPLE_COUNT;
const normalizedGaussian = rawGaussian.map((point) => ({
  i: point.i / Math.sqrt(rawComplexPower),
  q: point.q / Math.sqrt(rawComplexPower),
}));

function rotate(point, phaseRad) {
  return {
    i: point.i * Math.cos(phaseRad) - point.q * Math.sin(phaseRad),
    q: point.i * Math.sin(phaseRad) + point.q * Math.cos(phaseRad),
  };
}

export default function NoiseEVMExplorer() {
  const [mode, setMode] = useState('awgn');
  const [snrDb, setSnrDb] = useState(20);
  const [phaseError, setPhaseError] = useState(10);

  const noiseEnabled = mode === 'awgn' || mode === 'combined';
  const phaseEnabled = mode === 'phase' || mode === 'combined';

  const snrLinear = Math.pow(10, snrDb / 10);
  const targetNoisePower = noiseEnabled ? 1 / snrLinear : 0;
  const noiseScale = Math.sqrt(targetNoisePower);
  const phaseRad = phaseEnabled ? (phaseError * Math.PI) / 180 : 0;

  const samples = useMemo(
    () => Array.from({ length: SAMPLE_COUNT }, (_, n) => {
      const ref = refs[n % refs.length];
      const rotated = rotate(ref, phaseRad);
      const noise = normalizedGaussian[n];

      return {
        ref,
        i: rotated.i + noiseScale * noise.i,
        q: rotated.q + noiseScale * noise.q,
      };
    }),
    [noiseScale, phaseRad]
  );

  const metrics = useMemo(() => {
    let signalPower = 0;
    let totalErrorPower = 0;

    for (const sample of samples) {
      signalPower += sample.ref.i * sample.ref.i + sample.ref.q * sample.ref.q;
      const errorI = sample.i - sample.ref.i;
      const errorQ = sample.q - sample.ref.q;
      totalErrorPower += errorI * errorI + errorQ * errorQ;
    }

    signalPower /= samples.length;
    totalErrorPower /= samples.length;

    const evm = Math.sqrt(totalErrorPower / signalPower);
    const evmDb = evm > 0 ? 20 * Math.log10(evm) : -99;
    const awgnPredictedEvm = noiseEnabled ? 1 / Math.sqrt(snrLinear) : 0;
    const cpeOnlyEvm = phaseEnabled
      ? 2 * Math.abs(Math.sin(phaseRad / 2))
      : 0;

    return {
      signalPower,
      totalErrorPower,
      evm,
      evmDb,
      awgnPredictedEvm,
      cpeOnlyEvm,
    };
  }, [samples, noiseEnabled, phaseEnabled, snrLinear, phaseRad]);

  const cx = 200;
  const cy = 188;
  const scale = 122;

  const focusSample = samples[0];
  const focusRefX = cx + focusSample.ref.i * scale;
  const focusRefY = cy - focusSample.ref.q * scale;
  const focusRxX = cx + focusSample.i * scale;
  const focusRxY = cy - focusSample.q * scale;

  function selectMode(next) {
    setMode(next);
    if (next === 'awgn') {
      setSnrDb(20);
      setPhaseError(0);
    } else if (next === 'phase') {
      setSnrDb(30);
      setPhaseError(10);
    } else {
      setSnrDb(20);
      setPhaseError(8);
    }
  }

  return (
    <div className="noise-evm-lab noise-evm-lab-v2">
      <div className="noise-mode-tabs" role="tablist" aria-label="Chọn loại impairment">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'awgn'}
          className={mode === 'awgn' ? 'selected' : ''}
          onClick={() => selectMode('awgn')}
        >
          AWGN only
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'phase'}
          className={mode === 'phase' ? 'selected' : ''}
          onClick={() => selectMode('phase')}
        >
          Phase error only
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'combined'}
          className={mode === 'combined' ? 'selected' : ''}
          onClick={() => selectMode('combined')}
        >
          Combined
        </button>
      </div>

      <div className="noise-controls noise-controls-v2">
        <label className={!noiseEnabled ? 'disabled' : ''}>
          <span>
            AWGN SNR
            <strong><MathExpr tex={snrDb.toFixed(0) + '\\,\\mathrm{dB}'} /></strong>
          </span>
          <input
            type="range"
            min="6"
            max="30"
            step="1"
            value={snrDb}
            disabled={!noiseEnabled}
            onChange={(event) => setSnrDb(Number(event.target.value))}
          />
        </label>

        <label className={!phaseEnabled ? 'disabled' : ''}>
          <span>
            Common phase error
            <strong><MathExpr tex={'\\theta=' + phaseError.toFixed(0) + '^\\circ'} /></strong>
          </span>
          <input
            type="range"
            min="-25"
            max="25"
            step="1"
            value={phaseError}
            disabled={!phaseEnabled}
            onChange={(event) => setPhaseError(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="noise-readout metric-card-grid">
        <div className="metric-card">
          <small className="metric-card-label">REFERENCE POWER</small>
          <strong className="metric-card-value"><MathExpr tex={metrics.signalPower.toFixed(3)} /></strong>
          <span className="metric-card-formula"><MathExpr tex={String.raw`E_s=1`} /> normalized QPSK</span>
        </div>

        <div className="metric-card">
          <small className="metric-card-label">AWGN SNR</small>
          <strong className="metric-card-value">
            {noiseEnabled
              ? <MathExpr tex={snrDb.toFixed(0) + '\\,\\mathrm{dB}'} />
              : 'off'}
          </strong>
          <span className="metric-card-formula">
            {noiseEnabled ? 'defined from injected noise power' : 'no additive noise in this mode'}
          </span>
        </div>

        <div className="metric-card">
          <small className="metric-card-label">TOTAL EVM RMS</small>
          <strong className="metric-card-value"><MathExpr tex={(metrics.evm * 100).toFixed(1) + '\\%'} /></strong>
          <span className="metric-card-formula">
            <MathExpr tex={String.raw`\sqrt{P_{\rm error}/P_{\rm ref}}`} />
          </span>
        </div>

        <div className="metric-card">
          <small className="metric-card-label">EVM IN dB</small>
          <strong className="metric-card-value"><MathExpr tex={metrics.evmDb.toFixed(1) + '\\,\\mathrm{dB}'} /></strong>
          <span className="metric-card-formula"><MathExpr tex={String.raw`20\log_{10}(\mathrm{EVM})`} /></span>
        </div>
      </div>

      <div className="noise-lab-grid">
        <div className="noise-constellation-wrap">
          <div className="visual-caption">
            <span>QPSK CONSTELLATION</span>
            <strong>reference points + received cloud</strong>
          </div>

          <svg viewBox="0 0 400 380" role="img" aria-label="QPSK constellation with deterministic Gaussian noise and optional common phase error">
            <line className="noise-axis" x1="34" y1={cy} x2="366" y2={cy} />
            <line className="noise-axis" x1={cx} y1="28" x2={cx} y2="348" />

            {refs.map((point) => (
              <g key={point.bits}>
                <circle
                  className="noise-ideal-point"
                  cx={cx + point.i * scale}
                  cy={cy - point.q * scale}
                  r="7"
                />
                <text
                  className="noise-bit-label"
                  x={cx + point.i * scale + 9}
                  y={cy - point.q * scale - 9}
                >
                  {point.bits}
                </text>
              </g>
            ))}

            {samples.map((point, index) => (
              <circle
                key={index}
                className="noise-rx-point"
                cx={cx + point.i * scale}
                cy={cy - point.q * scale}
                r="2.4"
              />
            ))}

            <line
              className="noise-focus-error"
              x1={focusRefX}
              y1={focusRefY}
              x2={focusRxX}
              y2={focusRxY}
            />
            <circle className="noise-focus-point" cx={focusRxX} cy={focusRxY} r="5" />

            <SvgMathExpr tex="I" x={347} y={cy - 8} width={24} />
            <SvgMathExpr tex="Q" x={cx + 8} y={40} width={24} />
          </svg>

          <div className="noise-constellation-legend">
            <span><i className="ideal"></i>reference symbol</span>
            <span><i className="received"></i>received sample</span>
            <span><i className="error"></i>one error vector</span>
          </div>
        </div>

        <div className="noise-relation-panel">
          <div className="visual-caption">
            <span>WHAT THE NUMBERS MEAN</span>
            <strong>same EVM can come from different physical causes</strong>
          </div>

          {mode === 'awgn' && (
            <>
              <div className="noise-relation-equation">
                <small>AWGN-ONLY PREDICTION</small>
                <strong><MathExpr tex={String.raw`\mathrm{EVM}=1/\sqrt{\mathrm{SNR}}`} /></strong>
              </div>
              <div className="noise-relation-compare">
                <span>
                  <small>PREDICTED EVM</small>
                  <strong><MathExpr tex={(metrics.awgnPredictedEvm * 100).toFixed(1) + '\\%'} /></strong>
                </span>
                <span>
                  <small>MEASURED IN LAB</small>
                  <strong><MathExpr tex={(metrics.evm * 100).toFixed(1) + '\\%'} /></strong>
                </span>
              </div>
              <p>
                Vì demo chỉ có additive complex Gaussian noise và unit reference power,
                measured EVM bám trực tiếp theo injected SNR.
              </p>
            </>
          )}

          {mode === 'phase' && (
            <>
              <div className="noise-relation-equation">
                <small>PHASE-ONLY GEOMETRY</small>
                <strong><MathExpr tex={String.raw`\mathrm{EVM}=2\left|\sin(\theta/2)\right|`} /></strong>
              </div>
              <div className="noise-relation-compare">
                <span>
                  <small>PREDICTED FROM PHASE</small>
                  <strong><MathExpr tex={(metrics.cpeOnlyEvm * 100).toFixed(1) + '\\%'} /></strong>
                </span>
                <span>
                  <small>MEASURED IN LAB</small>
                  <strong><MathExpr tex={(metrics.evm * 100).toFixed(1) + '\\%'} /></strong>
                </span>
              </div>
              <p>
                EVM có thể lớn dù AWGN đang tắt.
                Vì vậy không được gọi <MathExpr tex={String.raw`1/\mathrm{EVM}^2`} /> là thermal-noise SNR trong case này.
              </p>
            </>
          )}

          {mode === 'combined' && (
            <>
              <div className="noise-relation-equation">
                <small>COMBINED ERROR</small>
                <strong><MathExpr tex={String.raw`e=z-d_{\rm ref}`} /></strong>
              </div>
              <div className="noise-relation-compare">
                <span>
                  <small>AWGN-ONLY EVM PART</small>
                  <strong><MathExpr tex={(metrics.awgnPredictedEvm * 100).toFixed(1) + '\\%'} /></strong>
                </span>
                <span>
                  <small>TOTAL MEASURED EVM</small>
                  <strong><MathExpr tex={(metrics.evm * 100).toFixed(1) + '\\%'} /></strong>
                </span>
              </div>
              <p>
                Total EVM chứa cả random noise lẫn deterministic rotation.
                Một scalar EVM không tự tách được hai nguyên nhân này.
              </p>
            </>
          )}
        </div>
      </div>

      <p className="noise-lab-note noise-lab-note-v2">
        Noise points được tạo deterministic để slider cho kết quả ổn định giữa các lần render.
        Cloud được chuẩn hóa sao cho injected complex-noise power khớp target SNR của demo; đây là teaching model, không phải RF measurement instrument.
      </p>
    </div>
  );
}
