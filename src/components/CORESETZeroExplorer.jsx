import { useMemo, useState } from 'react';
import MathExpr from './MathExpr.jsx';

/* 38.213 Rel-18 Table 13-1, only FR1 non-shared-spectrum,
 * SSB SCS = 15 kHz, PDCCH SCS = 15 kHz, pattern 1.
 * Other scenarios require different normative tables. */
const CORESET_TABLE = [
  [24,2,0],[24,2,2],[24,2,4],[24,3,0],
  [24,3,2],[24,3,4],[48,1,12],[48,1,16],
  [48,2,12],[48,2,16],[48,3,12],[48,3,16],
  [96,1,38],[96,2,38],[96,3,38],null
].map((entry, index) => entry ? {index,rb:entry[0],symbols:entry[1],offset:entry[2]} : null);

/* 38.213 Rel-18 Table 13-11, pattern 1 and FR1 */
const SEARCH_TABLE = [
  [0,1,1,0],[0,2,0.5,'parity'],[2,1,1,0],[2,2,0.5,'parity'],
  [5,1,1,0],[5,2,0.5,'parity'],[7,1,1,0],[7,2,0.5,'parity'],
  [0,1,2,0],[5,1,2,0],[0,1,1,1],[0,1,1,2],
  [2,1,1,1],[2,1,1,2],[5,1,1,1],[5,1,1,2]
].map(([O,num,M,first],index) => ({index,O,num,M,first}));

const binary = (v) => v.toString(2).padStart(4,'0');
const fmt = (v) => Number.isInteger(v) ? String(v) : String(v).replace('.',',');

export default function CORESETZeroExplorer() {
  const [ci,setCi] = useState(3);
  const [si,setSi] = useState(5);
  const [beam,setBeam] = useState(2);
  const [sfn,setSfn] = useState(683);

  const result = useMemo(() => {
    const core = CORESET_TABLE[ci];
    const search = SEARCH_TABLE[si];
    const mu = 0;
    const slotsPerFrame = 10;
    const score = search.O * (2 ** mu) + Math.floor(beam * search.M);
    const firstSlot = score % slotsPerFrame;
    const targetParity = Math.floor(score / slotsPerFrame) % 2;
    const frame = (sfn + Number(sfn % 2 !== targetParity)) % 1024;
    const secondSlot = (firstSlot + 1) % slotsPerFrame;
    const secondFrame = firstSlot === slotsPerFrame - 1 ? (frame + 1) % 1024 : frame;
    const firstSymbol = search.first === 'parity'
      ? (beam % 2 === 0 ? 0 : core?.symbols ?? 0) : search.first;
    return {core,search,mu,slotsPerFrame,score,firstSlot,targetParity,frame,secondSlot,secondFrame,firstSymbol};
  }, [ci,si,beam,sfn]);

  const left = result.core ? -result.core.offset : 0;
  const right = result.core ? Math.max(20, result.core.rb - result.core.offset) : 20;
  const lo = Math.min(left,0)-3, hi = Math.max(right,20)+3;
  const x = (k) => 50 + (k-lo) * 680 / (hi-lo);
  const ssbL = x(0), ssbR = x(20);
  const coreL = result.core ? x(-result.core.offset) : 0;
  const coreR = result.core ? x(result.core.rb-result.core.offset) : 0;
  const indicators = Array.from({length:10},(_,slot)=>slot);

  return <div className="cs0-lab">
    <div className="cs0-controls">
      <label><span>CORESET#0 table index <strong>{ci}</strong></span>
        <input type="range" min="0" max="15" step="1" value={ci} onChange={(e)=>setCi(Number(e.target.value))}/>
        <small>{binary(ci)} · Table 13-1</small></label>
      <label><span>SearchSpace#0 table index <strong>{si}</strong></span>
        <input type="range" min="0" max="15" step="1" value={si} onChange={(e)=>setSi(Number(e.target.value))}/>
        <small>{binary(si)} · Table 13-11</small></label>
      <label><span>Candidate SSB index <strong>{beam}</strong></span>
        <select value={beam} onChange={(e)=>setBeam(Number(e.target.value))}>
          {[0,1,2,3].map((b)=><option value={b} key={b}>{b}</option>)}
        </select><small>Ví dụ 4 candidate SSBs</small></label>
      <label><span>SFN đã biết khi bắt đầu tra cứu <strong>{sfn}</strong></span>
        <input type="range" min="680" max="687" value={sfn} onChange={(e)=>setSfn(Number(e.target.value))}/>
        <small>Tìm frame kế tiếp có SFN parity phù hợp</small></label>
    </div>

    <div className="cs0-metrics metric-card-grid">
      <div className="metric-card"><small className="metric-card-label">MIB CONFIG BYTE</small>
        <strong className="metric-card-value">0x{(16*ci+si).toString(16).padStart(2,'0').toUpperCase()}</strong>
        <span className="metric-card-formula">{binary(ci)} | {binary(si)}</span></div>
      <div className="metric-card"><small className="metric-card-label">CORESET RB × SYMBOL</small>
        <strong className="metric-card-value">{result.core ? result.core.rb+' × '+result.core.symbols : 'Reserved'}</strong>
        <span className="metric-card-formula">{result.core ? 'Offset '+result.core.offset+' RB' : 'Không dùng làm cấu hình hợp lệ'}</span></div>
      <div className="metric-card"><small className="metric-card-label">MONITORING SLOT</small>
        <strong className="metric-card-value">{result.firstSlot}</strong>
        <span className="metric-card-formula">SFN parity: {result.targetParity===0?'chẵn':'lẻ'}</span></div>
      <div className="metric-card"><small className="metric-card-label">SYMBOL START</small>
        <strong className="metric-card-value">{result.core ? result.firstSymbol : '—'}</strong>
        <span className="metric-card-formula">{result.search.num} search-space set(s)/slot</span></div>
    </div>

    {!result.core && <p className="cs0-reserved">
      <strong>CORESET table index 15 là reserved trong Table 13-1.</strong>
      UE không được tự suy ra một cấu hình CORESET hợp lệ cho case đã chọn. Thử đưa index về 0–14.
    </p>}

    <div className="cs0-frequency">
      <div className="visual-caption"><span>FREQUENCY · REFERENCE RB COORDINATES</span>
        <strong>CORESET#0 tương quan với first RB của SS/PBCH block</strong></div>
      <svg viewBox="0 0 780 170" role="img" aria-label="Vị trí tương đối của CORESET 0 và SSB theo RB">
        <line x1="42" x2="738" y1="142" y2="142" className="cs0-guide"/>
        <rect x={ssbL} y="28" width={ssbR-ssbL} height="48" className="cs0-ssb-band"/>
        <text x={(ssbL+ssbR)/2} y="54" className="cs0-band-text">SSB · 20 RB</text>
        {result.core && <>
          <rect x={coreL} y="88" width={coreR-coreL} height="40" className="cs0-core-band"/>
          <text x={(coreL+coreR)/2} y="112" className="cs0-band-text">CORESET#0 · {result.core.rb} RB</text>
        </>}
        <line x1={x(0)} x2={x(0)} y1="22" y2="146" className="cs0-anchor"/>
        <text x={x(0)+4} y="162" className="cs0-tick">SSB anchor RB = 0</text>
      </svg>
      <p>
        SSB được đặt tại 0–20 RB trên trục tham chiếu <strong>minh họa</strong>.
        CORESET start ở tọa độ tương đối bằng negative offset; bảng định nghĩa offset từ lowest RB của CORESET tới common RB chồng lên first RB của SSB.
        Trong receiver thật còn cần common-RB alignment và <MathExpr tex={String.raw`k_{\mathrm{SSB}}`} /> để ra absolute frequency location.
      </p>
    </div>

    <div className="cs0-timing">
      <div className="visual-caption"><span>TIME · TWO ASSOCIATED SLOTS</span>
        <strong>Frame phù hợp và monitoring occasions được tìm thế nào?</strong></div>
      <div className="cs0-time-meta">
        <span>Table 13-11 → <MathExpr tex={'O='+result.search.O}/></span>
        <span><MathExpr tex={'M='+result.search.M}/></span>
        <span><MathExpr tex={'\\hat i='+beam}/></span>
        <span><MathExpr tex={'n_0='+result.firstSlot}/></span>
      </div>
      <div className="cs0-slot-grid">
        {indicators.map((slot)=>{
          const isPrimary=slot===result.firstSlot;
          const isSecond=slot===result.secondSlot && result.secondFrame===result.frame;
          return <div key={slot} className={'cs0-slot '+(isPrimary?'primary':isSecond?'secondary':'')}>
            <small>slot {slot}</small><strong>{isPrimary?'n₀':isSecond?'n₀+1':'·'}</strong>
          </div>;
        })}
      </div>
      <div className="cs0-time-explanation">
        <strong>Frame {result.frame} (SFN {result.targetParity===0?'chẵn':'lẻ'})</strong>
        <span>First occasion: slot {result.firstSlot}; second: slot {result.secondSlot} {result.secondFrame!==result.frame?'ở frame '+result.secondFrame:'cùng frame'}.</span>
        <span>First OFDM symbol: {result.core ? result.firstSymbol : 'không hợp lệ nếu CORESET reserved'}. Cấu hình gồm {result.search.num} search-space set(s)/slot trong bảng này.</span>
      </div>
      {result.core && <div className="cs0-symbol-grid">
        {Array.from({length:14},(_,l)=>{
          const active=l>=result.firstSymbol && l<result.firstSymbol+result.core.symbols;
          return <div key={l} className={'cs0-symbol '+(active?'active':'')}><small>{l}</small></div>;
        })}
      </div>}
      <p>
        Đường slot ở trên biểu diễn frame đã đáp ứng SFN parity của candidate; không phải tất cả 10 slots đều là monitoring occasions.
        Những dịp giám sát thực sự nằm trong hai slots được tô, với first symbol tùy SearchSpace index và SSB index.
      </p>
    </div>
    <p className="cs0-lab-note">
      Lab áp dụng duy nhất case <MathExpr tex={String.raw`\{\mathrm{SSB},\mathrm{PDCCH}\}\ \mathrm{SCS}=\{15,15\}\,\mathrm{kHz}`} />, FR1,
      non-shared-spectrum, multiplexing pattern 1, và điều kiện Table 13-1. Tính toán từ TS 38.213 Rel-18 Tables 13-1/13-11;
      giả định SSB anchor RB = 0 chỉ là hệ tọa độ minh họa. Không áp dụng các kết quả này cho FR2, shared spectrum,
      min-channel-bandwidth 3 MHz case cần Table 13-0, hoặc multiplexing pattern 2/3.
    </p>
  </div>;
}
