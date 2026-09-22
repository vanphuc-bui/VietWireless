import { useMemo, useState } from 'react';

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
      const a = 2 * Math.PI * k * n / N;
      re += X[k].re * Math.cos(a) - X[k].im * Math.sin(a);
      im += X[k].re * Math.sin(a) + X[k].im * Math.cos(a);
    }
    return { re: re / N, im: im / N };
  });
}

function dft(x) {
  return Array.from({ length: N }, (_, k) => {
    let re = 0;
    let im = 0;
    for (let n = 0; n < N; n += 1) {
      const a = -2 * Math.PI * k * n / N;
      re += x[n].re * Math.cos(a) - x[n].im * Math.sin(a);
      im += x[n].re * Math.sin(a) + x[n].im * Math.cos(a);
    }
    return { re, im };
  });
}

export default function IFFTFFTExplorer() {
  const [bins, setBins] = useState([0, 1, -1, 2, 0, 3, -1, 0]);

  const X = bins.map((idx) => idx < 0 ? { re: 0, im: 0 } : qpsk[idx]);
  const x = useMemo(() => idft(X), [bins]);
  const Y = useMemo(() => dft(x), [x]);
  const maxTime = Math.max(...x.flatMap(v => [Math.abs(v.re), Math.abs(v.im)]), 0.001);

  function cycleBin(k) {
    setBins((current) => current.map((value, idx) => idx === k ? (value + 2) % 5 - 1 : value));
  }

  return (
    <div className="ifft-fft-lab">
      <div className="ifft-bin-editor">
        <div className="visual-caption"><span>FREQUENCY DOMAIN</span><strong>click mỗi X[k] để đổi OFF/QPSK</strong></div>
        <div className="ifft-bin-row">
          {bins.map((idx, k) => (
            <button key={k} className={idx >= 0 ? 'active' : ''} onClick={() => cycleBin(k)}>
              <small>k={k}</small>
              <strong>{idx < 0 ? 'OFF' : qpsk[idx].name}</strong>
              <span>{idx < 0 ? '0' : `${qpsk[idx].re.toFixed(2)} ${qpsk[idx].im >= 0 ? '+' : '-'} j${Math.abs(qpsk[idx].im).toFixed(2)}`}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="ifft-transform-arrow">
        <strong>IFFT / IDFT</strong>
        <span>X[k] → x[n]</span>
        <b>↓</b>
      </div>

      <div className="ifft-time-panel">
        <div className="visual-caption"><span>TIME DOMAIN</span><strong>N = {N} complex samples</strong></div>
        <div className="ifft-sample-grid">
          {x.map((v, n) => (
            <div key={n}>
              <small>n={n}</small>
              <i className="real" style={{ height: `${Math.abs(v.re) / maxTime * 46}%`, transform: v.re >= 0 ? 'translateY(-50%)' : 'translateY(50%)' }}></i>
              <i className="imag" style={{ height: `${Math.abs(v.im) / maxTime * 46}%`, transform: v.im >= 0 ? 'translateY(-50%)' : 'translateY(50%)' }}></i>
              <span>{v.re.toFixed(2)} {v.im >= 0 ? '+' : '-'} j{Math.abs(v.im).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ifft-transform-arrow return">
        <b>↓</b>
        <strong>FFT / DFT</strong>
        <span>x[n] → Y[k]</span>
      </div>

      <div className="ifft-recovered">
        {Y.map((v, k) => {
          const err = Math.hypot(v.re - X[k].re, v.im - X[k].im);
          return (
            <div key={k}>
              <small>k={k}</small>
              <strong>|Y|={Math.hypot(v.re, v.im).toFixed(2)}</strong>
              <span>error {err.toExponential(1)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
