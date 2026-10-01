import { useMemo, useState } from 'react';
import MathExpr from './MathExpr.jsx';

const N = 16;

function add(a, b) {
  return { re: a.re + b.re, im: a.im + b.im };
}

function mul(a, b) {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

function scale(a, s) {
  return { re: a.re * s, im: a.im * s };
}

function expj(phase) {
  return { re: Math.cos(phase), im: Math.sin(phase) };
}

function mag(z) {
  return Math.hypot(z.re, z.im);
}

function dft(x) {
  return Array.from({ length: N }, (_, k) => {
    let sum = { re: 0, im: 0 };
    for (let n = 0; n < N; n += 1) {
      sum = add(sum, mul(x[n], expj(-2 * Math.PI * k * n / N)));
    }
    return sum;
  });
}

function idft(X) {
  return Array.from({ length: N }, (_, n) => {
    let sum = { re: 0, im: 0 };
    for (let k = 0; k < N; k += 1) {
      sum = add(sum, mul(X[k], expj(2 * Math.PI * k * n / N)));
    }
    return scale(sum, 1 / N);
  });
}

function mse(reference, estimate) {
  return estimate.reduce((sum, value, index) => {
    const er = value.re - reference[index].re;
    const ei = value.im - reference[index].im;
    return sum + er * er + ei * ei;
  }, 0) / estimate.length;
}

export default function ChannelEstimatorComparison() {
  const [noiseAmplitude, setNoiseAmplitude] = useState(0.18);
  const [delayWindow, setDelayWindow] = useState(6);

  const result = useMemo(() => {
    const taps = Array.from({ length: N }, () => ({ re: 0, im: 0 }));
    taps[0] = { re: 1, im: 0 };
    taps[2] = scale(expj(-0.8), 0.55);
    taps[5] = scale(expj(0.9), 0.30);

    const trueH = dft(taps);

    const ls = trueH.map((h, k) => {
      const noise = add(
        scale(expj(0.45 + 1.17 * k), noiseAmplitude),
        scale(expj(1.2 + 0.63 * k), 0.35 * noiseAmplitude),
      );
      return add(h, noise);
    });

    const hLs = idft(ls);

    const hDft = hLs.map((tap, n) => (
      n < delayWindow ? tap : { re: 0, im: 0 }
    ));
    const dftEstimate = dft(hDft);

    const timeNoiseVariance = (noiseAmplitude * noiseAmplitude * 1.1225) / N;
    const hPdp = hLs.map((tap, n) => {
      if (n >= delayWindow) return { re: 0, im: 0 };
      const assumedPower = Math.exp(-n / 1.8);
      const shrink = assumedPower / (assumedPower + timeNoiseVariance);
      return scale(tap, shrink);
    });
    const pdpEstimate = dft(hPdp);

    return {
      trueH,
      ls,
      dftEstimate,
      pdpEstimate,
      mseLs: mse(trueH, ls),
      mseDft: mse(trueH, dftEstimate),
      msePdp: mse(trueH, pdpEstimate),
    };
  }, [noiseAmplitude, delayWindow]);

  const width = 680;
  const height = 250;
  const left = 38;
  const right = 16;
  const top = 18;
  const bottom = 38;
  const maxMag = 2.1;

  const xOf = (k) => left + k * (width - left - right) / (N - 1);
  const yOf = (value) => top + (maxMag - Math.min(maxMag, value)) * (height - top - bottom) / maxMag;
  const polyline = (values) => values.map((value, k) => xOf(k) + ',' + yOf(mag(value))).join(' ');

  return (
    <div className="estimator-comparison-lab">
      <div className="estimator-comparison-controls">
        <label>
          <span>Biên độ noise <strong>{noiseAmplitude.toFixed(2)}</strong></span>
          <input
            type="range"
            min="0"
            max="0.35"
            step="0.01"
            value={noiseAmplitude}
            onChange={(event) => setNoiseAmplitude(Number(event.target.value))}
          />
        </label>

        <label>
          <span>Delay window giả định <strong>{delayWindow} taps</strong></span>
          <input
            type="range"
            min="2"
            max="10"
            step="1"
            value={delayWindow}
            onChange={(event) => setDelayWindow(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="estimator-comparison-readout metric-card-grid">
        <div className="metric-card">
          <small className="metric-card-label">LS MSE</small>
          <strong className="metric-card-value">{result.mseLs.toFixed(4)}</strong>
          <span className="metric-card-formula">không dùng prior về delay</span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">DFT-BASED MSE</small>
          <strong className="metric-card-value">{result.mseDft.toFixed(4)}</strong>
          <span className="metric-card-formula">cắt taps ngoài delay window</span>
        </div>
        <div className="metric-card">
          <small className="metric-card-label">PDP-AWARE MSE</small>
          <strong className="metric-card-value">{result.msePdp.toFixed(4)}</strong>
          <span className="metric-card-formula">shrink taps theo assumed power</span>
        </div>
      </div>

      <div className="estimator-assumption-strip">
        <div>
          <small>CHANNEL THẬT</small>
          <strong><MathExpr tex={String.raw`h[0],\,h[2],\,h[5]\neq0`} /></strong>
          <span>3 paths minh họa</span>
        </div>
        <b>→</b>
        <div>
          <small>LS OBSERVATION</small>
          <strong><MathExpr tex={String.raw`\widehat H_{\mathrm{LS}}[k]=H[k]+W[k]`} /></strong>
          <span>dense-pilot snapshot minh họa</span>
        </div>
        <b>→</b>
        <div>
          <small>THÊM PRIOR</small>
          <strong>delay support / PDP</strong>
          <span>DFT-based hoặc LMMSE-style</span>
        </div>
      </div>

      <div className="estimator-comparison-chart">
        <div className="visual-caption">
          <span>CÙNG OBSERVATION, KHÁC ESTIMATOR</span>
          <strong>Magnitude channel theo subcarrier</strong>
        </div>

        <svg viewBox="0 0 680 250" role="img" aria-label="So sánh channel thật, LS, DFT-based và PDP-aware channel estimation">
          {[0, 0.5, 1.0, 1.5, 2.0].map((value) => (
            <g key={value}>
              <line className="ce-gridline" x1={left} x2={width - right} y1={yOf(value)} y2={yOf(value)} />
              <text className="ce-axis-label" x="4" y={yOf(value) + 4}>{value.toFixed(1)}</text>
            </g>
          ))}

          {Array.from({ length: N }, (_, k) => (
            <text key={k} className="ce-axis-label" x={xOf(k) - 4} y={height - 10}>{k}</text>
          ))}

          <polyline className="ece-true" points={polyline(result.trueH)} />
          <polyline className="ece-ls" points={polyline(result.ls)} />
          <polyline className="ece-dft" points={polyline(result.dftEstimate)} />
          <polyline className="ece-pdp" points={polyline(result.pdpEstimate)} />
        </svg>

        <div className="estimator-comparison-legend">
          <span><i className="true"></i>channel thật</span>
          <span><i className="ls"></i>LS</span>
          <span><i className="dft"></i>DFT-based</span>
          <span><i className="pdp"></i>PDP-aware</span>
        </div>
      </div>

      <div className="estimator-comparison-notes">
        <article>
          <small>NẾU DELAY WINDOW ĐỦ DÀI</small>
          <strong>DFT-based loại bớt noise ở những taps mà physical model cho rằng không tồn tại.</strong>
        </article>
        <article>
          <small>NẾU DELAY WINDOW QUÁ NGẮN</small>
          <strong>Estimator cắt mất path thật, tạo model bias và có thể tệ hơn LS.</strong>
        </article>
        <article>
          <small>NẾU PRIOR HỢP LÝ</small>
          <strong>PDP-aware shrinkage giảm noise bằng cách tin các taps mạnh nhiều hơn taps yếu.</strong>
        </article>
      </div>

      <p className="channel-estimation-lab-note">
        Ví dụ này cố ý dùng pilot trên toàn bộ <MathExpr tex={String.raw`N=16`} /> subcarrier để tách bài toán estimator khỏi pilot interpolation.
        PDP-aware curve là minh họa LMMSE-style trong tap domain, không phải implementation LMMSE duy nhất và không phải thuật toán 3GPP bắt buộc.
      </p>
    </div>
  );
}
