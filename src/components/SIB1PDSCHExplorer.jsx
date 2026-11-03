import { useMemo, useState } from 'react';
import MathExpr from './MathExpr.jsx';

// Educational, explicitly scoped scenario:
// FR1 15 kHz PDCCH/PDSCH, Type0 CSS, DCI 1_0 with SI-RNTI,
// PDSCH Type B, slot 6 symbols 9..12, one DM-RS symbol (9),
// DM-RS configuration type 1, port 1000, 2 CDM groups without data,
// 1 layer, xOverhead=0, non-interleaved VRB mapping.
const N_BWP = 24;
const PDSCH_START = 9;
const PDSCH_SYMBOLS = 4;
const MCS_R = [120, 157, 193, 251, 308, 379, 449, 526, 602, 679];
const TBS_TABLE = [
  24,32,40,48,56,64,72,80,88,96,104,112,120,128,136,144,
  152,160,168,176,184,192,208,224,240,256,272,288,304,320,
  336,352,368,384,408,432,456,480,504,528,552,576,608,640,
  672,704,736,768,808,848,888,928,984,1032,1064,1128,1160,
  1192,1224,1256,1288
];
const SQRT_2 = Math.sqrt(2);
const nominalRe = 12 * PDSCH_SYMBOLS;
const reservedRe = 12;
const dataRePerPrb = nominalRe - reservedRe;
const add = (a, b) => ({re:a.re+b.re,im:a.im+b.im});
const mul = (a,b) => ({re:a.re*b.re-a.im*b.im,im:a.re*b.im+a.im*b.re});
const polar = (amp,angle) => ({re:amp*Math.cos(angle),im:amp*Math.sin(angle)});
const div = (a,b) => ({re:(a.re*b.re+a.im*b.im)/(b.re*b.re+b.im*b.im),
  im:(a.im*b.re-a.re*b.im)/(b.re*b.re+b.im*b.im)});

function tbsOf(nPrb,mcs) {
  const N_RE = nPrb * dataRePerPrb;
  const R = MCS_R[mcs]/1024;
  const N_info = N_RE * R * 2;
  const n = Math.max(3,Math.floor(Math.log2(N_info))-6);
  const N_infoPrime = Math.max(24,(2**n)*Math.floor(N_info/(2**n)));
  const TBS = TBS_TABLE.find((x)=>x>=N_infoPrime) ?? TBS_TABLE[TBS_TABLE.length-1];
  return {N_RE,R,N_info,n,N_infoPrime,TBS,transportCrc:TBS<=3824?16:24};
}

function reKind(relativeSymbol, k){
  if(relativeSymbol===0) return k%2===0?'pilot':'reserved';
  return 'data';
}

function qpskPoint(i) {
  const b0=((i*7+3)%11)>4?1:0;
  const b1=((i*5+1)%13)>5?1:0;
  return {re:(1-2*b0)/SQRT_2,im:(1-2*b1)/SQRT_2,b0,b1};
}
function rounded(x){return x.toFixed(3);}

export default function SIB1PDSCHExplorer(){
  const [rbStart,setRbStart]=useState(4);
  const [nPrb,setNPrb]=useState(8);
  const [mcs,setMcs]=useState(4);
  const [noise,setNoise]=useState(0.12);
  const [phaseError,setPhaseError]=useState(3);
  const [focus,setFocus]=useState('all');
  const [selectedSymbol,setSelectedSymbol]=useState(5);

  const sizes=useMemo(()=>tbsOf(nPrb,mcs),[nPrb,mcs]);
  const dataRE=nPrb*36,dmrsRE=nPrb*6,noDataRE=nPrb*6,totalRE=nPrb*48;
  const codedBits=2*dataRE;
  const effectiveCodeRate=(sizes.TBS+sizes.transportCrc)/codedBits;
  const points=useMemo(()=>{
    const H=polar(0.73,Math.PI/3);
    const Hhat=polar(0.73,Math.PI/3+phaseError*Math.PI/180);
    return Array.from({length:16},(_,i)=>{
      const x=qpskPoint(i);
      const W=add(polar(noise,0.83*i+0.3),polar(0.30*noise,1.57*i+0.8));
      const y=add(mul(H,x),W);
      const eq=div(y,Hhat);
      return {...x,y,eq,hard0:eq.re<0?1:0,hard1:eq.im<0?1:0};
    });
  },[noise,phaseError]);
  const badBits=points.reduce((sum,p)=>sum+Number(p.hard0!==p.b0)+Number(p.hard1!==p.b1),0);
  const curr=points[selectedSymbol];
  const focusCls=(kind)=>focus==='all'||focus===kind?'':' faded';
  function changeNPrb(v){
    const next=Number(v);
    setNPrb(next);
    setRbStart((old)=>Math.min(old,N_BWP-next));
  }
  return <div className="sib1rx-lab">
    <div className="sib1rx-controls">
      <label><span>Starting PRB <strong>{rbStart}</strong></span>
        <input type="range" min="0" max={N_BWP-nPrb} value={rbStart}
          onChange={(e)=>setRbStart(Number(e.target.value))}/>
        <small>Lowest RB reference = CORESET#0 trong ví dụ.</small>
      </label>
      <label><span>Scheduled PRBs <strong>{nPrb}</strong></span>
        <input type="range" min="1" max={N_BWP} step="1" value={nPrb}
          onChange={(e)=>changeNPrb(e.target.value)}/>
        <small>Giữ cố định 4 OFDM symbols và một DM-RS symbol.</small>
      </label>
      <label><span>MCS index <strong>{mcs}</strong></span>
        <input type="range" min="0" max="9" step="1" value={mcs}
          onChange={(e)=>setMcs(Number(e.target.value))}/>
        <small>QPSK · MCS Table 5.1.3.1-1.</small>
      </label>
      <label><span>Hiển thị RE</span>
        <select value={focus} onChange={(e)=>setFocus(e.target.value)}>
          <option value="all">Toàn bộ resource grid</option>
          <option value="pilot">Chỉ nhấn mạnh pilot</option>
          <option value="reserved">Chỉ nhấn mạnh reserved</option>
          <option value="data">Chỉ nhấn mạnh data</option>
        </select>
        <small>Màu sắc kèm nhãn để phân biệt RE roles.</small>
      </label>
      <label><span>Noise trong constellation demo <strong>{noise.toFixed(2)}</strong></span>
        <input type="range" min="0" max="0.52" step="0.02" value={noise}
          onChange={(e)=>setNoise(Number(e.target.value))}/>
      </label>
      <label><span>Phase error của channel estimate <strong>{phaseError}°</strong></span>
        <input type="range" min="-50" max="50" step="2" value={phaseError}
          onChange={(e)=>setPhaseError(Number(e.target.value))}/>
      </label>
    </div>

    <div className="sib1rx-metrics metric-card-grid">
      <div className="metric-card"><small className="metric-card-label">ALLOCATED RE</small>
        <strong className="metric-card-value">{totalRE}</strong>
        <span className="metric-card-formula">{nPrb} PRB × 4 × 12</span></div>
      <div className="metric-card"><small className="metric-card-label">PILOT / RESERVED</small>
        <strong className="metric-card-value">{dmrsRE} / {noDataRE}</strong>
        <span className="metric-card-formula">6+6 RE / PRB ở symbol 9</span></div>
      <div className="metric-card"><small className="metric-card-label">PDSCH DATA RE</small>
        <strong className="metric-card-value">{dataRE}</strong>
        <span className="metric-card-formula">{codedBits} coded QPSK bits</span></div>
      <div className="metric-card"><small className="metric-card-label">TRANSPORT BLOCK SIZE</small>
        <strong className="metric-card-value">{sizes.TBS} bit</strong>
        <span className="metric-card-formula">CRC-{sizes.transportCrc} · BG2</span></div>
    </div>

    <div className="sib1rx-region">
      <div className="visual-caption"><span>PHY RESOURCE VIEW · SLOT 6</span>
        <strong>24 RB theo frequency × 14 OFDM symbols theo time</strong></div>
      <div className="sib1rx-overview-grid">
        {Array.from({length:14*N_BWP},(_,i)=>{
          const l=Math.floor(i/N_BWP),r=i%N_BWP;
          const included=r>=rbStart&&r<rbStart+nPrb&&l>=PDSCH_START&&l<PDSCH_START+PDSCH_SYMBOLS;
          const type=included?(l===PDSCH_START?'pilot':'data'):(l<3?'coreset':'unused');
          return <i className={'sib1rx-ov-cell '+type+focusCls(type)} key={i}
            title={'RB '+r+' · symbol '+l+' · '+(type==='pilot'?'symbol có DM-RS + reserved RE':type)}/>;
        })}
      </div>
      <div className="sib1rx-legend">
        <span><i className="coreset"></i>CORESET footprint</span>
        <span><i className="pilot"></i>DM-RS symbol</span>
        <span><i className="data"></i>PDSCH data</span>
        <span><i className="reserved"></i>No-data RE (zoom bên dưới)</span>
      </div>
      <p>Trong hình tổng quan, toàn bộ symbol 9 ở PRB được cấp được đánh dấu là DM-RS symbol. Hình phóng to bên dưới tách chính xác sáu RE có pilot và sáu RE cùng symbol nhưng không có PDSCH data.</p>
    </div>

    <div className="sib1rx-prb">
      <div className="visual-caption"><span>ZOOM · ONE PRB</span>
        <strong>Một PRB trong bốn OFDM symbols được cấp</strong></div>
      <div className="sib1rx-prb-grid">
        {[0,1,2,3].map((l)=><div className="sib1rx-prb-line" key={l}>
          <strong className="sib1rx-prb-label"><MathExpr tex={'\\ell='+String(PDSCH_START+l)}/></strong>
          <span className="sib1rx-prb-cells">{Array.from({length:12},(_,k)=>{
            const kind=reKind(l,k);
            return <i key={k} title={'k='+k+' · '+kind}
              className={kind+focusCls(kind)}>{k}</i>;
          })}</span>
        </div>)}
      </div>
      <div className="sib1rx-legend">
        <span><i className="pilot"></i>Pilot: 6 RE</span>
        <span><i className="reserved"></i>Reserved CDM group: 6 RE</span>
        <span><i className="data"></i>Data: 36 RE</span>
      </div>
      <p>Trong Type-B allocation dài bốn symbols, port 1000 dùng comb-2 ở các subcarriers 0, 2, 4, 6, 8, 10. Với DCI 1_0 và length 4, 3GPP giả định hai DM-RS CDM groups without data. Vì vậy toàn bộ 12 RE ở symbol 9 không mang PDSCH data, dù chỉ sáu RE thực sự mang pilot của port 1000.</p>
    </div>

    <div className="sib1rx-tbs">
      <div className="visual-caption"><span>FROM RESOURCE COUNT TO TBS</span>
        <strong>Các bước tính theo TS 38.214 · 5.1.3.2</strong></div>
      <div className="sib1rx-tbs-pipeline">
        <div><small>DATA RE / PRB</small><strong>36</strong><span>48 − 12</span></div>
        <b>→</b>
        <div><small>TOTAL DATA RE</small><strong>{sizes.N_RE}</strong><span>36 × {nPrb}</span></div>
        <b>→</b>
        <div><small>INTERMEDIATE</small><strong>{sizes.N_info.toFixed(2)}</strong><span>RE × 2 × R × 1</span></div>
        <b>→</b>
        <div><small>QUANTIZED</small><strong>{sizes.N_infoPrime}</strong><span>step 3, 3GPP</span></div>
        <b>→</b>
        <div><small>TBS</small><strong>{sizes.TBS}</strong><span>bits của transport block</span></div>
      </div>
      <div className="sib1rx-code-facts">
        <span><strong>Target code rate:</strong> {MCS_R[mcs]}/1024 = {sizes.R.toFixed(4)}</span>
        <span><strong>CRC attachment:</strong> +{sizes.transportCrc} bits</span>
        <span><strong>LDPC:</strong> base graph 2 trong phạm vi lab</span>
        <span><strong>Soft/codeword length:</strong> {codedBits} coded bits</span>
        <span><strong>Payload + CRC / coded bits:</strong> {(100*effectiveCodeRate).toFixed(1)}%</span>
      </div>
      <p>
        <MathExpr tex={String.raw`N'_{\mathrm{RE}}=12\cdot4-12-0=36`}/>{' '}
        và <MathExpr tex={String.raw`N_{\mathrm{info}}=N_{\mathrm{RE}}\cdot R\cdot Q_m\cdot\nu`}/>.
        Quantization dùng phép làm tròn xuống theo chuẩn rồi tra bảng TBS, không lấy trực tiếp giá trị intermediate làm payload size.
      </p>
    </div>

    <div className="sib1rx-constellation">
      <div className="visual-caption"><span>RECEIVER DEMODULATION · MINI DEMO</span>
        <strong>Một phần của 288 QPSK symbols, trước và sau channel equalization</strong></div>
      <div className="sib1rx-constellation-controls">
        <label><span>Chọn QPSK symbol demo</span>
          <select value={selectedSymbol} onChange={(e)=>setSelectedSymbol(Number(e.target.value))}>
            {points.map((_,i)=><option key={i} value={i}>Symbol {i}</option>)}
          </select>
        </label>
        <div><small>Hard-bit mismatches</small><strong>{badBits} / 32</strong></div>
      </div>
      <div className="sib1rx-plot-pair">
        {[
          ['Received samples',points.map(p=>p.y)],
          ['After equalization',points.map(p=>p.eq)]
        ].map(([label,pts])=>{
          const axis=(v)=>118+v*62;
          const yAxis=(v)=>118-v*62;
          return <div className="sib1rx-plot" key={label}>
            <strong>{label}</strong>
            <svg viewBox="0 0 236 236" role="img" aria-label={label+' của các QPSK symbols minh họa'}>
              {[40,79,118,157,196].map(v=><g key={v}>
                <line className="sib1rx-grid-line" x1={v} x2={v} y1="16" y2="220"/>
                <line className="sib1rx-grid-line" x1="16" x2="220" y1={v} y2={v}/>
              </g>)}
              <line className="sib1rx-plot-axis" x1="16" x2="220" y1="118" y2="118"/>
              <line className="sib1rx-plot-axis" x1="118" x2="118" y1="16" y2="220"/>
              {[-1,1].flatMap(a=>[-1,1].map(b=><circle key={a+':'+b}
                cx={axis(a/SQRT_2)} cy={yAxis(b/SQRT_2)}
                r="5.5" className="sib1rx-ideal"/>))}
              {pts.map((p,i)=><circle key={i} cx={axis(p.re)} cy={yAxis(p.im)}
                r={i===selectedSymbol?6:3} className={'sib1rx-scatter '+(i===selectedSymbol?'chosen':'')}/>)}
            </svg>
          </div>;
        })}
      </div>
      <p>
        Transmitted point <MathExpr tex={String.raw`X`}/> =
        {rounded(curr.re)} {curr.im<0?'−':'+'} j{rounded(Math.abs(curr.im))}.
        Equalized point <MathExpr tex={String.raw`\widehat X`}/> =
        {rounded(curr.eq.re)} {curr.eq.im<0?'−':'+'} j{rounded(Math.abs(curr.eq.im))}.
        Đây là ví dụ one-tap equalizer với noise và phase error thay đổi được, không phải LDPC decoder.
      </p>
    </div>
    <p className="sib1rx-footnote">
      Lab chỉ áp dụng cho case cố định: Type B, start symbol 9, duration 4, port 1000, DM-RS config type 1, 2 CDM groups without data,
      một layer, QPSK, MCS indices 0–9, overhead của SI-RNTI bằng 0. TBS được tính theo Table 5.1.3.2-1 của TS 38.214,
      không bao gồm mô phỏng LDPC/CRC thực. Một transport block rất nhỏ trong ví dụ có thể không đủ mang một SIB1 đầy đủ ngoài thực tế.
    </p>
  </div>;
}
