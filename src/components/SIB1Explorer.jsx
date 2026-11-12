import { useMemo, useState } from 'react';
import MathExpr from './MathExpr.jsx';

/*
 * Educational SIB1 field explorer.
 * The measurement gate illustrates TS 38.304 `5.2.3.2 with q-QualMin
 * explicitly present and independently configured compensation/offsets.
 * It is NOT a full NAS/AS cell suitability, camping or UAC simulator.
 */
const SECTIONS = [
  { key:'selection', name:'cellSelectionInfo', step:'01', outcome:'Ngưỡng vô tuyến cho cell selection',
    desc:'q-RxLevMin và q-QualMin được giải nghĩa theo đơn vị khác nhau. UE so sánh chúng với mức SS-RSRP và SS-RSRQ đo được.'},
  { key:'access', name:'cellAccessRelatedInfo', step:'02', outcome:'Thông tin PLMN, TAC, NR Cell Identity',
    desc:'plmn-IdentityInfoList chứa PLMN identities và tracking-area/cell context. Cell có thể phát nhiều PLMNs.'},
  { key:'radio', name:'servingCellConfigCommon', step:'03', outcome:'Initial BWP và cấu hình UL/DL chung',
    desc:'Bao gồm downlinkConfigCommon, uplinkConfigCommon, SSB positions/periodicity, TDD common pattern khi áp dụng.'},
  { key:'rach', name:'rach-ConfigCommon (lồng trong UL BWP)', step:'04', outcome:'Thông số để chuẩn bị random access',
    desc:'Đây là field trong BWP-UplinkCommon thuộc servingCellConfigCommon, không phải root field độc lập của SIB1.'},
  { key:'si', name:'si-SchedulingInfo', step:'05', outcome:'Tìm SIB2 và những SI messages khác',
    desc:'schedulingInfoList + si-WindowLength cho UE biết SIB nào được ghép vào SI message và lịch/phương thức thu.'},
  { key:'uac', name:'uac-BarringInfo', step:'06', outcome:'Unified Access Control',
    desc:'Thông tin access barring theo category/identity khi được broadcast, không phải cellBarred một bit trong MIB.'},
];

const bitStatus = (pass, yes, no) => pass ? yes : no;

export default function SIB1Explorer() {
  const [active,setActive] = useState('selection');
  const [rsrp,setRsrp] = useState(-105);
  const [rsrq,setRsrq] = useState(-14);
  const [qRxRaw,setQRxRaw] = useState(-60);
  const [qQual,setQQual] = useState(-18);
  const [pcomp,setPcomp] = useState(0);
  const [qtemp,setQtemp] = useState(0);
  const [chosenPLMN,setChosenPLMN] = useState('001-01');
  const [mibBarred,setMibBarred] = useState(false);
  const [operatorReserved,setOperatorReserved] = useState(false);
  const [siStatus,setSiStatus] = useState('broadcasting');
  const [siPeriod,setSiPeriod] = useState(16);
  const [siWindow,setSiWindow] = useState(20);
  const [rachIndex,setRachIndex] = useState(27);
  const [fdm,setFdm] = useState(1);

  const srxlev = rsrp-2*qRxRaw-pcomp-qtemp;
  const squal = rsrq-qQual-qtemp;
  const passesRF = srxlev>0 && squal>0;
  const matchesPLMN=chosenPLMN==='001-01';
  const passesBarring=!mibBarred&&!operatorReserved;
  const educationalGate = passesRF && matchesPLMN && passesBarring;
  const selected=SECTIONS.find(x=>x.key===active);

  const rail = useMemo(()=>[
    {label:'S criterion',ok:passesRF,detail:passesRF?'Đạt ngưỡng mức thu + chất lượng':'Không đạt một hoặc cả hai ngưỡng'},
    {label:'PLMN match',ok:matchesPLMN,detail:matchesPLMN?'PLMN được quảng bá':'Không khớp PLMN giả định UE chọn'},
    {label:'Barring gates',ok:passesBarring,detail:passesBarring?'Không gặp hai barring flags đang mô phỏng':'Bị chặn bởi MIB hoặc reservation flag'},
  ],[passesRF,matchesPLMN,passesBarring]);

  const controls=[
    {name:'SS-RSRP đo được',value:rsrp,set:setRsrp,min:-135,max:-75,step:1,unit:'dBm'},
    {name:'SS-RSRQ đo được',value:rsrq,set:setRsrq,min:-25,max:-3,step:1,unit:'dB'},
    {name:'q-RxLevMin raw field',value:qRxRaw,set:setQRxRaw,min:-70,max:-22,step:1,unit:'(× 2 dBm)'},
    {name:'q-QualMin raw field',value:qQual,set:setQQual,min:-43,max:-12,step:1,unit:'dB'},
    {name:'Pcompensation (giả định)',value:pcomp,set:setPcomp,min:0,max:10,step:1,unit:'dB'},
    {name:'Temporary offset (giả định)',value:qtemp,set:setQtemp,min:0,max:10,step:1,unit:'dB'},
  ];
  return <div className="sib1lab">
    <div className="sib1lab-explorer-top">
      <div className="visual-caption"><span>INTERACTIVE · NHẬN MỘT SIB1 ASN.1 MESSAGE</span>
        <strong>Chọn nhánh field để quan sát phần UE có thể rút ra</strong></div>
      <div className="sib1lab-section-options">
        {SECTIONS.map(s=><button key={s.key} type="button" className={'sib1lab-section '+(active===s.key?'selected':'')}
          aria-pressed={active===s.key} onClick={()=>setActive(s.key)}>
          <small>{s.step}</small><strong>{s.name}</strong>
        </button>)}
      </div>
      <div className="sib1lab-field-explain">
        <small>{selected?.outcome}</small>
        <p>{selected?.desc}</p>
      </div>
    </div>

    <div className="sib1lab-controls">
      <div className="visual-caption"><span>ILLUSTRATIVE CELL SELECTION SNAPSHOT</span>
        <strong>Thay RF measurements và thresholds; các field khác giữ nguyên</strong></div>
      <div className="sib1lab-sliders">
        {controls.map(c=><label key={c.name}><span>{c.name}<strong>{c.value} {c.unit}</strong></span>
          <input type="range" min={c.min} max={c.max} step={c.step} value={c.value}
            onChange={e=>c.set(Number(e.target.value))}/></label>)}
      </div>
      <div className="sib1lab-controls-secondary">
        <label><span>PLMN UE đang tìm (NAS selection)</span>
          <select value={chosenPLMN} onChange={e=>setChosenPLMN(e.target.value)}>
            <option value="001-01">001-01 · có trong SIB1 minh họa</option>
            <option value="999-99">999-99 · không có trong SIB1 minh họa</option>
          </select></label>
        <label><span>cellBarred từ MIB</span><select value={mibBarred?'yes':'no'}
          onChange={e=>setMibBarred(e.target.value==='yes')}>
          <option value="no">notBarred</option><option value="yes">barred</option></select></label>
        <label><span>cellReservedForOperatorUse từ SIB1</span><select value={operatorReserved?'yes':'no'}
          onChange={e=>setOperatorReserved(e.target.value==='yes')}>
          <option value="no">notReserved</option><option value="yes">reserved</option></select></label>
      </div>
      <p className="sib1lab-hypotheses">Giả thiết phục vụ phép tính: <MathExpr tex={String.raw`Q_{\mathrm{rxlevminoffset}}=Q_{\mathrm{qualminoffset}}=0`}/>, SUL không sử dụng,
        <code>q-QualMin</code> có mặt. PLMN trong lab là mã minh họa, không mô phỏng NAS registration hoặc tất cả exceptions về barring.</p>
    </div>

    <div className="sib1lab-metrics metric-card-grid">
      <div className="metric-card"><small className="metric-card-label">Qrxlevmin SAU SCALE</small>
        <strong className="metric-card-value">{2*qRxRaw} dBm</strong><span className="metric-card-formula">q-RxLevMin × 2</span></div>
      <div className="metric-card"><small className="metric-card-label">Srxlev</small>
        <strong className="metric-card-value">{srxlev} dB</strong>
        <span className="metric-card-formula">{bitStatus(srxlev>0,'Đạt','Không đạt')} · strictly &gt; 0</span></div>
      <div className="metric-card"><small className="metric-card-label">Squal</small>
        <strong className="metric-card-value">{squal} dB</strong>
        <span className="metric-card-formula">{bitStatus(squal>0,'Đạt','Không đạt')} · strictly &gt; 0</span></div>
    </div>

    <div className="sib1lab-gates">
      <div className="visual-caption"><span>INITIAL SUITABILITY PRECHECK</span>
        <strong>Ba điều kiện minh họa phải cùng thỏa, nhưng chưa đủ để quyết định camping</strong></div>
      <div className="sib1lab-gates-grid">
        {rail.map((x,i)=><div key={x.label} className={'sib1lab-gate '+(x.ok?'pass':'fail')}>
          <small>{'0'+(i+1)} · {x.label}</small>
          <strong>{x.ok?'PASS':'BLOCK'}</strong><span>{x.detail}</span></div>)}
      </div>
      <p className="sib1lab-gate-result">{educationalGate
        ? 'Các điều kiện đang mô phỏng đều đạt. UE vẫn phải đánh giá thêm cell suitability, NAS restrictions, UE/service context và các procedure cụ thể trong TS 38.304.'
        : 'Ít nhất một điều kiện trong lab không đạt. Không thể suy ra UE sẽ chọn cell này cho normal service từ các giá trị đang nhập.'}</p>
    </div>

    <div className="sib1lab-signalling">
      <div className="visual-caption"><span>OTHER SI · OPTIONAL si-SchedulingInfo</span>
        <strong>SIB1 có thể cho biết những SIB khác được phát thế nào</strong></div>
      <div className="sib1lab-si-controls">
        <label><span>si-BroadcastStatus</span><select value={siStatus} onChange={e=>setSiStatus(e.target.value)}>
          <option value="broadcasting">broadcasting</option><option value="notBroadcasting">notBroadcasting</option>
        </select></label>
        <label><span>si-Periodicity</span><select value={siPeriod} onChange={e=>setSiPeriod(Number(e.target.value))}>
          {[8,16,32,64,128,256,512].map(x=><option key={x} value={x}>rf{x}</option>)}
        </select></label>
        <label><span>si-WindowLength</span><select value={siWindow} onChange={e=>setSiWindow(Number(e.target.value))}>
          {[5,10,20,40,80,160,320].map(x=><option key={x} value={x}>s{x}</option>)}
        </select></label>
      </div>
      <div className="sib1lab-si-schedule">
        <div><small>SI MESSAGE · VÍ DỤ</small><strong>SIB2 + SIB3</strong><span>sib-MappingInfo</span></div>
        <div><small>PERIODICITY</small><strong>rf{siPeriod}</strong><span>{siPeriod*10} ms tính theo radio frames</span></div>
        <div><small>WINDOW LENGTH</small><strong>s{siWindow}</strong><span>{siWindow} slots (SCS/context quyết định duration)</span></div>
      </div>
      <p>{siStatus==='broadcasting'
        ? 'Trong giả thiết broadcasting, UE biết message được phát theo chu kỳ cấu hình; vẫn cần áp đúng SI window/monitoring procedure để đọc.'
        : 'notBroadcasting nghĩa là SI message không được định kỳ broadcast theo entry này; việc yêu cầu SI nếu hỗ trợ phụ thuộc các SI-request configurations và UE procedure.'}</p>
    </div>

    <div className="sib1lab-rach">
      <div className="visual-caption"><span>NEXT STAGE · NESTED RACH-CONFIGCOMMON</span>
        <strong>Cấu hình PRACH mà SIB1 cung cấp để chuẩn bị random access</strong></div>
      <div className="sib1lab-rach-controls">
        <label><span>prach-ConfigurationIndex (minh họa)</span>
          <input type="range" min="0" max="255" value={rachIndex}
            onChange={e=>setRachIndex(Number(e.target.value))}/><strong>{rachIndex}</strong></label>
        <label><span>msg1-FDM</span><select value={fdm} onChange={e=>setFdm(Number(e.target.value))}>
          {[1,2,4,8].map(n=><option key={n} value={n}>{n} frequency-domain RO(s)</option>)}
        </select></label>
      </div>
      <div className="sib1lab-rach-details">
        <div><small>PRACH TIMING</small><strong>prach-ConfigurationIndex = {rachIndex}</strong>
          <span>Phải tra TS 38.211 tables mới biết slot/symbol PRACH occasions</span></div>
        <div><small>FREQUENCY MULTIPLEXING</small><strong>msg1-FDM = {fdm}</strong>
          <span>Số RACH occasions được frequency-multiplex trong cùng time instance</span></div>
      </div>
      <p>Thay <code>prach-ConfigurationIndex</code> trong lab chỉ minh họa rằng đây là một table index, không tự tính RACH occasion từ số index.
        Receiver còn cần frequency start, root sequence, zeroCorrelationZoneConfig, SSB-to-RO association, power parameters và PRACH procedure.</p>
    </div>
    <p className="sib1lab-note">
      Interactive dùng một SIB1 giả định và mô hình lựa chọn cell đã rút gọn; không phải ASN.1 PER decoder, NAS engine,
      complete 38.304 suitability test hay PRACH scheduler. Nó cố ý giữ các nhánh SIB1 optional và NTN/RedCap ngoài phạm vi phép tính,
      để người đọc phân biệt field được quảng bá với procedure được UE thực thi.
    </p>
  </div>;
}
