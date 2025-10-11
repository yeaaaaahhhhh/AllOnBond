# Bond Math Library

채권 가격, 수익률, 경과이자, 듀레이션 등을 계산하는 핵심 라이브러리입니다.

## 📦 구성

```
src/lib/bond/
├── dateUtils.ts          # 날짜 유틸리티 (쿠폰일 생성, 기간 계산)
├── dayCount.ts           # 일수 계산 (ACT/365, ACT/360, ACT/ACT, 30/360)
├── cashFlow.ts           # 현금흐름 생성 및 현재가치 계산
├── accruedInterest.ts    # 경과이자 계산
├── pricing.ts            # 채권 가격 계산 (YTM → Price)
├── yield.ts              # YTM 및 듀레이션 계산 (Price → YTM)
├── conversion.ts         # 수익률 변환 (예금환산, 세후 등)
├── index.ts              # 통합 export
├── __example.ts          # 기본 사용 예제
└── __example_ytm.ts      # YTM 계산 예제
```

## 🚀 주요 기능

### 1. 채권 가격 계산 (YTM → Price)

주어진 YTM으로 채권의 Clean Price와 Dirty Price를 계산합니다.

```typescript
import { calculateBondPrice } from '@/lib/bond';

const price = calculateBondPrice(bond, settlementDate, 3.5); // YTM 3.5%

console.log(price);
// {
//   cleanPrice: 10234,        // Clean Price (경과이자 제외)
//   dirtyPrice: 10319,        // Dirty Price (경과이자 포함)
//   accruedInterest: 85,      // 경과이자
//   pricePercentage: 102.34   // 액면가 대비 %
// }
```

### 2. YTM 계산 (Price → YTM)

주어진 가격에서 만기수익률을 역산합니다. 뉴턴-랩슨 방법을 사용하며, 실패 시 자동으로 이분법으로 전환됩니다.

```typescript
import { calculateYTM } from '@/lib/bond';

const result = calculateYTM(bond, settlementDate, 9800); // Clean Price

console.log(result);
// {
//   ytm: 3.8234,                // 계산된 YTM (%)
//   method: 'newton-raphson',   // 사용된 방법
//   iterations: 5,              // 반복 횟수
//   converged: true,            // 수렴 여부
//   error: 0.00001             // 최종 오차
// }
```

**특별 처리:**

- 무이표채: 직접 계산식 사용 (수치해석 불필요)
- 이표채: 뉴턴-랩슨 방법 (빠름) → 실패 시 이분법 (안정적)

### 3. 듀레이션 계산

채권의 금리 민감도를 측정합니다.

```typescript
import {
  calculateMacaulayDuration,
  calculateModifiedDuration,
  calculateDollarDuration,
  calculateConvexity,
} from '@/lib/bond';

// Macaulay Duration (년)
const macaulay = calculateMacaulayDuration(bond, settlementDate, 3.5);
// → 4.2543년

// Modified Duration (년)
const modified = calculateModifiedDuration(bond, settlementDate, 3.5);
// → 4.1105년

// Dollar Duration (DV01)
const dv01 = calculateDollarDuration(bond, settlementDate, 3.5);
// → 42.15 (금리 1bp 변화 시 가격 변화)

// Convexity
const convexity = calculateConvexity(bond, settlementDate, 3.5);
// → 20.35
```

**활용:**

- 금리 변화에 따른 가격 변화 추정
- 포트폴리오 듀레이션 관리
- 헤징 전략 수립

### 4. 일수 계산 (Day Count Conventions)

여러 시장 관행에 따른 일수 계산 방식 지원:

- **ACT/365**: 한국 채권 시장 (실제 일수 / 365)
- **ACT/360**: 머니마켓 상품
- **ACT/ACT**: 국제 채권 시장 (ICMA 방식)
- **30/360**: 미국 회사채

```typescript
import { calculateYearFraction } from '@/lib/bond';

const yearFraction = calculateYearFraction(
  new Date('2024-01-01'),
  new Date('2024-07-01'),
  'ACT/365'
);
// → ~0.4959 (약 6개월)
```

### 5. 현금흐름 생성

채권의 모든 현금흐름(쿠폰 + 원금)을 자동 생성:

```typescript
import { generateCashFlows } from '@/lib/bond';

const cashFlows = generateCashFlows(bond, settlementDate);
// [
//   { date: Date, amount: 350, type: 'coupon' },
//   { date: Date, amount: 350, type: 'coupon' },
//   ...
//   { date: Date, amount: 10000, type: 'principal' }
// ]
```

### 6. 경과이자 계산

Clean Price와 Dirty Price 계산을 위한 경과이자:

```typescript
import { calculateAccruedInterest } from '@/lib/bond';

const result = calculateAccruedInterest(bond, settlementDate);
// {
//   accruedInterest: 285,      // 경과이자 (원화는 원 단위)
//   previousCouponDate: Date,  // 2024-09-10
//   nextCouponDate: Date,      // 2025-09-10
//   daysAccrued: 30,           // 경과 일수
//   daysInPeriod: 365,         // 쿠폰 기간 총 일수
//   accrualRatio: 0.0822       // 경과 비율
// }
```

### 7. 수익률 변환

다양한 수익률 형태 간 변환:

```typescript
import {
  bondYTMToSimpleRate,
  beforeTaxToAfterTax,
  compareDepositVsBond,
  nominalToRealRate,
} from '@/lib/bond';

// 복리 → 단리
const simpleRate = bondYTMToSimpleRate(3.5, 5); // 3.5% YTM, 5년
// → 3.7819% (단리)

// 세전 → 세후
const afterTax = beforeTaxToAfterTax(3.5, 15.4);
// → 2.961% (이자소득세 15.4% 차감)

// 예금 vs 채권 비교
const comparison = compareDepositVsBond(3.5, 3.8, 3.5, 98);
// {
//   depositAfterTax: 2.961%,
//   bondAfterTax: 3.356%,
//   difference: 0.395%p,
//   bondAdvantage: true
// }

// 명목 → 실질 (인플레이션 조정)
const realRate = nominalToRealRate(5.0, 2.0);
// → 2.94% (실질 수익률)
```

## 🎯 지원하는 채권 유형

### 이표채 (Coupon Bond)

- ✅ 연 1회 이자 지급 (한국 국고채 등)
- ✅ 반년 1회 이자 지급 (미국 국채 등)
- ✅ 분기 1회 이자 지급

### 무이표채 (Zero-Coupon Bond)

- ✅ 할인채
- ✅ 경과이자 없음
- ✅ 만기에 원금만 상환
- ✅ 직접 계산식으로 빠른 YTM 계산

## 📐 시장 관행 반영

### 반올림 규칙

- **한국 원화 (KRW)**: 원 단위 반올림
- **미국 달러 (USD)**: 센트 단위 반올림 (소수점 2자리)

### 일수 계산

- 기본값: **ACT/365** (한국 채권 시장 관행)
- 함수 호출 시 다른 convention 지정 가능

### YTM 계산 정확도

- 수렴 기준: **0.0001%** (0.01bp)
- 최대 반복: **100회**
- 이중 안전장치: 뉴턴-랩슨 실패 시 이분법 자동 전환

## 📊 계산 알고리즘

### YTM 계산 - 뉴턴-랩슨 방법

빠르고 정확한 수렴을 위해 뉴턴-랩슨 방법 사용:

```
y_{n+1} = y_n - f(y_n) / f'(y_n)

where:
  f(y) = P_calculated(y) - P_market
  f'(y) = dP/dy (가격의 도함수)
```

**장점:**

- 빠른 수렴 (보통 5-10회 반복)
- 높은 정확도

**단점:**

- 초기값이 나쁘면 발산 가능
- 도함수가 0에 가까우면 실패

### YTM 계산 - 이분법 (백업)

뉴턴-랩슨 실패 시 자동으로 전환:

```
중간값 = (하한 + 상한) / 2
목표 가격이 중간값 가격보다 크면 → 상한 = 중간값
목표 가격이 중간값 가격보다 작으면 → 하한 = 중간값
```

**장점:**

- 항상 수렴 (범위 내 해 존재 시)
- 안정적

**단점:**

- 느린 수렴 (보통 20-50회 반복)

## 📝 사용 예제

### 기본 예제

```typescript
import { runAllExamples } from '@/lib/bond/__example';
runAllExamples();
```

### YTM 계산 예제

```typescript
import { runYTMExamples } from '@/lib/bond/__example_ytm';
runYTMExamples();
```

예제 포함:

1. ✅ YTM 계산 (가격 → 수익률)
2. ✅ 가격 계산 (수익률 → 가격)
3. ✅ 듀레이션 & Convexity 계산
4. ✅ 무이표채 YTM 계산
5. ✅ 예금 vs 채권 비교
6. ✅ 미국 국채 (반년 지급)

## 🔧 의존성

- **dayjs**: 날짜 계산 라이브러리 (~2KB)

## 🎓 금융 공식 참고

### 채권 가격 공식

```
P = Σ(C_t / (1 + y)^t) + FV / (1 + y)^T

where:
  P = Price (가격)
  C_t = Coupon payment at time t
  y = Yield to Maturity (YTM)
  FV = Face Value (액면가)
  T = Time to maturity
```

### Macaulay Duration

```
D = Σ(t × PV_t) / P

where:
  t = Time to cash flow
  PV_t = Present value of cash flow at time t
  P = Bond price
```

### Modified Duration

```
D_mod = D / (1 + y)

Price change ≈ -D_mod × Δy × P
```

### Convexity

```
C = (d²P/dy²) / P

Price change ≈ -D_mod × Δy × P + 0.5 × C × (Δy)² × P
```

## ⚠️ 주의사항

1. **세금 계산**: 현재는 간단한 세율 적용만 지원. 복잡한 세법은 별도 모듈 필요
2. **환율**: 환율 변동은 고려하지 않음. 별도 처리 필요
3. **거래비용**: 수수료 등은 포함되지 않음
4. **신용위험**: 신용등급 변화에 따른 가격 변동 미반영

## 📚 다음 단계

- [ ] 세금 계산 모듈 (한국/미국 세법)
- [ ] 단위 테스트 작성 (Jest/Vitest)
- [ ] 성능 최적화 (대량 계산)
- [ ] 추가 Day Count Conventions
- [ ] 콜러블 채권 지원

## 🐛 알려진 이슈

없음 (2024-10-10 기준)

## 📖 라이선스

프로젝트 라이선스 참조
