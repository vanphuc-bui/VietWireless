import { useMemo, useState } from 'react';
import MathExpr from './MathExpr.jsx';

/*
 * Educational Type0-PDCCH common-search-space candidate model.
 * The CCE start-index equation follows 38.213 10.1 for Y=0,n_CI=0.
 * REG bundle interleaving and actual waveform decoding are NOT simulated.
 */
const coreConfigs = [
  {index:3,rb:24, symbols:3, label:'MIB CORESET index 3 · 24 RB × 3 symbols'},
  {index:1,rb:24, symbols:2, label:'MIB CORESET index 1 · 24 RB × 2 symbols'},
  {index:8,rb:48, symbols:2, label:'MIB CORESET index 8 · 48 RB × 2 symbols'},
  {index:12,rb:96, symbols:1, label:'MIB CORESET index 12 · 96 RB × 1 symbol'}
];
const maxCandidates={4:4,8:2,16:1};
const levels=[4,8,16];

function getCandidates(total,aggregation){
  const count=maxCandidates[aggregation];
  const groups=Math.floor(total/aggregation);
  if(groups===0) return [];
  return Array.from({length:count},(_,m)=>{
    const q=Math.floor(m*total/(aggregation*count));
    const cceStart=aggregation*(q%groups);
    return {
      m,start:cceStart,end:cceStart+aggregation-1,
      ids:Array.from({length:aggregation},(_,i)=>cceStart+i)
    };
  });
}

function candidateDescription(c){
  return c ? 'CCE '+c.start+(c.start===c.end?'':'–'+c.end) : 'Không có candidate hợp lệ';
}

export default function PDCCHExplorer(){
  const [coreIndex,setCoreIndex]=useState(3);
  const [aggregation,setAggregation]=useState(4);
  const [candidate,setCandidate]=useState(0);
  const [rnti,setRnti]=useState('SI-RNTI');
  const [hasDci,setHasDci]=useState(true);

  const cfg=coreConfigs.find(x=>x.index===coreIndex)??coreConfigs[0];
  const nReg=cfg.rb*cfg.symbols;
  const nCce=Math.floor(nReg/6);
  const candidates=useMemo(()=>getCandidates(nCce,aggregation),[nCce,aggregation]);
  const selected=candidates[Math.min(candidate,Math.max(candidates.length-1,0))]??null;
  const occupied=new Set(selected?.ids??[]);
  const nQpsk=54*aggregation;
  const nBits=108*aggregation;
  const isCorrectRnti=rnti==='SI-RNTI';

  function changeCore(value){
    setCoreIndex(Number(value));
    setCandidate(0);
  }
  function changeLevel(value){
    setAggregation(Number(value));
    setCandidate(0);
  }

  return <div className="pdcch-lab">
    <div className="pdcch-controls">
      <label>
        <span>CORESET#0 configuration</span>
        <select value={coreIndex} onChange={(e)=>changeCore(e.target.value)}>
          {coreConfigs.map((x)=><option key={x.index} value={x.index}>{x.label}</option>)}
        </select>
        <small>Các cấu hình chọn từ Table 13-1 của bài trước.</small>
      </label>
      <label>
        <span>Aggregation level <strong>{aggregation} CCE</strong></span>
        <select value={aggregation} onChange={(e)=>changeLevel(e.target.value)}>
          {levels.map((l)=><option key={l} value={l}>{l} CCE</option>)}
        </select>
        <small>Chỉ ba mức AL của Type0-PDCCH CSS trong ví dụ SIB1.</small>
      </label>
      <label>
        <span>Candidate index</span>
        <select value={Math.min(candidate,Math.max(candidates.length-1,0))}
          disabled={!candidates.length}
          onChange={(e)=>setCandidate(Number(e.target.value))}>
          {candidates.length?candidates.map((c)=>
            <option key={c.m} value={c.m}>Candidate {c.m} · {candidateDescription(c)}</option>
          ):<option value="0">Không đủ CCE</option>}
        </select>
        <small>Có thể có candidates trùng CCE start khi số CCE không chia đều.</small>
      </label>
      <label>
        <span>RNTI hypothesis dùng để kiểm CRC</span>
        <select value={rnti} onChange={(e)=>setRnti(e.target.value)}>
          <option value="SI-RNTI">SI-RNTI (SIB1)</option>
          <option value="P-RNTI">P-RNTI (paging)</option>
          <option value="RA-RNTI">RA-RNTI (random access)</option>
        </select>
        <small>Đây là ví dụ tìm DCI cho SIB1, không phải paging/RACH.</small>
      </label>
      <label>
        <span>Giả lập có DCI trong occasion</span>
        <select value={hasDci?'yes':'no'} onChange={(e)=>setHasDci(e.target.value==='yes')}>
          <option value="yes">Có một DCI giả định</option>
          <option value="no">Không có DCI</option>
        </select>
        <small>Chỉ minh họa trạng thái, không chạy Polar decoder.</small>
      </label>
    </div>

    <div className="pdcch-metrics metric-card-grid">
      <div className="metric-card">
        <small className="metric-card-label">CORESET</small>
        <strong className="metric-card-value">{nReg} REG</strong>
        <span className="metric-card-formula">{cfg.rb} RB × {cfg.symbols} symbols</span>
      </div>
      <div className="metric-card">
        <small className="metric-card-label">LOGICAL CAPACITY</small>
        <strong className="metric-card-value">{nCce} CCE</strong>
        <span className="metric-card-formula">6 REG / CCE</span>
      </div>
      <div className="metric-card">
        <small className="metric-card-label">CODED BITS / CANDIDATE</small>
        <strong className="metric-card-value">{nBits}</strong>
        <span className="metric-card-formula">{nQpsk} QPSK symbols</span>
      </div>
      <div className="metric-card">
        <small className="metric-card-label">TYPE0 CANDIDATES</small>
        <strong className="metric-card-value">{candidates.length}</strong>
        <span className="metric-card-formula">theo mức AL đang chọn</span>
      </div>
    </div>

    <div className="pdcch-grid-explainer">
      <div className="visual-caption">
        <span>PHYSICAL CORESET REGION</span>
        <strong>Mỗi ô tương đương 1 REG = 1 RB trong 1 OFDM symbol</strong>
      </div>
      <div className="pdcch-physical-grid" style={{gridTemplateColumns:'repeat('+cfg.rb+', minmax(0, 1fr))'}}>
        {Array.from({length:nReg},(_,i)=>
          <i key={i} title={'REG '+i+' · RB '+i%cfg.rb+' · symbol '+Math.floor(i/cfg.rb)} />)}
      </div>
      <div className="pdcch-legend">
        <span><i className="physical"></i>REG thuộc CORESET</span>
        <span><i className="candidate"></i>CCE được candidate sử dụng (bên dưới)</span>
      </div>
      <p>REG numbering là time-first: RB indices tăng trong một OFDM symbol rồi chuyển sang symbol tiếp theo. Grid này chỉ vẽ footprint; selected CCE được thể hiện riêng để không ngụ ý một CCE luôn nằm trong các RB kề nhau.</p>
    </div>

    <div className="pdcch-cce-explainer">
      <div className="visual-caption">
        <span>LOGICAL CCE SPACE</span>
        <strong>Candidate {selected?.m??'không có'}: {candidateDescription(selected)}</strong>
      </div>
      <div className="pdcch-cce-strip" style={{gridTemplateColumns:'repeat('+nCce+', minmax(0,1fr))'}}>
        {Array.from({length:nCce},(_,i)=>
          <div className={'pdcch-cce '+(occupied.has(i)?'selected':'')} key={i}>
            <strong>{i}</strong>
          </div>)}
      </div>
      {candidates.length>0 ?
        <div className="pdcch-candidate-grid">
          {candidates.map((c)=>
            <button key={c.m} className={'pdcch-candidate '+(selected?.m===c.m?'selected':'')}
              onClick={()=>setCandidate(c.m)} type="button">
              <small>m = {c.m}</small><strong>{candidateDescription(c)}</strong>
              <span>AL {aggregation}</span>
            </button>)}
        </div> :
        <p className="pdcch-no-candidate">CORESET chỉ có {nCce} CCE nên không thể chứa PDCCH mức AL {aggregation}. Hãy giảm AL hoặc chọn CORESET lớn hơn.</p>}
      <p>
        Formula minh họa candidates theo TS 38.213 clause 10.1 cho Type0 common search space,
        <MathExpr tex={String.raw`Y=0`} /> và <MathExpr tex={String.raw`n_{\mathrm{CI}}=0`} />.
        Các ô đánh số CCE là <strong>logical CCE indices</strong>.
        Physical REG locations còn phụ thuộc CCE-to-REG mapping / interleaving của CORESET; không được hiểu những ô tô đậm là các REG nằm liên tiếp trên tần số.
      </p>
    </div>

    <div className="pdcch-reg-zoom">
      <div className="visual-caption">
        <span>ZOOM VÀO MỘT REG</span>
        <strong>12 RE = 3 PDCCH DM-RS + 9 QPSK data</strong>
      </div>
      <div className="pdcch-re-strip">
        {Array.from({length:12},(_,k)=>
          <div className={(k%4===1?'dmrs':'data')} key={k}>
            <strong>{k}</strong><small>{k%4===1?'RS':'data'}</small>
          </div>)}
      </div>
      <div className="pdcch-legend">
        <span><i className="pilot"></i>PDCCH DM-RS (RE 1, 5, 9)</span>
        <span><i className="data"></i>Coded QPSK symbols</span>
      </div>
      <p>
        Với <MathExpr tex={String.raw`L=`+aggregation} /> CCE, một candidate chiếm
        <MathExpr tex={'6\\times'+aggregation+'='+6*aggregation} /> REG,
        trong đó có <MathExpr tex={'9\\times6\\times'+aggregation+'='+nQpsk} /> data RE
        và <MathExpr tex={'2\\times'+nQpsk+'='+nBits} /> coded bits.
        Đây là số coded bits sau rate matching, <strong>không phải độ dài DCI payload</strong>.
      </p>
    </div>

    <div className="pdcch-detection">
      <div className="visual-caption">
        <span>CRC + RNTI HYPOTHESIS</span>
        <strong>Tại sao có thể tìm đúng vị trí nhưng vẫn không tìm được DCI?</strong>
      </div>
      <div className="pdcch-detection-state">
        <div><small>MONITORED RNTI</small><strong>{rnti}</strong></div>
        <div><small>DCI TRONG VÍ DỤ</small>
          <strong>{hasDci?'DCI 1_0 / SI-RNTI':'Không phát DCI'}</strong></div>
        <div><small>ĐIỀU KIỆN CẦN</small>
          <strong>{!selected?'AL không khả dụng':!hasDci?'Không có DCI':!isCorrectRnti?'Sai RNTI':'RNTI phù hợp'}</strong></div>
      </div>
      <p>
        {(!selected) ? 'Không có candidate CCE hợp lệ ở aggregation level này, nên receiver không có đầu vào đúng cho trial decode.'
          :(!hasDci) ? 'Đến đúng monitoring occasion chỉ tạo cơ hội tìm DCI; nếu gNB không phát, không thể có DCI để recover.'
          :(!isCorrectRnti) ? 'Ví dụ mô tả DCI có CRC masked bằng SI-RNTI: giả thiết P-RNTI hoặc RA-RNTI không phải CRC hypothesis đúng.'
          :'Điều kiện RNTI đã khớp với DCI giả định. Receiver thực tế vẫn phải giải điều chế, Polar decode và kiểm CRC thật; lab không tuyên bố đã decode thành công.'}
      </p>
    </div>

    <p className="pdcch-lab-note">
      Lab hiển thị một mô hình educational Type0-PDCCH common search space. Candidate start indices dựa trên công thức TS 38.213 clause 10.1 với <MathExpr tex={String.raw`Y=0`} />, <MathExpr tex={String.raw`n_{\mathrm{CI}}=0`} /> và maximum candidate counts theo Table 10.1-1.
      Nó không mô phỏng interleaver, channel estimate, Polar decoder, CRC calculation hay scheduling traffic.
      Trong những monitoring occasions / CORESET configurations khác, UE có thể được cấu hình USS với AL 1/2 và candidate budgets khác.
    </p>
  </div>;
}
