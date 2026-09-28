import { useMemo, useState } from 'react';
import MathExpr from './MathExpr.jsx';

const stages = [
  {
    id: 'carrier',
    tab: 'Carrier',
    title: 'Candidate NR carrier',
    subtitle: 'Receiver chọn một frequency region đáng kiểm tra và thu I/Q samples.',
    knows: [
      'RF capability và band đang được scan',
      'một candidate carrier / frequency hypothesis',
      'complex I/Q sample buffer',
    ],
    unknown: [
      'cell timing',
      'physical cell ID',
      'SSB candidate nào là đúng',
      'MIB và SIB1',
    ],
    next: 'Tìm một synchronization pattern đã biết trong sample stream.',
    output: 'I/Q buffer',
  },
  {
    id: 'pss',
    tab: 'PSS',
    title: 'PSS candidate',
    subtitle: 'Correlation tạo một timing hypothesis và cho một phần physical-layer identity.',
    knows: [
      'candidate timing / sample region',
      'một giá trị N_ID^(2)',
      'candidate đáng kiểm tra tiếp',
    ],
    unknown: [
      'full physical cell ID',
      'PBCH payload',
      'MIB',
    ],
    next: 'Dùng SSS để hoàn thiện physical cell ID và tăng confidence cho candidate.',
    output: 'timing + N_ID^(2)',
  },
  {
    id: 'sss',
    tab: 'SSS',
    title: 'Cell identified',
    subtitle: 'PSS và SSS ghép lại để tạo physical cell ID.',
    knows: [
      'N_ID^(1)',
      'N_ID^(2)',
      'physical cell ID',
    ],
    unknown: [
      'channel trên PBCH resources',
      'PBCH payload',
      'MIB',
    ],
    next: 'Extract đúng SSB resources và dùng PBCH DM-RS để estimate channel.',
    output: 'PCI',
  },
  {
    id: 'dmrs',
    tab: 'DM-RS',
    title: 'PBCH channel observable',
    subtitle: 'Known PBCH DM-RS giúp receiver xây channel estimate cho candidate SSB.',
    knows: [
      'candidate SSB resources',
      'PBCH DM-RS reference',
      'channel estimate cho PBCH hypothesis',
    ],
    unknown: [
      'decoded PBCH payload',
      'MIB',
      'initial control configuration',
    ],
    next: 'Equalize PBCH symbols rồi QPSK demap và decode.',
    output: 'channel estimate',
  },
  {
    id: 'pbch',
    tab: 'PBCH',
    title: 'PBCH decoded',
    subtitle: 'Receiver có một broadcast-channel candidate vượt qua decoder/CRC checks.',
    knows: [
      'PBCH payload candidate',
      'timing/index information carried with PBCH processing',
      'bits cần để reconstruct MIB context',
    ],
    unknown: [
      'SIB1 content',
      'RRC connection context',
      'uplink timing alignment',
    ],
    next: 'Parse MIB và dùng pdcch-ConfigSIB1 để đi tới initial control search.',
    output: 'PBCH payload',
  },
  {
    id: 'mib',
    tab: 'MIB',
    title: 'Bootstrap information acquired',
    subtitle: 'UE đã có tối thiểu context để chuyển từ SSB sang common control cho SIB1.',
    knows: [
      'MIB fields',
      'bootstrap timing/frequency-grid context',
      'information để derive initial common control search',
    ],
    unknown: [
      'SIB1 system information',
      'random access resources đầy đủ',
      'connected-mode scheduling',
    ],
    next: 'Đi tới CORESET#0 / SearchSpace#0, monitor PDCCH và tìm SIB1.',
    output: 'MIB',
  },
];

function renderMathAware(text) {
  if (text === 'một giá trị N_ID^(2)') {
    return <>một giá trị <MathExpr tex="N_{ID}^{(2)}" /></>;
  }
  if (text === 'N_ID^(1)') return <MathExpr tex="N_{ID}^{(1)}" />;
  if (text === 'N_ID^(2)') return <MathExpr tex="N_{ID}^{(2)}" />;
  return text;
}

export default function InitialAccessExplorer() {
  const [activeIndex, setActiveIndex] = useState(0);
  const stage = stages[activeIndex];

  const progress = useMemo(
    () => ((activeIndex + 1) / stages.length) * 100,
    [activeIndex]
  );

  return (
    <div className="ia-explorer">
      <div className="ia-explorer-tabs" role="tablist" aria-label="Các bước initial cell acquisition">
        {stages.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            className={activeIndex === index ? 'selected' : ''}
            onClick={() => setActiveIndex(index)}
          >
            <small>{String(index + 1).padStart(2, '0')}</small>
            <span>{item.tab}</span>
          </button>
        ))}
      </div>

      <div className="ia-explorer-progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }}></span>
      </div>

      <div className="ia-explorer-stage">
        <div className="ia-explorer-header">
          <span className="card-label">CURRENT STATE</span>
          <h3>{stage.title}</h3>
          <p>{stage.subtitle}</p>
        </div>

        <div className="ia-explorer-columns">
          <section>
            <span className="ia-explorer-label known">UE BIẾT THÊM</span>
            <ul>
              {stage.knows.map((item) => <li key={item}>{renderMathAware(item)}</li>)}
            </ul>
          </section>

          <section>
            <span className="ia-explorer-label unknown">VẪN CHƯA BIẾT</span>
            <ul>
              {stage.unknown.map((item) => <li key={item}>{renderMathAware(item)}</li>)}
            </ul>
          </section>

          <section className="ia-explorer-next">
            <span className="ia-explorer-label next">BƯỚC TIẾP</span>
            <p>{stage.next}</p>
            <div className="ia-explorer-output">
              <small>OUTPUT</small>
              <strong>{stage.output}</strong>
            </div>
          </section>
        </div>
      </div>

      <div className="ia-explorer-nav">
        <button
          type="button"
          onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
          disabled={activeIndex === 0}
        >
          ← Trước
        </button>
        <span>{activeIndex + 1} / {stages.length}</span>
        <button
          type="button"
          onClick={() => setActiveIndex((index) => Math.min(stages.length - 1, index + 1))}
          disabled={activeIndex === stages.length - 1}
        >
          Tiếp →
        </button>
      </div>
    </div>
  );
}
