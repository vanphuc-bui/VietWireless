import { useMemo, useState } from 'react';
import MathExpr from './MathExpr.jsx';

const NSC=240, SQRT2=Math.sqrt(2);
const plus=(a,b)=>({re:a.re+b.re,im:a.im+b.im});
const times=(a,b)=>({re:a.re*b.re-a.im*b.im,im:a.re*b.im+a.im*b.re});
const sc=(a,v)=>({re:a.re*v,im:a.im*v});
const conj=(a)=>({re:a.re,im:-a.im});
const ph=(theta)=>({re:Math.cos(theta),im:Math.sin(theta)});
const mag=(a)=>Math.hypot(a.re,a.im);
const range=(k,a,b)=>Math.max(a,Math.min(b,k))===k;
const err=(a,b)=>(a.re-b.re)**2+(a.im-b.im)**2;

function typeAt(l,k,v){
  if(l===2){
    if(range(k,56,182)) return 'sss';
    if(range(k,48,55)||range(k,183,191)) return 'zero';
  }
  return k%4===v?'dmrs':'pbch';
}
function seedOf(pci,iBar){
  return 2048*(iBar+1)*(Math.floor(pci/4)+1)+64*(iBar+1)+pci%4;
}
function goldQpsk(seed){
  const count=1600+288+31;
  const x1=Array(count).fill(0),x2=Array(count).fill(0);
  x1[0]=1;
  Array.from({length:31},(_,i)=>i).forEach((i)=>{x2[i]=(seed>>>i)&1;});
  Array.from({length:1600+288},(_,i)=>i).forEach((i)=>{
    x1[i+31]=x1[i+3]^x1[i];
    x2[i+31]=x2[i+3]^x2[i+2]^x2[i+1]^x2[i];
  });
  const bit=(i)=>x1[i+1600]^x2[i+1600];
  return Array.from({length:144},(_,m)=>({
    re:(1-2*bit(2*m))/SQRT2,
    im:(1-2*bit(2*m+1))/SQRT2
  }));
}
function channel(k,l,echo){
  return plus(sc(ph(0.3+0.04*(l-1)),0.8),sc(ph(1.1-2*Math.PI*8*k/NSC),echo));
}
function noiseAt(k,l,a){
  return sc(plus(ph(0.73*k+0.4*l),sc(ph(1.37*k+0.89*l),0.3)),a/1.3);
}
function interp(pilots,k){
  const lower=[...pilots].reverse().find((p)=>p.k<=k);
  const upper=pilots.find((p)=>p.k>=k);
  if(!lower&&!upper)return null;
  if(!lower)return upper.ls;
  if(!upper)return lower.ls;
  if(lower.k===upper.k)return lower.ls;
  const t=(k-lower.k)/(upper.k-lower.k);
  return plus(sc(lower.ls,1-t),sc(upper.ls,t));
}
function fmt(z){return z.re.toFixed(3)+(z.im<0?' − j':' + j')+Math.abs(z.im).toFixed(3);}

export default function PBCHDMRSExplorer(){
  const [pci,setPci]=useState(370);
  const [ssb,setSsb]=useState(2);
  const [half,setHalf]=useState(0);
  const [sym,setSym]=useState(1);
  const [noise,setNoise]=useState(0.12);
  const [echo,setEcho]=useState(0.28);

  const model=useMemo(()=>{
    const v=pci%4,iBar=ssb+4*half,seed=seedOf(pci,iBar);
    const positions=[1,2,3].flatMap((l)=>
      Array.from({length:NSC},(_,k)=>({k,l})).filter(({k})=>typeAt(l,k,v)==='dmrs'));
    const sequence=goldQpsk(seed);
    const pilots=positions.map((pos,i)=>{
      const h=channel(pos.k,pos.l,echo),x=sequence[i];
      const y=plus(times(h,x),noiseAt(pos.k,pos.l,noise));
      return {...pos,x,y,h,ls:times(y,conj(x))};
    });
    const pilotMap=new Map(pilots.map((p)=>[p.l+':'+p.k,p]));
    const selected=pilotMap.get(sym+':'+(28+v));
    const regionPilots=(k)=>pilots.filter((p)=>p.l===sym &&
      (sym!==2||(range(p.k,0,47)===range(k,0,47))));
    const response=Array.from({length:NSC},(_,k)=>{
      const type=typeAt(sym,k,v),h=channel(k,sym,echo);
      const estimated=type==='sss'||type==='zero'?null:interp(regionPilots(k),k);
      return {k,type,h,estimated,pilot:pilotMap.get(sym+':'+k)};
    });
    const activePilots=pilots.filter((p)=>p.l===sym);
    const data=response.filter((p)=>p.type==='pbch');
    const pilotMse=activePilots.reduce((s,p)=>s+err(p.ls,p.h),0)/activePilots.length;
    const dataMse=data.reduce((s,p)=>s+err(p.estimated,p.h),0)/data.length;
    return {v,iBar,seed,selected,response,pilotMse,dataMse};
  },[pci,ssb,half,sym,noise,echo]);

  const W=710,H=242,left=40,right=16,top=12,bottom=36;
  const x=(k)=>left+(W-left-right)*k/239;
  const y=(a)=>top+(1.75-Math.min(1.75,a))*(H-top-bottom)/1.75;
  const paths=(field)=>{
    const groups=[];let group=[];
    model.response.forEach((p)=>{
      if(!p[field]){if(group.length)groups.push(group);group=[];return;}
      group.push(x(p.k)+','+y(mag(p[field])));
    });
    if(group.length)groups.push(group);
    return groups.map((g)=>g.join(' '));
  };
  return <div className="pbchdmrs-lab">
    <div className="pbchdmrs-controls">
      <label><span>Physical Cell ID <strong>{pci}</strong></span>
        <input type="range" min="368" max="375" step="1" value={pci} onChange={(e)=>setPci(Number(e.target.value))}/>
        <small>Thay PCI để dịch comb và thay QPSK reference.</small></label>
      <label><span>SSB candidate index <strong>{ssb}</strong></span>
        <select value={ssb} onChange={(e)=>setSsb(Number(e.target.value))}>
          {[0,1,2,3].map((n)=><option value={n} key={n}>{n}</option>)}
        </select><small>Minh họa trường hợp 4 SSB candidates.</small></label>
      <label><span>Half-frame <strong>{half}</strong></span>
        <select value={half} onChange={(e)=>setHalf(Number(e.target.value))}>
          <option value="0">0 · nửa đầu</option><option value="1">1 · nửa sau</option>
        </select><small>Thay seed, không thay vị trí pilot.</small></label>
      <label><span>Noise <strong>{noise.toFixed(2)}</strong></span>
        <input type="range" min="0" max="0.45" step="0.01" value={noise} onChange={(e)=>setNoise(Number(e.target.value))}/></label>
      <label><span>Độ mạnh echo <strong>{echo.toFixed(2)}</strong></span>
        <input type="range" min="0" max="0.6" step="0.02" value={echo} onChange={(e)=>setEcho(Number(e.target.value))}/></label>
    </div>

    <div className="pbchdmrs-metrics metric-card-grid">
      <div className="metric-card"><small className="metric-card-label">COMB OFFSET</small>
        <strong className="metric-card-value"><MathExpr tex={'v='+model.v}/></strong><span className="metric-card-formula">PCI mod 4</span></div>
      <div className="metric-card"><small className="metric-card-label">QPSK SEED</small>
        <strong className="metric-card-value">{model.seed}</strong><span className="metric-card-formula"><MathExpr tex={'\\bar i_{\\mathrm{SSB}}='+model.iBar}/></span></div>
      <div className="metric-card"><small className="metric-card-label">PILOT LS MSE</small>
        <strong className="metric-card-value">{model.pilotMse.toFixed(4)}</strong><span className="metric-card-formula">tại symbol đang chọn</span></div>
      <div className="metric-card"><small className="metric-card-label">PBCH ESTIMATION MSE</small>
        <strong className="metric-card-value">{model.dataMse.toFixed(4)}</strong><span className="metric-card-formula">sau interpolation</span></div>
    </div>

    <div className="pbchdmrs-grid-figure">
      <div className="visual-caption"><span>RELATIVE SUBCARRIERS 0 TỚI 239</span>
        <strong>Click symbol để xem pilot layout và channel estimate</strong></div>
      {[1,2,3].map((l)=>
        <button key={l} type="button" className={'pbchdmrs-strip-row '+(sym===l?'selected':'')}
          onClick={()=>setSym(l)} aria-label={'Xem symbol '+l}>
          <span>Symbol {l}</span><span className="pbchdmrs-strip">
            {Array.from({length:NSC},(_,k)=><i key={k} className={typeAt(l,k,model.v)} title={'k='+k+' · '+typeAt(l,k,model.v)}/>)}
          </span><span>{l===2?24:60} DM-RS</span>
        </button>)}
      <div className="pbchdmrs-legend">
        <span><i className="dmrs"></i>DM-RS</span>
        <span><i className="pbch"></i>PBCH</span>
        <span><i className="sss"></i>SSS</span>
        <span><i className="zero"></i>Zero RE</span>
      </div>
    </div>

    <div className="pbchdmrs-sample">
      <div><small>KNOWN PILOT · k={28+model.v}</small>
        <strong><MathExpr tex={String.raw`X_{\mathrm{DMRS}}`}/></strong><span>{fmt(model.selected.x)}</span></div>
      <b>→ channel + noise →</b>
      <div><small>OBSERVED</small><strong><MathExpr tex={String.raw`Y_{\mathrm{DMRS}}`}/></strong>
        <span>{fmt(model.selected.y)}</span></div>
      <b>÷ known pilot →</b>
      <div><small>LS ESTIMATE</small><strong><MathExpr tex={String.raw`\widehat H_{\mathrm{LS}}`}/></strong>
        <span>{fmt(model.selected.ls)}</span></div>
    </div>

    <div className="pbchdmrs-response">
      <div className="visual-caption"><span>SYMBOL {sym} · LS + LINEAR INTERPOLATION</span>
        <strong>Magnitude của channel thật và estimate</strong></div>
      <svg viewBox="0 0 710 242" role="img" aria-label="Channel magnitude theo subcarrier và LS interpolation">
        {[0,0.5,1,1.5].map((v)=><g key={v}>
          <line className="pbchdmrs-guide" x1={left} x2={W-right} y1={y(v)} y2={y(v)}/>
          <text className="pbchdmrs-tick" x="4" y={y(v)+4}>{v.toFixed(1)}</text></g>)}
        {[0,40,80,120,160,200,239].map((k)=><text className="pbchdmrs-tick" key={k} x={x(k)-7} y={H-9}>{k}</text>)}
        {paths('h').map((str,i)=><polyline key={'t'+i} className="pbchdmrs-true-line" points={str}/>)}
        {paths('estimated').map((str,i)=><polyline key={'e'+i} className="pbchdmrs-est-line" points={str}/>)}
        {model.response.filter((p)=>p.pilot).map((p)=>
          <circle key={p.k} cx={x(p.k)} cy={y(mag(p.pilot.ls))} r="2.4" className="pbchdmrs-pilot-dot"/>)}
      </svg>
      <div className="pbchdmrs-legend">
        <span><i className="true"></i>Channel thật</span>
        <span><i className="estimated"></i>Nội suy LS</span>
        <span><i className="pilot"></i>LS tại pilot</span>
      </div>
      <p>Echo làm đáp ứng channel gợn nhanh hơn; noise làm các LS pilot estimates sai lệch. Ở symbol 2, estimator không nối qua khoảng SSS không có PBCH.</p>
    </div>
    <p className="pbchdmrs-footnote">
      Chuỗi QPSK tính theo Gold sequence của TS 38.211 cho tình huống bốn SSB candidates và hai half-frames.
      Mô hình channel hai đường, noise xác định, phép chia LS và linear interpolation chỉ là <strong>minh họa receiver</strong>, không phải thuật toán 3GPP bắt buộc. Biểu đồ giả định SSB không bị puncture.
    </p>
  </div>;
}
