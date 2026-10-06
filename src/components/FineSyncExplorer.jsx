import { useMemo, useState } from 'react';
import MathExpr from './MathExpr.jsx';

const N = 128;
const NCP = 16;
const L = 7;
const SAFE_MIN = L - 1 - NCP;
const SAFE_MAX = 0;

function add(a, b) {
  return { re: a.re + b.re, im: a.im + b.im };
}

function mul(a, b) {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

function desiredCfoPower(epsilon) {
  if (Math.abs(epsilon) < 1e-9) return 1;
  const numerator = Math.sin(Math.PI * epsilon);
  const denominator = N * Math.sin(Math.PI * epsilon / N);
  const gain = numerator / denominator;
  return gain * gain;
}

function wrapDegrees(value) {
  let wrapped = value % 360;
  if (wrapped > 180) wrapped -= 360;
  if (wrapped < -180) wrapped += 360;
  return wrapped;
}

export default function FineSyncExplorer() {
  const [timingOffset, setTimingOffset] = useState(-4);
  const [epsilon, setEpsilon] = useState(0.08);

  const result = useMemo(() => {
    const timingSafe = timingOffset >= SAFE_MIN && timingOffset <= SAFE_MAX;
    const timingPhasePerSubcarrier = 360 * timingOffset / N;
    const cfoDrift = 360 * epsilon;
    const desiredPower = desiredCfoPower(epsilon);
    const iciPower = Math.max(0, 1 - desiredPower);

    const timingPoints = Array.from({ length: 49 }, (_, index) => {
      const k = index - 24;
      return { k, phase: wrapDegrees(360 * k * timingOffset / N) };
    });

    const cfoPoints = Array.from({ length: 65 }, (_, index) => {
      const n = 2 * index;
      return { n, phase: 360 * epsilon * n / N };
    });

    return {
      timingSafe,
      timingPhasePerSubcarrier,
      cfoDrift,
      desiredPower,
      iciPower,
      timingPoints,
      cfoPoints,
    };
  }, [timingOffset, epsilon]);

  const timelineStart = -22;
  const timelineEnd = N + 10;
  const timelineSpan = timelineEnd - timelineStart;
  const pos = (sample) => 100 * (sample - timelineStart) / timelineSpan;
  const windowWidth = 100 * N / timelineSpan;

  const width = 680;
  const height = 220;
  const left = 42;
  const right = 18;
  const top = 18;
  const bottom = 38;

  const xTiming = (k) => left + (k + 24) * (width - left - right) / 48;
  const yTiming = (phase) => top + (180 - phase) * (height - top - bottom) / 360;
  const timingPolyline = result.timingPoints
    .map((item) => xTiming(item.k) + ',' + yTiming(item.phase))
    .join(' ');

  const xCfo = (n) => left + n * (width - left - right) / N;
  const maxCfoPhase = 180;
  const yCfo = (phase) => top + (maxCfoPhase - phase) * (height - top - bottom) / (2 * maxCfoPhase);
  const cfoPolyline = result.cfoPoints
    .map((item) => xCfo(item.n) + ',' + yCfo(item.phase))
    .join(' ');

  return (
    <div className="fine-sync-explorer">
      <div className="fine-sync-controls">
        <label>
          <span>FFT-window offset <strong><MathExpr tex={'\\Delta n=' + timingOffset} /></strong></span>
          <input
            type="range"
            min="-20"
            max="8"
            step="1"
            value={timingOffset}
            onChange={(event) => setTimingOffset(Number(event.target.value))}
          />
          <small>âm = bắt đầu sớm trong CP, dương = bắt đầu muộn</small>
        </label>

        <label>
          <span>Residual normalized CFO <strong><MathExpr tex={'\\epsilon=' + epsilon.toFixed(2)} /></strong></span>
          <input
            type="range"
            min="-0.5"
            max="0.5"
            step="0.01"
            value={epsilon}
            onChange={(event) => setEpsilon(Number(event.target.value))}
          />
          <small><MathExpr tex={String.raw`\epsilon=\Delta f_{\mathrm{CFO}}/\Delta f_{\mathrm{SCS}}`} /></small>
        </label>
      </div>

      <div className="fine-sync-readout metric-card-grid">
        <div className="metric-card">
          <small className="metric-card-label">SAFE TIMING RANGE</small>
          <strong className="metric-card-value"><MathExpr tex={String.raw`-10\le\Delta n\le0`} /></strong>
          <span className="metric-card-formula"><MathExpr tex={String.raw`N_{\mathrm{CP}}=16,\ L=7`} /></span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">CURRENT WINDOW</small>
          <strong className="metric-card-value">{result.timingSafe ? 'safe' : 'outside'}</strong>
          <span className="metric-card-formula">{result.timingSafe ? 'circular model còn hợp lệ' : 'có nguy cơ ISI / mất circularity'}</span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">TIMING PHASE SLOPE</small>
          <strong className="metric-card-value">{result.timingPhasePerSubcarrier.toFixed(2)}° / SC</strong>
          <span className="metric-card-formula">theo convention của lab</span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">CFO PHASE DRIFT</small>
          <strong className="metric-card-value">{result.cfoDrift.toFixed(1)}°</strong>
          <span className="metric-card-formula">qua một useful symbol</span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">ICI POWER</small>
          <strong className="metric-card-value">{(100 * result.iciPower).toFixed(2)}%</strong>
          <span className="metric-card-formula">ideal OFDM model</span>
        </div>
      </div>

      <div className="fine-sync-window-panel">
        <div className="visual-caption">
          <span>FFT WINDOW PLACEMENT</span>
          <strong>CP bảo vệ một khoảng timing, không phải mọi offset</strong>
        </div>

        <div className="fine-sync-timeline">
          <div
            className="fine-sync-prev-zone"
            style={{ left: '0%', width: pos(-NCP) + '%' }}
          >
            previous
          </div>
          <div
            className="fine-sync-cp-zone"
            style={{ left: pos(-NCP) + '%', width: (pos(0) - pos(-NCP)) + '%' }}
          >
            CP
          </div>
          <div
            className="fine-sync-useful-zone"
            style={{ left: pos(0) + '%', width: (pos(N) - pos(0)) + '%' }}
          >
            useful symbol
          </div>
          <div
            className="fine-sync-next-zone"
            style={{ left: pos(N) + '%', width: (100 - pos(N)) + '%' }}
          >
            next
          </div>

          <div
            className="fine-sync-safe-zone"
            style={{ left: pos(SAFE_MIN) + '%', width: (pos(SAFE_MAX) - pos(SAFE_MIN)) + '%' }}
          >
            safe start region
          </div>

          <div
            className={'fine-sync-window ' + (result.timingSafe ? 'safe' : 'unsafe')}
            style={{ left: pos(timingOffset) + '%', width: windowWidth + '%' }}
          >
            <span>FFT window</span>
          </div>

          <div
            className="fine-sync-current-start"
            style={{ left: pos(timingOffset) + '%' }}
          >
            <span><MathExpr tex={'\\Delta n=' + timingOffset} /></span>
          </div>
        </div>

        <div className="fine-sync-window-note">
          <span><strong>Channel support:</strong> taps 0 đến 6</span>
          <span><strong>CP:</strong> 16 samples</span>
          <span><strong>Useful FFT:</strong> 128 samples</span>
        </div>
      </div>

      <div className="fine-sync-chart-grid">
        <div className="fine-sync-chart">
          <div className="visual-caption">
            <span>TIMING OFFSET TRONG SAFE REGION</span>
            <strong>Phase ramp theo subcarrier</strong>
          </div>
          <svg viewBox="0 0 680 220" role="img" aria-label="Phase ramp theo subcarrier do FFT-window timing offset">
            {[-180, -90, 0, 90, 180].map((phase) => (
              <g key={phase}>
                <line className="fine-sync-gridline" x1={left} x2={width - right} y1={yTiming(phase)} y2={yTiming(phase)} />
                <text className="fine-sync-axis-label" x="2" y={yTiming(phase) + 4}>{phase}°</text>
              </g>
            ))}
            {[-24, -12, 0, 12, 24].map((k) => (
              <text key={k} className="fine-sync-axis-label" x={xTiming(k) - 7} y={height - 10}>{k}</text>
            ))}
            <polyline className="fine-sync-timing-line" points={timingPolyline} />
          </svg>
        </div>

        <div className="fine-sync-chart">
          <div className="visual-caption">
            <span>RESIDUAL CFO</span>
            <strong>Phase quay theo sample index</strong>
          </div>
          <svg viewBox="0 0 680 220" role="img" aria-label="Phase rotation theo sample do residual CFO">
            {[-180, -90, 0, 90, 180].map((phase) => (
              <g key={phase}>
                <line className="fine-sync-gridline" x1={left} x2={width - right} y1={yCfo(phase)} y2={yCfo(phase)} />
                <text className="fine-sync-axis-label" x="2" y={yCfo(phase) + 4}>{phase}°</text>
              </g>
            ))}
            {[0, 32, 64, 96, 128].map((n) => (
              <text key={n} className="fine-sync-axis-label" x={xCfo(n) - 7} y={height - 10}>{n}</text>
            ))}
            <polyline className="fine-sync-cfo-line" points={cfoPolyline} />
          </svg>
        </div>
      </div>

      <p className="fine-sync-explorer-note">
        Lab dùng OFDM model minh họa với <MathExpr tex={String.raw`N=128`} />, <MathExpr tex={String.raw`N_{\mathrm{CP}}=16`} /> và channel support
        <MathExpr tex={String.raw`L=7`} /> samples. Safe timing interval theo convention của bài là
        <MathExpr tex={String.raw`L-1-N_{\mathrm{CP}}\le\Delta n\le0`} />.
        Đây không phải một NR numerology cụ thể và cũng không phải timing algorithm bắt buộc của 3GPP.
      </p>
    </div>
  );
}
