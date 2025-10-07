# 🎨 브랜딩 가이드

## 브랜드 아이덴티티

### 서비스명: All On Bond
**컨셉**: "All on board"의 언어유희로, 모든 사람이 채권 투자에 쉽게 참여할 수 있도록 돕는다는 의미

**태그라인**: "채권 투자, 이제 쉽게 계산하세요"  
**영문 태그라인**: "Bond Investment Made Simple"

### 브랜드 가치
- **접근성**: 복잡한 금융 계산을 누구나 쉽게
- **신뢰성**: 정확한 수식과 투명한 계산 과정
- **효율성**: 빠르고 직관적인 사용자 경험

## 컬러 팔레트

### 주요 컬러 (하늘색 테마)

```css
:root {
  /* Primary Colors - Sky Blue Theme */
  --primary-50: #f0f9ff;   /* 매우 연한 하늘색 */
  --primary-100: #e0f2fe;  /* 연한 하늘색 */
  --primary-200: #bae6fd;  /* 밝은 하늘색 */
  --primary-300: #7dd3fc;  /* 중간 하늘색 */
  --primary-400: #38bdf8;  /* 선명한 하늘색 */
  --primary-500: #0ea5e9;  /* 메인 하늘색 */
  --primary-600: #0284c7;  /* 진한 하늘색 */
  --primary-700: #0369a1;  /* 더 진한 하늘색 */
  --primary-800: #075985;  /* 매우 진한 하늘색 */
  --primary-900: #0c4a6e;  /* 가장 진한 하늘색 */
  
  /* Secondary Colors - Complementary */
  --secondary-50: #fefce8;   /* 연한 노란색 */
  --secondary-100: #fef3c7;  /* 밝은 노란색 */
  --secondary-500: #eab308;  /* 메인 노란색 (강조용) */
  --secondary-600: #ca8a04;  /* 진한 노란색 */
  
  /* Neutral Colors */
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;
  
  /* Status Colors */
  --success: #10b981;    /* 성공 (녹색) */
  --warning: #f59e0b;    /* 경고 (주황색) */
  --error: #ef4444;      /* 오류 (빨간색) */
  --info: #3b82f6;       /* 정보 (파란색) */
}
```

### 컬러 사용 가이드

```css
/* 메인 브랜드 컬러 */
.brand-primary { color: var(--primary-500); }
.bg-brand-primary { background-color: var(--primary-500); }

/* 버튼 컬러 */
.btn-primary {
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
}

.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
}

/* 강조 컬러 */
.highlight { background-color: var(--secondary-100); }
.accent { color: var(--secondary-600); }
```

## 타이포그래피

### 폰트 스택

```css
:root {
  /* 한국어 우선 폰트 */
  --font-sans: 'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, 
               system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 
               'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 
               'Segoe UI Symbol', sans-serif;
  
  /* 숫자/코드용 모노스페이스 */
  --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, Inconsolata, 
               'Roboto Mono', Consolas, 'Courier New', monospace;
  
  /* 수식용 폰트 */
  --font-math: 'KaTeX_Math', 'Times New Roman', serif;
}
```

### 텍스트 스타일

```css
/* 헤딩 스타일 */
.text-h1 {
  font-size: 2.25rem;    /* 36px */
  font-weight: 700;
  line-height: 1.2;
  color: var(--gray-900);
}

.text-h2 {
  font-size: 1.875rem;   /* 30px */
  font-weight: 600;
  line-height: 1.3;
  color: var(--gray-800);
}

.text-h3 {
  font-size: 1.5rem;     /* 24px */
  font-weight: 600;
  line-height: 1.4;
  color: var(--gray-700);
}

/* 본문 텍스트 */
.text-body {
  font-size: 1rem;       /* 16px */
  font-weight: 400;
  line-height: 1.6;
  color: var(--gray-700);
}

.text-small {
  font-size: 0.875rem;   /* 14px */
  font-weight: 400;
  line-height: 1.5;
  color: var(--gray-600);
}

/* 숫자 표시용 */
.text-number {
  font-family: var(--font-mono);
  font-weight: 500;
  letter-spacing: 0.025em;
}

/* 강조 텍스트 */
.text-emphasis {
  font-weight: 600;
  color: var(--primary-600);
}
```

## 로고 및 아이콘

### 로고 컨셉
```
 ╭─────────────────────────────╮
 │  📊 All On Bond             │
 │     ∿∿∿ 채권 계산기 ∿∿∿      │
 ╰─────────────────────────────╯
```

### 아이콘 시스템

```typescript
// 주요 아이콘 (Lucide React 사용)
const icons = {
  // 네비게이션
  calculator: 'Calculator',
  comparison: 'BarChart3',
  info: 'Info',
  
  // 기능
  currency: 'DollarSign',
  percentage: 'Percent',
  calendar: 'Calendar',
  clock: 'Clock',
  
  // 상태
  success: 'CheckCircle',
  warning: 'AlertTriangle',
  error: 'XCircle',
  loading: 'Loader2',
  
  // 액션
  copy: 'Copy',
  download: 'Download',
  share: 'Share2',
  refresh: 'RefreshCw'
};
```

### 아이콘 스타일 가이드

```css
/* 아이콘 크기 */
.icon-xs { width: 12px; height: 12px; }
.icon-sm { width: 16px; height: 16px; }
.icon-md { width: 20px; height: 20px; }
.icon-lg { width: 24px; height: 24px; }
.icon-xl { width: 32px; height: 32px; }

/* 아이콘 컬러 */
.icon-primary { color: var(--primary-500); }
.icon-secondary { color: var(--gray-500); }
.icon-success { color: var(--success); }
.icon-warning { color: var(--warning); }
.icon-error { color: var(--error); }
```

## 컴포넌트 스타일

### 버튼 스타일

```css
/* 기본 버튼 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border: none;
}

/* 버튼 크기 */
.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  height: 2rem;
}

.btn-md {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  height: 2.5rem;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  height: 3rem;
}

/* 버튼 변형 */
.btn-primary {
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
}

.btn-secondary:hover {
  background: var(--gray-200);
  border-color: var(--gray-400);
}

.btn-outline {
  background: transparent;
  color: var(--primary-600);
  border: 2px solid var(--primary-500);
}

.btn-outline:hover {
  background: var(--primary-50);
  border-color: var(--primary-600);
}
```

### 카드 스타일

```css
.card {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid var(--gray-200);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-header {
  padding: 1.5rem 1.5rem 0;
  border-bottom: 1px solid var(--gray-100);
}

.card-body {
  padding: 1.5rem;
}

.card-footer {
  padding: 0 1.5rem 1.5rem;
  border-top: 1px solid var(--gray-100);
}

/* 결과 카드 특별 스타일 */
.result-card {
  background: linear-gradient(135deg, var(--primary-50), var(--primary-100));
  border: 2px solid var(--primary-200);
}

.result-card .card-header {
  background: var(--primary-500);
  color: white;
  margin: -1px -1px 0;
  border-radius: 0.75rem 0.75rem 0 0;
}
```

### 입력 필드 스타일

```css
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--gray-300);
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
  background: white;
}

.input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.input:invalid {
  border-color: var(--error);
}

.input-group {
  position: relative;
}

.input-label {
  display: block;
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}

.input-helper {
  font-size: 0.875rem;
  color: var(--gray-500);
  margin-top: 0.25rem;
}

.input-error {
  font-size: 0.875rem;
  color: var(--error);
  margin-top: 0.25rem;
}
```

### 테이블 스타일

```css
.table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table th {
  background: var(--primary-50);
  color: var(--primary-800);
  font-weight: 600;
  padding: 1rem;
  text-align: left;
  border-bottom: 2px solid var(--primary-200);
}

.table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--gray-200);
}

.table tr:hover {
  background: var(--gray-50);
}

/* 숫자 컬럼 */
.table .number {
  font-family: var(--font-mono);
  text-align: right;
  font-weight: 500;
}

/* 상태 표시 */
.table .positive { color: var(--success); }
.table .negative { color: var(--error); }
.table .neutral { color: var(--gray-600); }
```

## 레이아웃 가이드

### 그리드 시스템

```css
/* 컨테이너 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 그리드 */
.grid {
  display: grid;
  gap: 1.5rem;
}

.grid-cols-1 { grid-template-columns: 1fr; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }

/* 반응형 */
@media (max-width: 768px) {
  .grid-cols-2,
  .grid-cols-3 {
    grid-template-columns: 1fr;
  }
}
```

### 간격 시스템

```css
/* 마진/패딩 */
.m-0 { margin: 0; }
.m-1 { margin: 0.25rem; }
.m-2 { margin: 0.5rem; }
.m-3 { margin: 0.75rem; }
.m-4 { margin: 1rem; }
.m-6 { margin: 1.5rem; }
.m-8 { margin: 2rem; }

.p-0 { padding: 0; }
.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }
.p-6 { padding: 1.5rem; }
.p-8 { padding: 2rem; }

/* 방향별 */
.mt-4 { margin-top: 1rem; }
.mb-4 { margin-bottom: 1rem; }
.ml-4 { margin-left: 1rem; }
.mr-4 { margin-right: 1rem; }
```

## 애니메이션 및 전환

```css
/* 기본 전환 */
.transition {
  transition: all 0.2s ease-in-out;
}

.transition-fast {
  transition: all 0.1s ease-in-out;
}

.transition-slow {
  transition: all 0.3s ease-in-out;
}

/* 페이드 인 애니메이션 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* 로딩 스피너 */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 1s linear infinite;
}

/* 펄스 효과 */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## 다크 모드 (선택적)

```css
@media (prefers-color-scheme: dark) {
  :root {
    --gray-50: #0f172a;
    --gray-100: #1e293b;
    --gray-200: #334155;
    --gray-300: #475569;
    --gray-400: #64748b;
    --gray-500: #94a3b8;
    --gray-600: #cbd5e1;
    --gray-700: #e2e8f0;
    --gray-800: #f1f5f9;
    --gray-900: #f8fafc;
  }
  
  body {
    background: var(--gray-50);
    color: var(--gray-900);
  }
  
  .card {
    background: var(--gray-100);
    border-color: var(--gray-200);
  }
}
```

## 브랜드 가이드라인

### 사용 권장사항
✅ **DO**
- 하늘색을 메인 컬러로 일관되게 사용
- 숫자는 모노스페이스 폰트로 표시
- 카드와 그림자를 활용한 깔끔한 레이아웃
- 직관적인 아이콘과 명확한 라벨

❌ **DON'T**
- 메인 컬러 외의 강한 색상 남용
- 과도한 애니메이션이나 효과
- 복잡한 레이아웃이나 불필요한 장식
- 금융 데이터의 부정확한 표시

### 톤 앤 매너
- **전문적이면서도 친근한** 느낌
- **신뢰할 수 있는** 금융 서비스
- **쉽고 빠른** 사용자 경험
- **투명하고 정확한** 정보 제공

---

*이 브랜딩 가이드는 All On Bond의 일관된 사용자 경험을 위해 제작되었습니다.*
