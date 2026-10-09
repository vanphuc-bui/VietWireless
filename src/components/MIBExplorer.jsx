import { useMemo, useState } from 'react';
import MathExpr from './MathExpr.jsx';

const bits = (value, length) => Number(value).toString(2).padStart(length, '0');
const fieldDefs = [
  ['sfn', 'systemFrameNumber', 6, 'Sáu MSB của System Frame Number'],
  ['scs', 'subCarrierSpacingCommon', 1, 'Common SCS cho initial-access channels'],
  ['offset', 'ssb-SubcarrierOffset', 4, 'Offset SSB so với common RB grid'],
  ['dmrs', 'dmrs-TypeA-Position', 1, 'pos2 hoặc pos3, không phải PBCH DM-RS'],
  ['coreset', 'controlResourceSetZero', 4, 'Index bảng CORESET#0'],
  ['search', 'searchSpaceZero', 4, 'Index bảng SearchSpace#0'],
  ['barred', 'cellBarred', 1, 'Cell barring flag'],
  ['reselect', 'intraFreqReselection', 1, 'Reselection khi cell barred'],
  ['spare', 'spare', 1, 'Bit dự phòng'],
];

export default function MIBExplorer() {
  const [fr, setFr] = useState('FR1');
  const [msb, setMsb] = useState(42);
  const [lsb, setLsb] = useState(11);
  const [scs, setScs] = useState(1);
  const [offset, setOffset] = useState(8);
  const [dmrs, setDmrs] = useState(0);
  const [coreset, setCoreset] = useState(3);
  const [search, setSearch] = useState(5);
  const [barred, setBarred] = useState(false);
  const [reselect, setReselect] = useState(true);
  const [focused, setFocused] = useState('coreset');
  const fullSFN = 16 * msb + lsb;
  const commonScs = fr === 'FR1' ? (scs ? 30 : 15) : (scs ? 120 : 60);
  const values = useMemo(() => ({
    sfn:msb,scs,offset,dmrs,coreset,search,
    barred:Number(barred),reselect:Number(reselect),spare:0
  }), [msb,scs,offset,dmrs,coreset,search,barred,reselect]);
  const active = fieldDefs.find((row) => row[0] === focused);

  return <div className="mib-lab">
    <div className="mib-controls">
      <label><span>Frequency range</span><select value={fr} onChange={(e)=>setFr(e.target.value)}>
        <option value="FR1">FR1 (standard case)</option><option value="FR2">FR2 (standard case)</option>
      </select></label>
      <label><span>SFN 6 MSB <strong>{msb}</strong></span>
        <input type="range" min="0" max="63" value={msb} onChange={(e)=>setMsb(Number(e.target.value))}/></label>
      <label><span>SFN 4 LSB (PBCH) <strong>{lsb}</strong></span>
        <input type="range" min="0" max="15" value={lsb} onChange={(e)=>setLsb(Number(e.target.value))}/></label>
      <label><span>Common SCS field</span>
        <select value={scs} onChange={(e)=>setScs(Number(e.target.value))}>
          <option value="0">scs15or60</option><option value="1">scs30or120</option></select></label>
      <label><span>ssb-SubcarrierOffset <strong>{offset}</strong></span>
        <input type="range" min="0" max="15" value={offset} onChange={(e)=>setOffset(Number(e.target.value))}/></label>
      <label><span>DM-RS Type A position</span>
        <select value={dmrs} onChange={(e)=>setDmrs(Number(e.target.value))}>
          <option value="0">pos2</option><option value="1">pos3</option></select></label>
      <label><span>CORESET#0 index <strong>{coreset}</strong></span>
        <input type="range" min="0" max="15" value={coreset} onChange={(e)=>setCoreset(Number(e.target.value))}/></label>
      <label><span>SearchSpace#0 index <strong>{search}</strong></span>
        <input type="range" min="0" max="15" value={search} onChange={(e)=>setSearch(Number(e.target.value))}/></label>
      <label><span>cellBarred</span>
        <select value={barred?'barred':'notBarred'} onChange={(e)=>setBarred(e.target.value==='barred')}>
          <option value="notBarred">notBarred</option><option value="barred">barred</option></select></label>
      <label><span>intraFreqReselection</span>
        <select value={reselect?'allowed':'notAllowed'} onChange={(e)=>setReselect(e.target.value==='allowed')}>
          <option value="allowed">allowed</option><option value="notAllowed">notAllowed</option></select></label>
    </div>
    <div className="mib-metrics metric-card-grid">
      <div className="metric-card"><small className="metric-card-label">FULL SFN</small>
        <strong className="metric-card-value">{fullSFN}</strong><span className="metric-card-formula">10 bits · modulo 1024</span></div>
      <div className="metric-card"><small className="metric-card-label">COMMON SCS</small>
        <strong className="metric-card-value">{commonScs} kHz</strong><span className="metric-card-formula">{fr} · ordinary case</span></div>
      <div className="metric-card"><small className="metric-card-label">PDCCH CONFIG</small>
        <strong className="metric-card-value">0x{(16*coreset+search).toString(16).toUpperCase().padStart(2,'0')}</strong>
        <span className="metric-card-formula">{bits(coreset,4)} | {bits(search,4)}</span></div>
    </div>
    <div className="mib-fields">
      <div className="visual-caption"><span>CÁC TRƯỜNG ASN.1 · MÔ HÌNH BIT</span>
        <strong>Chọn một field để kiểm tra vai trò</strong></div>
      <div className="mib-fields-grid">
        {fieldDefs.map(([key,label,width,desc])=><button key={key} type="button"
          className={'mib-field '+(focused===key?'selected':'')} aria-pressed={focused===key}
          onClick={()=>setFocused(key)}>
          <span className="mib-field-label">{label}</span>
          <strong>{bits(values[key],width)}</strong>
          <small>{width} bit</small>
        </button>)}
      </div>
      <p className="mib-focused-field"><strong>{active[1]}</strong> · {active[3]}</p>
      <p className="mib-technical-note">Đây là representation để học độ dài fields, không phải thứ tự raw PBCH bits. ASN.1 encoding/padding và interleaving/scrambling phải được xử lý đúng trong receiver.</p>
    </div>
    <div className="mib-sfn">
      <div className="visual-caption"><span>10-BIT SYSTEM FRAME NUMBER</span>
        <strong>Hai nguồn dữ liệu tạo thành một chỉ số frame</strong></div>
      <div className="mib-formula-flow">
        <div><small>TRONG MIB · 6 MSB</small><strong>{bits(msb,6)}</strong><span>{msb}</span></div>
        <b>+</b>
        <div><small>PBCH EXTRA · 4 LSB</small><strong>{bits(lsb,4)}</strong><span>{lsb}</span></div>
        <b>→</b>
        <div><small>FULL SFN</small><strong>{bits(fullSFN,10)}</strong><span>{fullSFN}</span></div>
      </div>
      <p><MathExpr tex={String.raw`\mathrm{SFN}=16\,\mathrm{SFN}_{\mathrm{MSB6}}+\mathrm{SFN}_{\mathrm{LSB4}}`}/></p>
    </div>
    <div className="mib-pdcch">
      <div className="visual-caption"><span>pdcch-ConfigSIB1</span>
        <strong>8 bit thành hai table indexes, chưa phải absolute coordinates</strong></div>
      <div className="mib-pdcch-parts">
        <div><small>4 MSB</small><strong>{bits(coreset,4)}</strong>
          <span>controlResourceSetZero = {coreset}</span>
          <p>Lookup bảng TS 38.213 với SSB/PDCCH SCS, band và bandwidth để dựng CORESET#0.</p></div>
        <div><small>4 LSB</small><strong>{bits(search,4)}</strong>
          <span>searchSpaceZero = {search}</span>
          <p>Lookup bảng TS 38.213 để tìm monitoring occasions cho Type0-PDCCH CSS.</p></div>
      </div>
      <p><strong>Thông số mang sang Bài 29:</strong> common SCS {commonScs} kHz, CORESET index {coreset}, SearchSpace index {search}. Vị trí thực tế còn phụ thuộc SSB index, band, SCS, k-SSB và các bảng tương ứng.</p>
    </div>
    <div className="mib-cell-state">
      <strong>{barred?'MIB báo barred':'MIB báo notBarred'}</strong>
      <p>{barred
        ? 'intraFreqReselection='+(reselect?'allowed':'notAllowed')+' liên quan thủ tục UE khi cell barred; quyết định cụ thể còn phụ thuộc TS 38.304 và loại UE/service (ví dụ NTN).'
        : 'notBarred chưa đủ để kết luận cell hoàn toàn phù hợp; UE còn cần SIB1 và các điều kiện cell selection/access.'}</p>
    </div>
    <p className="mib-lab-note">Đây là interactive minh họa ý nghĩa fields, không phải ASN.1 PER decoder hoặc bảng CORESET generator. Các cặp index được phép thử để quan sát bits; bảng TS 38.213 có điều kiện áp dụng và các giá trị reserved.</p>
  </div>;
}
