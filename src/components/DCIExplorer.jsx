import { useMemo, useState } from 'react';
import MathExpr from './MathExpr.jsx';

// 38.214 Table 5.1.2.1.1-2, default PDSCH time allocation A,
// normal CP, dmrs-TypeA-Position = pos2.
const TIME_TABLE_A_POS2 = [
  {type:'A',s:2,l:12},{type:'A',s:2,l:10},{type:'A',s:2,l:9},
  {type:'A',s:2,l:7},{type:'A',s:2,l:5},{type:'B',s:9,l:4},
  {type:'B',s:4,l:4},{type:'B',s:5,l:7},{type:'B',s:5,l:2},
  {type:'B',s:9,l:2},{type:'B',s:12,l:2},{type:'A',s:1,l:13},
  {type:'A',s:1,l:6},{type:'A',s:2,l:4},{type:'B',s:4,l:7},
  {type:'B',s:8,l:4}
].map((row,m)=>({...row,m,k0:0}));

// 38.214 Table 5.1.3.1-1, QPSK-only range appropriate
// for SI-RNTI scheduled PDSCH in the case shown here.
const MCS_QPSK = [120,157,193,251,308,379,449,526,602,679];

const showBits=(v,width)=>v.toString(2).padStart(width,'0');
function rivFromAllocation(N,start,length){
  if(length-1<=Math.floor(N/2))return N*(length-1)+start;
  return N*(N-length+1)+(N-1-start);
}
function decodeRiv(N,riv){
  const q=Math.floor(riv/N);
  const rem=riv%N;
  const directL=q+1;
  const directS=rem;
  if(directL-1<=Math.floor(N/2) && directL+directS<=N)
    return {start:directS,length:directL,branch:'direct'};
  const length=N+1-q;
  const start=N-1-rem;
  if(length>0&&start>=0&&length+start<=N)return {start,length,branch:'complement'};
  return null;
}
const fields=[
  ['frequency','Frequency resource assignment',9],
  ['time','Time resource assignment',4],
  ['vrb','VRB-to-PRB mapping',1],
  ['mcs','MCS',5],
  ['rv','Redundancy version',2],
  ['si','System information indicator',1],
  ['reserved','Reserved bits',15]
];

export default function DCIExplorer(){
  const [rbStart,setRbStart]=useState(4);
  const [rbLength,setRbLength]=useState(8);
  const [time,setTime]=useState(5);
  const [mcs,setMcs]=useState(4);
  const [rv,setRv]=useState(0);
  const [si,setSi]=useState(0);
  const [selected,setSelected]=useState('frequency');
  const [pdcchSlot,setPdcchSlot]=useState(6);
  const N=24;
  const row=TIME_TABLE_A_POS2[time];
  const riv=rivFromAllocation(N,rbStart,rbLength);
  const parsed=decodeRiv(N,riv);
  const values={
    frequency:riv,time,vrb:0,mcs,rv,si,reserved:0
  };
  const assembled=fields.map(([key,_,width])=>showBits(values[key],width)).join('');
  const selectedInfo=fields.find(([key])=>key===selected);
  const codeRate=MCS_QPSK[mcs]/1024;
  const timeEnd=row.s+row.l-1;
  const hasOverlap=row.s<3 && timeEnd>=0;
  const maxStart=N-rbLength;

  function updateStart(value){
    const v=Number(value);
    setRbStart(Math.min(v,N-rbLength));
  }
  function updateLength(value){
    const v=Number(value);
    setRbLength(v);
    setRbStart((old)=>Math.min(old,N-v));
  }
  const matrix=useMemo(()=>Array.from({length:14},(_,l)=>
    Array.from({length:N},(_,k)=>({
      symbol:l,rb:k,
      isPdsch:l>=row.s&&l<row.s+row.l&&k>=rbStart&&k<rbStart+rbLength,
      isCoreset:l<3
    }))
  ),[row,rbStart,rbLength]);

  return <div className="dci-explorer">
    <div className="dci-controls">
      <label><span>RB start <strong>{rbStart}</strong></span>
        <input type="range" min="0" max={maxStart} value={rbStart} step="1" onChange={(e)=>updateStart(e.target.value)}/>
        <small>VRB index tính từ lowest RB của CORESET#0.</small></label>
      <label><span>Allocated RB count <strong>{rbLength}</strong></span>
        <input type="range" min="1" max={N} value={rbLength} step="1" onChange={(e)=>updateLength(e.target.value)}/>
        <small>Contiguous VRBs trong allocation type 1.</small></label>
      <label><span>Time-domain assignment <strong>{time}</strong></span>
        <select value={time} onChange={(e)=>setTime(Number(e.target.value))}>
          {TIME_TABLE_A_POS2.map((x)=><option key={x.m} value={x.m}>
            m={x.m} · row {x.m+1}: {x.type}, S={x.s}, L={x.l}
          </option>)}
        </select>
        <small>Index m trong DCI trỏ tới row m+1 (Default A, pos2).</small></label>
      <label><span>MCS index <strong>{mcs}</strong></span>
        <input type="range" min="0" max="9" step="1" value={mcs} onChange={(e)=>setMcs(Number(e.target.value))}/>
        <small>Chỉ chọn QPSK-eligible indices 0–9 cho SI-RNTI.</small></label>
      <label><span>Redundancy version <strong>{rv}</strong></span>
        <select value={rv} onChange={(e)=>setRv(Number(e.target.value))}>
          {[0,1,2,3].map((x)=><option key={x} value={x}>RV {x}</option>)}
        </select></label>
      <label><span>System information indicator</span>
        <select value={si} onChange={(e)=>setSi(Number(e.target.value))}>
          <option value="0">0 · SIB1</option><option value="1">1 · SI message</option>
        </select></label>
      <label><span>PDCCH slot index <strong>{pdcchSlot}</strong></span>
        <input type="range" min="0" max="9" value={pdcchSlot} onChange={(e)=>setPdcchSlot(Number(e.target.value))}/>
        <small>Cùng 15 kHz numerology cho PDCCH và PDSCH.</small></label>
    </div>

    <div className="dci-metrics metric-card-grid">
      <div className="metric-card">
        <small className="metric-card-label">RIV · 9 BITS</small>
        <strong className="metric-card-value">{riv}</strong>
        <span className="metric-card-formula">{showBits(riv,9)}</span>
      </div>
      <div className="metric-card">
        <small className="metric-card-label">DCI FIELD BITS</small>
        <strong className="metric-card-value">{assembled.length}</strong>
        <span className="metric-card-formula">+ 24 CRC bits riêng</span>
      </div>
      <div className="metric-card">
        <small className="metric-card-label">PDSCH SLOT / SYMBOLS</small>
        <strong className="metric-card-value">{pdcchSlot+row.k0} · {row.s}–{timeEnd}</strong>
        <span className="metric-card-formula">K0={row.k0}, mapping {row.type}</span>
      </div>
      <div className="metric-card">
        <small className="metric-card-label">MCS · QPSK</small>
        <strong className="metric-card-value">{(100*codeRate).toFixed(1)}%</strong>
        <span className="metric-card-formula">target rate = {MCS_QPSK[mcs]}/1024</span>
      </div>
    </div>

    <div className="dci-bitstream">
      <div className="visual-caption"><span>DCI FORMAT 1_0 · CRC MASKED BY SI-RNTI</span>
        <strong>Chọn một field để xem độ dài và bit value</strong></div>
      <div className="dci-bit-cells">
        {fields.map(([key,name,width])=><button key={key}
          type="button" onClick={()=>setSelected(key)}
          aria-pressed={selected===key}
          className={'dci-bit-cell '+(selected===key?'selected':'')}>
          <span>{name}</span><strong>{showBits(values[key],width)}</strong><small>{width} bit</small>
        </button>)}
      </div>
      <div className="dci-bit-selected">
        <strong>{selectedInfo?.[1]}</strong><span>{selectedInfo?.[2]} bit</span>
        <code>{showBits(values[selected],selectedInfo?.[2]??1)}</code>
      </div>
      <p>Đây là field layout cụ thể cho FR1 non-shared spectrum / Type0 CSS / SI-RNTI. Reserved bits được đặt 0 trong minh họa. 24 CRC bits không nằm trong 37 DCI information bits; CRC được attach và mask theo rule 38.212 trước Polar encoding.</p>
    </div>

    <div className="dci-riv">
      <div className="visual-caption"><span>FREQUENCY DOMAIN · RESOURCE ALLOCATION TYPE 1</span>
        <strong>RIV nén start và length vào một số nguyên</strong></div>
      <div className="dci-allocation-bar">
        {Array.from({length:N},(_,rb)=><div key={rb} className={'dci-rb '+(rb>=rbStart&&rb<rbStart+rbLength?'active':'')}>
          <small>{rb}</small>
        </div>)}
      </div>
      <div className="dci-worked-values">
        <span>Start = {rbStart}</span>
        <span>Length = {rbLength}</span>
        <span>RIV = {riv}</span>
        <span>Branch = {rbLength-1<=Math.floor(N/2)?'direct':'complement'}</span>
        <span>Decode lại = {parsed?.start??'?'} / {parsed?.length??'?'}</span>
      </div>
      <p>Trong DCI 1_0 nhận ở common search space, field chỉ ra VRBs tương đối với lowest RB của CORESET. Ví dụ cố định VRB-to-PRB mapping bằng 0 (non-interleaved), nhờ vậy các VRBs tô đậm cũng chính là PRBs được nhận. Nếu mapping bằng 1, cần thêm bước chuyển VRB sang PRB.</p>
    </div>

    <div className="dci-time">
      <div className="visual-caption"><span>TIME DOMAIN · DEFAULT A / NORMAL CP</span>
        <strong>Giá trị m={time} → hàng {time+1}, K0={row.k0}, S={row.s}, L={row.l}, Type {row.type}</strong></div>
      <div className="dci-symbol-axis">
        {Array.from({length:14},(_,symbol)=><div key={symbol}
          className={'dci-time-symbol '+(symbol>=row.s&&symbol<row.s+row.l?'active':'')+(symbol<3?' control':'')}>
          <small>{symbol}</small>
        </div>)}
      </div>
      <div className="dci-grid-scroller">
        <div className="dci-resource-grid">
          {matrix.flat().map(({symbol,rb,isPdsch,isCoreset})=>
            <div key={symbol+':'+rb}
              title={'RB '+rb+' · symbol '+symbol}
              className={'dci-re '+(isPdsch?'pdsch':'')+(isCoreset?' coreset':'')}/>
          )}
        </div>
      </div>
      <div className="dci-grid-legend">
        <span><i className="pdsch"></i>PDSCH allocation</span>
        <span><i className="coreset"></i>CORESET#0 footprint (symbols 0–2)</span>
        <span><i className="other"></i>Không được chọn</span>
      </div>
      {hasOverlap && <p className="dci-overlap">Allocation thời gian này có symbols nằm trong CORESET footprint minh họa. Đây chưa phải kết luận có thể phát đồng thời trên mọi RE; cần áp dụng PDSCH resource mapping/rate-matching và collision restrictions của cấu hình thực tế.</p>}
      <p>Grid dùng 24 RB (trục ngang) × 14 OFDM symbols (trục dọc) của một slot. MIB cho phép UE biết nơi giám sát PDCCH; sau CRC pass, DCI mới cung cấp rectangle VRB × symbols cho PDSCH. Grid này là allocation-level view, chưa loại PDSCH DM-RS, reserved RE và các RE không được sử dụng.</p>
    </div>
    <div className="dci-outcome">
      <strong>{si===0?'DCI chỉ đến PDSCH mang SIB1':'DCI chỉ đến một SI message, không phải SIB1'}</strong>
      <p>Receiver còn cần áp dụng MCS, RV, PDSCH DM-RS, channel estimation, transport block size và LDPC decoding để thực sự recover nội dung. Không thể xem DCI là SIB1 payload.</p>
    </div>
    <p className="dci-explorer-note">Lab định nghĩa một radio context nhất quán: FR1, non-shared-spectrum, CORESET#0 width 24 RB, 15 kHz PDCCH/PDSCH SCS, Type0 CSS, multiplexing pattern 1, normal CP, dmrs-TypeA-Position=pos2, Default time allocation A. No VRB interleaving. Các tham số QPSK MCS và bit lengths dựa trên TS 38.212/38.214, không giả lập TBS, PDSCH physical coding hoặc HARQ procedure.</p>
  </div>;
}
