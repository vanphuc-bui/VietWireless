import { useMemo, useState } from 'react';
import MathExpr, { SvgMathExpr } from './MathExpr.jsx';

const W = 760;
const H = 240;
const PAD = 34;

function branchPaths(amplitude, phaseDeg, cycles = 7) {
  const phase = (phaseDeg * Math.PI) / 180;
  const i = amplitude * Math.cos(phase);
  const q = amplitude * Math.sin(phase);
  const iPath = [];
  const qPath = [];
  const sumPath = [];
  const count = 520;

  for (let n = 0; n <= count; n += 1) {
    const t = n / count;
    const x = PAD + t * (W - 2 * PAD);
    const carrierAngle = 2 * Math.PI * cycles * t;
    const iValue = i * Math.cos(carrierAngle);
    const qValue = -q * Math.sin(carrierAngle);
    const sumValue = iValue + qValue;

    const toY = (value) => H / 2 - value * 72;
    iPath.push((n === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + toY(iValue).toFixed(2));
    qPath.push((n === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + toY(qValue).toFixed(2));
    sumPath.push((n === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + toY(sumValue).toFixed(2));
  }

  return {
    i,
    q,
    iPath: iPath.join(' '),
    qPath: qPath.join(' '),
    sumPath: sumPath.join(' '),
  };
}

export default function IQBasebandExplorer() {
  const [amplitude, setAmplitude] = useState(1);
  const [phase, setPhase] = useState(45);

  const paths = useMemo(
    () => branchPaths(amplitude, phase),
    [amplitude, phase]
  );

  const rad = (phase * Math.PI) / 180;
  const i = paths.i;
  const q = paths.q;

  const cx = 180;
  const cy = 165;
  const scale = 105;
  const px = cx + scale * i;
  const py = cy - scale * q;

  const complexTex = 'x='
    + i.toFixed(3)
    + (q >= 0 ? '+' : '-')
    + 'j'
    + Math.abs(q).toFixed(3);

  function setPreset(nextAmplitude, nextPhase) {
    setAmplitude(nextAmplitude);
    setPhase(nextPhase);
  }

  return (
    <div className="iq-baseband-lab iq-baseband-lab-v2">
      <div className="iq-preset-row" aria-label="Các ví dụ I Q nhanh">
        <button type="button" onClick={() => setPreset(1, 0)}>
          <MathExpr tex="I" /> only
        </button>
        <button type="button" onClick={() => setPreset(1, 90)}>
          <MathExpr tex="Q" /> only
        </button>
        <button type="button" onClick={() => setPreset(1, 45)}>
          <MathExpr tex={String.raw`+45^\circ`} />
        </button>
        <button type="button" onClick={() => setPreset(1, -45)}>
          <MathExpr tex={String.raw`-45^\circ`} />
        </button>
      </div>

      <div className="iq-baseband-controls iq-baseband-controls-v2">
        <label>
          <span>Magnitude <strong><MathExpr tex={'A=' + amplitude.toFixed(2)} /></strong></span>
          <input
            type="range"
            min="0.2"
            max="1"
            step="0.05"
            value={amplitude}
            onChange={(event) => setAmplitude(Number(event.target.value))}
          />
        </label>

        <label>
          <span>Phase <strong><MathExpr tex={'\\phi=' + phase.toFixed(0) + '^\\circ'} /></strong></span>
          <input
            type="range"
            min="-180"
            max="180"
            step="5"
            value={phase}
            onChange={(event) => setPhase(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="iq-baseband-readout metric-card-grid">
        <div className="metric-card">
          <small className="metric-card-label"><MathExpr tex="I" /></small>
          <strong className="metric-card-value"><MathExpr tex={i.toFixed(3)} /></strong>
          <span className="metric-card-formula"><MathExpr tex={String.raw`A\cos\phi`} /></span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label"><MathExpr tex="Q" /></small>
          <strong className="metric-card-value"><MathExpr tex={q.toFixed(3)} /></strong>
          <span className="metric-card-formula"><MathExpr tex={String.raw`A\sin\phi`} /></span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">COMPLEX VALUE</small>
          <strong className="metric-card-value"><MathExpr tex={complexTex} /></strong>
          <span className="metric-card-formula"><MathExpr tex="I+jQ" /></span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">MAGNITUDE / PHASE</small>
          <strong className="metric-card-value">
            <MathExpr tex={amplitude.toFixed(2) + '\\angle' + phase.toFixed(0) + '^\\circ'} />
          </strong>
          <span className="metric-card-formula"><MathExpr tex={String.raw`Ae^{j\phi}`} /></span>
        </div>
      </div>

      <div className="iq-baseband-grid iq-baseband-grid-v2">
        <div className="iq-baseband-plane">
          <div className="visual-caption">
            <span>COMPLEX BASEBAND POINT</span>
            <strong><MathExpr tex="x=I+jQ" /></strong>
          </div>

          <svg viewBox="0 0 360 330" role="img" aria-label="Điểm I Q trên complex plane">
            <line className="iqb-axis" x1="42" y1={cy} x2="326" y2={cy} />
            <line className="iqb-axis" x1={cx} y1="30" x2={cx} y2="300" />
            <circle className="iqb-guide" cx={cx} cy={cy} r={scale * amplitude} />
            <line className="iqb-projection" x1={px} y1={py} x2={px} y2={cy} />
            <line className="iqb-projection" x1={px} y1={py} x2={cx} y2={py} />
            <line className="iqb-vector" x1={cx} y1={cy} x2={px} y2={py} />
            <circle className="iqb-dot" cx={px} cy={py} r="6" />

            <SvgMathExpr tex="I" x={312} y={cy - 9} width={24} />
            <SvgMathExpr tex="Q" x={cx + 9} y={42} width={24} />
            <SvgMathExpr tex={'I=' + i.toFixed(2)} x={px + 8} y={cy - 8} width={78} />
            <SvgMathExpr tex={'Q=' + q.toFixed(2)} x={cx + 8} y={py - 8} width={78} />
            <SvgMathExpr tex="A" x={(cx + px) / 2 - 8} y={(cy + py) / 2 - 8} width={24} />
          </svg>
        </div>

        <div className="iq-baseband-rf iq-rf-decomposition">
          <div className="visual-caption">
            <span>QUADRATURE RF SYNTHESIS</span>
            <strong>hai branch waveforms → một real waveform</strong>
          </div>

          <div className="iq-rf-formula">
            <MathExpr tex={String.raw`s_{\mathrm{RF}}(t)=I\cos(\omega_ct)-Q\sin(\omega_ct)`} />
          </div>

          <div className="iq-rf-legend">
            <span><i className="i-branch"></i><MathExpr tex={String.raw`I\cos(\omega_ct)`} /></span>
            <span><i className="q-branch"></i><MathExpr tex={String.raw`-Q\sin(\omega_ct)`} /></span>
            <span><i className="sum"></i><MathExpr tex={String.raw`s_{\mathrm{RF}}(t)`} /></span>
          </div>

          <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label="Hai nhánh I Q và waveform RF tổng">
            <line className="iqb-axis" x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} />
            <path className="iqb-rf-i" d={paths.iPath} />
            <path className="iqb-rf-q" d={paths.qPath} />
            <path className="iqb-rf-wave" d={paths.sumPath} />
          </svg>

          <p>
            Với <MathExpr tex={String.raw`I=A\cos\phi`} /> và <MathExpr tex={String.raw`Q=A\sin\phi`} />,
            tổng hai nhánh bằng <MathExpr tex={String.raw`A\cos(\omega_ct+\phi)`} />.
          </p>
        </div>
      </div>

      <p className="iq-baseband-caption">
        Thay phase làm complex point quay trên <MathExpr tex="I/Q" /> plane.
        Cùng lúc, tỷ lệ giữa cosine branch và sine branch thay đổi để tạo đúng phase của waveform RF tổng.
      </p>
    </div>
  );
}
