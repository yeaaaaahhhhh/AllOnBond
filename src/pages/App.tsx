import React, { useState } from 'react';

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 16px',
        borderBottom: active ? '2px solid #2FA7F5' : '2px solid transparent',
        color: active ? '#156FB0' : '#475569',
        background: 'transparent',
        cursor: 'pointer',
      }}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

export function App() {
  const [tab, setTab] = useState<'calc' | 'compare'>('calc');
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24, fontFamily: 'Inter, Pretendard, system-ui' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ color: '#156FB0', margin: 0 }}>All on bond</h1>
        <nav role="tablist" aria-label="주요 탭">
          <TabButton label="계산기" active={tab === 'calc'} onClick={() => setTab('calc')} />
          <TabButton label="채권 비교" active={tab === 'compare'} onClick={() => setTab('compare')} />
        </nav>
      </header>

      {tab === 'calc' ? (
        <section>
          <h2>계산기</h2>
          <p>KRW/USD 토글, 고정/제로, 가격↔YTM 입력 등 UI가 이 영역에 구현됩니다.</p>
          <small style={{ color: '#94A3B8' }}>기준일 2025.10.07</small>
        </section>
      ) : (
        <section>
          <h2>채권 비교</h2>
          <p>public/data/bonds.json을 로딩해 정렬·필터 가능한 테이블을 표시합니다.</p>
          <small style={{ color: '#94A3B8' }}>기준일 2025.10.07</small>
        </section>
      )}

      <footer style={{ marginTop: 48, color: '#94A3B8', fontSize: 14 }}>
        투자 자문이 아니며, 데이터 지연 또는 오류가 있을 수 있습니다.
      </footer>
    </div>
  );
}
