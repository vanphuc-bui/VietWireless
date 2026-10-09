import { useMemo, useState } from 'react';
import MathExpr from './MathExpr.jsx';

const ROOT_TWO = Math.sqrt(2);
const SUBJECTS = Array.from({ length: 16 }, (_, i) => ({
  index: i,
  source: [i % 2, Math.floor(i / 2) % 2],
  mask: [Math.floor(i / 3) % 2, Math.floor((i + 2) / 5) % 2],
}));
const complex=(re,im)=>({re,im});
const add=(a,b)=>complex(a.re+b.re,a.im+b.im);
const mul=(a,b)=>complex(a.re*b.re-a.im*b.im,a.re*b.im+a.im*b.re);
const scale=(a,v)=>complex(a.re*v,a.im*v);
const rot=(theta)=>complex(Math.cos(theta),Math.sin(theta));
const divide=(a,b)=>complex(
  (a.re*b.re+a.im*b.im)/(b.re*b.re+b.im*b.im),
  (a.im*b.re-a.re*b.im)/(b.re*b.re+b.im*b.im),
);
const fixed=(v)=>v.toFixed(3);
const pair=(z)=>fixed(z.re)+(z.im<0?' − j':' + j')+fixed(Math.abs(z.im));
const bit=(projection)=>projection>=0?0:1;

function Scatter({title,description,values,selected}){
  const cx=(v)=>115+v*53,cy=(v)=>115-v*53;
  const grid=[-1.5,-1,-0.5,0,0.5,1,1.5];
  return <div className="pbch-plot">
    <strong>{title}</strong><p>{description}</p>
    <svg viewBox="0 0 230 230" role="img" aria-label={title}>
      {grid.map((v)=><g key={v}>
        <line x1={cx(v)} y1={13} x2={cx(v)} y2={217} className="pbch-grid-line"/>
        <line y1={cy(v)} x1={13} y2={cy(v)} x2={217} className="pbch-grid-line"/>
      </g>)}
      <line x1="13" x2="217" y1={cy(0)} y2={cy(0)} className="pbch-axis"/>
      <line x1={cx(0)} x2={cx(0)} y1="13" y2="217" className="pbch-axis"/>
      {[-1,1].flatMap((a)=>[-1,1].map((b)=>
        <circle key={a+':'+b} cx={cx(a/ROOT_TWO)} cy={cy(b/ROOT_TWO)} r="7" className="pbch-ideal-dot"/>))}
      {values.map((point,i)=><circle key={i} cx={cx(point.re)} cy={cy(point.im)}
        r={i===selected?6.5:3.2} className={'pbch-point '+(i===selected?'selected':'')}/>)}
      <text x="171" y="108" className="pbch-plot-axis-label">In-phase</text>
      <text x="120" y="18" className="pbch-plot-axis-label">Quadrature</text>
    </svg>
  </div>;
}

export default function PBCHDecodeExplorer(){
  const [gain,setGain]=useState(0.65);
  const [phase,setPhase]=useState(48);
  const [estimateError,setEstimateError]=useState(3);
  const [noise,setNoise]=useState(0.1);
  const [symbol,setSymbol]=useState(5);
  const [correctMask,setCorrectMask]=useState(true);

  const data=useMemo(()=>{
    const h=scale(rot(phase*Math.PI/180),gain);
    const hEstimate=scale(rot((phase+estimateError)*Math.PI/180),gain);
    const points=SUBJECTS.map((item)=>{
      const txBits=item.source.map((b,j)=>b^item.mask[j]);
      const tx=complex((1-2*txBits[0])/ROOT_TWO,(1-2*txBits[1])/ROOT_TWO);
      const w=scale(add(rot(0.91*(item.index+1)+0.2),scale(rot(1.73*(item.index+1)+0.77),0.38)),noise/1.38);
      const rx=add(mul(h,tx),w);
      const eq=divide(rx,hEstimate);
      const rawSoft=[eq.re,eq.im];
      const maskGuess=correctMask?item.mask:[item.mask[0]^1,item.mask[1]];
      const sourceSoft=rawSoft.map((v,j)=>maskGuess[j]===0?v:-v);
      const sourceHard=sourceSoft.map(bit);
      return {...item,txBits,tx,rx,eq,rawSoft,maskGuess,sourceSoft,sourceHard};
    });
    const errorCount=points.reduce((total,p)=>total+p.sourceHard.filter((b,j)=>b!==p.source[j]).length,0);
    return {h,hEstimate,points,errorCount};
  },[gain,phase,estimateError,noise,correctMask]);

  const point=data.points[symbol];
  return <div className="pbch-decode-lab">
    <div className="pbch-decode-controls">
      <label><span>Channel gain <strong>{gain.toFixed(2)}</strong></span>
        <input type="range" min="0.3" max="1.2" step="0.05" value={gain} onChange={(e)=>setGain(Number(e.target.value))}/></label>
      <label><span>Channel phase <strong>{phase}°</strong></span>
        <input type="range" min="-90" max="90" step="3" value={phase} onChange={(e)=>setPhase(Number(e.target.value))}/></label>
      <label><span>Channel-estimate phase error <strong>{estimateError}°</strong></span>
        <input type="range" min="-65" max="65" step="1" value={estimateError} onChange={(e)=>setEstimateError(Number(e.target.value))}/></label>
      <label><span>Noise amplitude <strong>{noise.toFixed(2)}</strong></span>
        <input type="range" min="0" max="0.7" step="0.02" value={noise} onChange={(e)=>setNoise(Number(e.target.value))}/></label>
      <label><span>QPSK symbol minh họa <strong>#{symbol}</strong></span>
        <select value={symbol} onChange={(e)=>setSymbol(Number(e.target.value))}>
          {SUBJECTS.map((item)=><option key={item.index} value={item.index}>Symbol {item.index}</option>)}
        </select></label>
      <label><span>Descrambling hypothesis</span>
        <select value={correctMask?'correct':'wrong'} onChange={(e)=>setCorrectMask(e.target.value==='correct')}>
          <option value="correct">Đúng mask (minh họa)</option>
          <option value="wrong">Sai bit đầu của mask</option>
        </select></label>
    </div>

    <div className="pbch-decode-metrics metric-card-grid">
      <div className="metric-card"><small className="metric-card-label">CHANNEL THẬT</small>
        <strong className="metric-card-value">{pair(data.h)}</strong>
        <span className="metric-card-formula">complex gain</span></div>
      <div className="metric-card"><small className="metric-card-label">CHANNEL ESTIMATE</small>
        <strong className="metric-card-value">{pair(data.hEstimate)}</strong>
        <span className="metric-card-formula">phase estimate lệch theo slider</span></div>
      <div className="metric-card"><small className="metric-card-label">HARD-BIT ERRORS</small>
        <strong className="metric-card-value">{data.errorCount} / 32</strong>
        <span className="metric-card-formula">trên 16 symbols mô phỏng</span></div>
    </div>

    <div className="pbch-plots">
      <Scatter title="Trước khi phát" description="Các QPSK points sau physical scrambling" values={data.points.map((p)=>p.tx)} selected={symbol}/>
      <Scatter title="Sau channel" description="Biên độ, pha và noise làm constellation lệch" values={data.points.map((p)=>p.rx)} selected={symbol}/>
      <Scatter title="Sau equalization" description="Dùng estimated channel để kéo các points về" values={data.points.map((p)=>p.eq)} selected={symbol}/>
    </div>

    <div className="pbch-one-re">
      <div><small>PHÁT</small><strong><MathExpr tex={String.raw`X`}/></strong><span>{pair(point.tx)}</span></div>
      <b>→</b>
      <div><small>NHẬN</small><strong><MathExpr tex={String.raw`Y=HX+W`}/></strong><span>{pair(point.rx)}</span></div>
      <b>→</b>
      <div><small>EQUALIZE</small><strong><MathExpr tex={String.raw`\widehat X=Y/\widehat H`}/></strong><span>{pair(point.eq)}</span></div>
    </div>

    <div className="pbch-soft-demo">
      <div className="visual-caption"><span>SOFT DEMAPPING / DESCRAMBLING</span>
        <strong>Quan sát thông tin soft cho một QPSK symbol</strong></div>
      <div className="pbch-soft-grid">
        {['I bit','Q bit'].map((label,j)=>{
          const soft=point.rawSoft[j],result=point.sourceSoft[j];
          return <div key={label}>
            <small>{label}</small>
            <strong>Soft QPSK = {fixed(soft)}</strong>
            <span>Scrambling mask giả định: {point.maskGuess[j]}</span>
            <span>Soft sau descrambling: {fixed(result)}</span>
            <span>Hard bit: {point.sourceHard[j]} · bit gốc: {point.source[j]}</span>
          </div>;
        })}
      </div>
      <p>Dấu dương ưu tiên bit 0; dấu âm ưu tiên bit 1 theo QPSK mapping giả định. Giá trị ở đây là <strong>soft projection</strong>, chưa phải LLR được hiệu chỉnh theo noise variance. Với scrambling bit bằng 1, receiver đảo dấu soft metric thay vì chỉ đảo một hard bit.</p>
    </div>

    <p className="pbch-lab-note">
      Lab minh họa <strong>16 QPSK symbols và 32 bits</strong> để nhìn geometry; không giả lập đủ 432 PBCH RE, Gold scrambling sequence, rate recovery, Polar decoder hay CRC.
      Noise được tạo có tính xác định để dễ so sánh khi thay một slider. “HARD-BIT ERRORS” chỉ là lỗi hard decision ở lab, <strong>không phải CRC và không phải tỷ lệ lỗi PBCH thực tế</strong>.
    </p>
  </div>;
}
