import { useMemo, useState } from 'react';
import MathExpr from './MathExpr.jsx';

const sequence = [1, 1, 1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1];
const RX_LEN = 64;

function noise(n, salt = 0) {
  const x = Math.sin((n + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return 2 * (x - Math.floor(x)) - 1;
}

export default function CorrelationExplorer() {
  const [delay, setDelay] = useState(23);
  const [noiseLevel, setNoiseLevel] = useState(0.55);

  const { rx, corr, detected, peak } = useMemo(() => {
    const rxSamples = Array.from({ length: RX_LEN }, (_, n) => {
      const seqIndex = n - delay;
      const wanted = seqIndex >= 0 && seqIndex < sequence.length ? sequence[seqIndex] : 0;
      return wanted + noiseLevel * noise(n, 2);
    });

    const maxLag = RX_LEN - sequence.length;
    const correlation = Array.from({ length: maxLag + 1 }, (_, lag) => {
      let acc = 0;
      for (let n = 0; n < sequence.length; n += 1) {
        acc += rxSamples[lag + n] * sequence[n];
      }
      return acc / sequence.length;
    });

    let detectedLag = 0;
    let peakValue = -Infinity;
    correlation.forEach((value, lag) => {
      if (value > peakValue) {
        peakValue = value;
        detectedLag = lag;
      }
    });

    return { rx: rxSamples, corr: correlation, detected: detectedLag, peak: peakValue };
  }, [delay, noiseLevel]);

  const rxMax = Math.max(...rx.map((v) => Math.abs(v)), 1);
  const corrMax = Math.max(...corr.map((v) => Math.abs(v)), 1);

  return (
    <div className="correlation-lab">
      <div className="correlation-controls">
        <label>
          <span>Sequence bắt đầu tại <strong><MathExpr tex={`n=${delay}`} /></strong></span>
          <input type="range" min="4" max="45" step="1" value={delay}
            onChange={(e) => setDelay(Number(e.target.value))} />
        </label>
        <label>
          <span>Noise level <strong>{noiseLevel.toFixed(2)}</strong></span>
          <input type="range" min="0" max="1.4" step="0.05" value={noiseLevel}
            onChange={(e) => setNoiseLevel(Number(e.target.value))} />
        </label>
      </div>

      <div className="correlation-readout">
        <div><small>TRUE DELAY</small><strong>{delay}</strong><span>sample index</span></div>
        <div><small>DETECTED PEAK</small><strong>{detected}</strong><span>arg max correlation</span></div>
        <div><small>PEAK VALUE</small><strong>{peak.toFixed(2)}</strong><span>normalized by sequence length</span></div>
        <div className={detected === delay ? 'ok' : 'warning'}><small>RESULT</small><strong>{detected === delay ? 'Đúng vị trí' : 'False peak'}</strong><span>noise có thể che sequence</span></div>
      </div>

      <div className="correlation-panels">
        <div>
          <div className="visual-caption"><span>RECEIVED BUFFER</span><strong><MathExpr tex="r[n]" /></strong></div>
          <div className="stem-plot correlation-rx-plot" aria-label="Received samples containing a known sequence in noise">
            {rx.map((value, n) => (
              <i
                key={n}
                className={n >= delay && n < delay + sequence.length ? 'inside-sequence' : ''}
                style={{
                  height: `${Math.max(2, Math.abs(value) / rxMax * 47)}%`,
                  transform: value >= 0 ? 'translateY(-50%)' : 'translateY(50%)',
                }}
                title={`n=${n}, r=${value.toFixed(2)}`}
              />
            ))}
          </div>
          <p className="correlation-caption">Receiver chưa biết sequence bắt đầu ở sample nào.</p>
        </div>

        <div>
          <div className="visual-caption"><span>SLIDING CORRELATION</span><strong><MathExpr tex={`C[\ell]`} /></strong></div>
          <div className="correlation-bars" aria-label="Correlation value for every candidate lag">
            {corr.map((value, lag) => (
              <i
                key={lag}
                className={lag === detected ? 'peak' : ''}
                style={{ height: `${Math.max(2, Math.abs(value) / corrMax * 100)}%` }}
                title={`lag=${lag}, C=${value.toFixed(2)}`}
              />
            ))}
          </div>
          <p className="correlation-caption">Peak xuất hiện khi local sequence align với copy trong buffer.</p>
        </div>
      </div>
    </div>
  );
}
