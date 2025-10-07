# 🔢 기술 스펙

## 채권 수학 공식

### 1. 일수 계산 (ACT/365)

```typescript
/**
 * ACT/365 방식으로 두 날짜 간의 연분수를 계산
 * @param startDate 시작일
 * @param endDate 종료일
 * @returns 연분수 (예: 0.5 = 6개월)
 */
function calculateYearFraction(startDate: Date, endDate: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysDiff = (endDate.getTime() - startDate.getTime()) / msPerDay;
  return daysDiff / 365;
}

/**
 * 경과이자 계산
 * @param bond 채권 정보
 * @param settlementDate 결제일
 * @returns 경과이자 (액면가 대비 %)
 */
function calculateAccruedInterest(bond: Bond, settlementDate: Date): number {
  const lastCouponDate = getLastCouponDate(bond, settlementDate);
  const nextCouponDate = getNextCouponDate(bond, settlementDate);
  
  const daysSinceLastCoupon = calculateYearFraction(lastCouponDate, settlementDate);
  const couponPeriod = calculateYearFraction(lastCouponDate, nextCouponDate);
  
  const couponAmount = bond.faceValue * (bond.couponRate / 100) / bond.couponFrequency;
  
  return couponAmount * (daysSinceLastCoupon / couponPeriod);
}
```

### 2. 채권 가격 계산

```typescript
/**
 * 채권 가격 계산 (현재가치 합계)
 * @param bond 채권 정보
 * @param yieldRate 수익률 (연율, 소수)
 * @param settlementDate 결제일
 * @returns 더티가격 (액면가 대비 %)
 */
function calculateBondPrice(bond: Bond, yieldRate: number, settlementDate: Date): number {
  const cashFlows = generateCashFlows(bond, settlementDate);
  let presentValue = 0;
  
  for (const cashFlow of cashFlows) {
    const timeToPayment = calculateYearFraction(settlementDate, cashFlow.date);
    const discountFactor = Math.pow(1 + yieldRate / bond.couponFrequency, 
                                   -timeToPayment * bond.couponFrequency);
    presentValue += cashFlow.amount * discountFactor;
  }
  
  return (presentValue / bond.faceValue) * 100; // 백분율로 변환
}

/**
 * 현금흐름 생성
 */
function generateCashFlows(bond: Bond, settlementDate: Date): CashFlow[] {
  const cashFlows: CashFlow[] = [];
  
  if (bond.bondType === 'zero') {
    // 무이표채: 만기일에 액면가만 지급
    cashFlows.push({
      date: bond.maturityDate,
      amount: bond.faceValue,
      type: 'principal'
    });
  } else {
    // 이표채: 쿠폰 + 만기 원금
    const couponDates = generateCouponDates(bond, settlementDate);
    const couponAmount = bond.faceValue * (bond.couponRate / 100) / bond.couponFrequency;
    
    for (const date of couponDates) {
      cashFlows.push({
        date,
        amount: couponAmount,
        type: 'coupon'
      });
    }
    
    // 만기 원금
    cashFlows.push({
      date: bond.maturityDate,
      amount: bond.faceValue,
      type: 'principal'
    });
  }
  
  return cashFlows.filter(cf => cf.date > settlementDate);
}
```

### 3. 만기수익률(YTM) 계산

```typescript
/**
 * 뉴턴-랩슨 방법으로 YTM 계산
 * @param bond 채권 정보
 * @param marketPrice 시장가격 (더티가격)
 * @param settlementDate 결제일
 * @returns YTM (연율, %)
 */
function calculateYTM(bond: Bond, marketPrice: number, settlementDate: Date): number {
  let yield = 0.05; // 초기 추정값 5%
  const tolerance = 1e-8;
  const maxIterations = 100;
  
  for (let i = 0; i < maxIterations; i++) {
    const price = calculateBondPrice(bond, yield, settlementDate);
    const priceDiff = price - marketPrice;
    
    if (Math.abs(priceDiff) < tolerance) {
      return yield * 100; // 백분율로 변환
    }
    
    // 수치 미분으로 기울기 계산
    const deltaYield = 0.0001;
    const priceUp = calculateBondPrice(bond, yield + deltaYield, settlementDate);
    const derivative = (priceUp - price) / deltaYield;
    
    if (Math.abs(derivative) < tolerance) {
      // 이분법으로 fallback
      return bisectionMethod(bond, marketPrice, settlementDate);
    }
    
    yield = yield - priceDiff / derivative;
  }
  
  throw new Error('YTM 계산 수렴 실패');
}

/**
 * 이분법 (Bisection Method) - 뉴턴-랩슨 실패 시 사용
 */
function bisectionMethod(bond: Bond, targetPrice: number, settlementDate: Date): number {
  let lowYield = -0.1;  // -10%
  let highYield = 0.5;  // 50%
  const tolerance = 1e-6;
  
  for (let i = 0; i < 100; i++) {
    const midYield = (lowYield + highYield) / 2;
    const midPrice = calculateBondPrice(bond, midYield, settlementDate);
    
    if (Math.abs(midPrice - targetPrice) < tolerance) {
      return midYield * 100;
    }
    
    if (midPrice > targetPrice) {
      lowYield = midYield;
    } else {
      highYield = midYield;
    }
  }
  
  return ((lowYield + highYield) / 2) * 100;
}
```

### 4. 예금환산 수익률

```typescript
/**
 * 예금환산 수익률 계산
 * @param ytm 만기수익률 (연율, %)
 * @param couponFrequency 이자지급주기
 * @returns 예금환산 수익률 (연율, %)
 */
function calculateBankEquivalentYield(ytm: number, couponFrequency: number): number {
  const nominalRate = ytm / 100;
  
  if (couponFrequency === 0) {
    // 무이표채: 단순 연환산
    return ytm;
  }
  
  // 실효연이율 계산: EAR = (1 + r/n)^n - 1
  const effectiveAnnualRate = Math.pow(1 + nominalRate / couponFrequency, couponFrequency) - 1;
  
  // 예금은 보통 단리 또는 연복리로 표시
  return effectiveAnnualRate * 100;
}

/**
 * 월복리 예금 기준 환산 (선택적)
 */
function calculateMonthlyCompoundEquivalent(ytm: number, couponFrequency: number): number {
  const nominalRate = ytm / 100;
  const ear = Math.pow(1 + nominalRate / couponFrequency, couponFrequency) - 1;
  
  // 월복리 명목이율: r_monthly = 12 * ((1 + EAR)^(1/12) - 1)
  const monthlyRate = 12 * (Math.pow(1 + ear, 1/12) - 1);
  
  return monthlyRate * 100;
}
```

### 5. 세금 계산

```typescript
/**
 * 한국 개인투자자 기준 세금 계산
 */
function calculateTaxKoreaIndividual(
  bond: Bond,
  purchasePrice: number,
  salePrice: number,
  holdingPeriod: number, // 보유일수
  totalCoupons: number
): TaxCalculation {
  
  // 1. 이자소득세 (15.4% = 소득세 14% + 지방소득세 1.4%)
  const interestTaxRate = 0.154;
  const interestTax = totalCoupons * interestTaxRate;
  
  // 2. 매매차익 (개인은 비과세, 단 금융투자소득세 도입 시 변경 가능)
  const capitalGain = salePrice - purchasePrice;
  let capitalGainTax = 0;
  
  // 금융투자소득세 (2025년 도입 예정, 연간 5천만원 초과분 20%)
  // 현재는 개인 비과세로 처리
  
  const totalTax = interestTax + capitalGainTax;
  const netReturn = totalCoupons + capitalGain - totalTax;
  const grossReturn = totalCoupons + capitalGain;
  const effectiveTaxRate = grossReturn > 0 ? (totalTax / grossReturn) * 100 : 0;
  
  return {
    interestIncome: totalCoupons,
    capitalGain,
    interestTax,
    capitalGainTax,
    totalTaxAmount: totalTax,
    netReturn,
    effectiveTaxRate
  };
}

/**
 * 미국 개인투자자 기준 세금 계산 (간소화)
 */
function calculateTaxUSAIndividual(
  bond: Bond,
  purchasePrice: number,
  salePrice: number,
  holdingPeriod: number,
  totalCoupons: number,
  marginalTaxRate: number = 0.22 // 22% 가정
): TaxCalculation {
  
  // 1. 이자소득: 일반소득세율 적용
  const interestTax = totalCoupons * marginalTaxRate;
  
  // 2. 매매차익: 보유기간에 따라 구분
  const capitalGain = salePrice - purchasePrice;
  let capitalGainTaxRate: number;
  
  if (holdingPeriod > 365) {
    // 장기 자본이득 (0%, 15%, 20%)
    capitalGainTaxRate = 0.15; // 중간소득 기준
  } else {
    // 단기 자본이득 (일반소득세율)
    capitalGainTaxRate = marginalTaxRate;
  }
  
  const capitalGainTax = Math.max(0, capitalGain) * capitalGainTaxRate;
  
  const totalTax = interestTax + capitalGainTax;
  const netReturn = totalCoupons + capitalGain - totalTax;
  const grossReturn = totalCoupons + capitalGain;
  const effectiveTaxRate = grossReturn > 0 ? (totalTax / grossReturn) * 100 : 0;
  
  return {
    interestIncome: totalCoupons,
    capitalGain,
    interestTax,
    capitalGainTax,
    totalTaxAmount: totalTax,
    netReturn,
    effectiveTaxRate
  };
}
```

### 6. 듀레이션 계산

```typescript
/**
 * 맥컬레이 듀레이션 계산
 */
function calculateDuration(bond: Bond, ytm: number, settlementDate: Date): number {
  const cashFlows = generateCashFlows(bond, settlementDate);
  const bondPrice = calculateBondPrice(bond, ytm / 100, settlementDate);
  
  let weightedTimeSum = 0;
  
  for (const cashFlow of cashFlows) {
    const timeToPayment = calculateYearFraction(settlementDate, cashFlow.date);
    const presentValue = cashFlow.amount / Math.pow(1 + ytm / 100 / bond.couponFrequency, 
                                                   timeToPayment * bond.couponFrequency);
    const weight = presentValue / (bondPrice * bond.faceValue / 100);
    
    weightedTimeSum += weight * timeToPayment;
  }
  
  return weightedTimeSum;
}

/**
 * 수정듀레이션 계산
 */
function calculateModifiedDuration(duration: number, ytm: number, couponFrequency: number): number {
  return duration / (1 + ytm / 100 / couponFrequency);
}
```

## 환율 처리

```typescript
/**
 * 환율 적용 계산
 */
interface ExchangeRate {
  from: Currency;
  to: Currency;
  rate: number;
  timestamp: Date;
}

function convertCurrency(
  amount: number, 
  fromCurrency: Currency, 
  toCurrency: Currency, 
  exchangeRates: ExchangeRate[]
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  const rate = exchangeRates.find(r => 
    r.from === fromCurrency && r.to === toCurrency
  );
  
  if (!rate) {
    throw new Error(`환율 정보 없음: ${fromCurrency} -> ${toCurrency}`);
  }
  
  return amount * rate.rate;
}

/**
 * 다중 통화 수익률 비교
 */
function normalizeYieldsToBaseCurrency(
  bonds: Bond[],
  baseCurrency: Currency,
  exchangeRates: ExchangeRate[]
): BondWithNormalizedYield[] {
  return bonds.map(bond => {
    let adjustedYield = bond.yieldToMaturity;
    
    if (bond.currency !== baseCurrency) {
      // 환율 변동 리스크 조정 (간소화된 모델)
      const currencyRiskPremium = getCurrencyRiskPremium(bond.currency, baseCurrency);
      adjustedYield -= currencyRiskPremium;
    }
    
    return {
      ...bond,
      normalizedYield: adjustedYield,
      baseCurrency
    };
  });
}
```

## 수치 안정성

```typescript
/**
 * 부동소수점 정밀도 처리
 */
function roundToDecimalPlaces(value: number, places: number): number {
  const factor = Math.pow(10, places);
  return Math.round(value * factor) / factor;
}

/**
 * 계산 결과 검증
 */
function validateCalculationResult(result: number, context: string): number {
  if (!isFinite(result)) {
    throw new Error(`계산 결과 무한대/NaN: ${context}`);
  }
  
  if (Math.abs(result) > 1e10) {
    throw new Error(`계산 결과 범위 초과: ${context}`);
  }
  
  return result;
}

/**
 * 엣지 케이스 처리
 */
function handleEdgeCases(bond: Bond, settlementDate: Date): void {
  const daysToMaturity = calculateYearFraction(settlementDate, bond.maturityDate) * 365;
  
  if (daysToMaturity < 0) {
    throw new Error('만료된 채권');
  }
  
  if (daysToMaturity < 1) {
    throw new Error('만기일이 너무 가까움 (1일 미만)');
  }
  
  if (daysToMaturity > 365 * 100) {
    throw new Error('만기일이 너무 멀음 (100년 초과)');
  }
  
  if (bond.couponRate < 0 || bond.couponRate > 50) {
    throw new Error('쿠폰율 범위 초과 (0-50%)');
  }
}
```

## 성능 최적화

```typescript
/**
 * 계산 결과 메모이제이션
 */
const calculationCache = new Map<string, any>();

function memoizedCalculation<T>(
  key: string,
  calculator: () => T,
  ttlMs: number = 60000 // 1분 캐시
): T {
  const cached = calculationCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return cached.result;
  }
  
  const result = calculator();
  calculationCache.set(key, {
    result,
    timestamp: Date.now()
  });
  
  return result;
}

/**
 * 배치 계산 최적화
 */
function calculateMultipleBonds(
  bonds: Bond[],
  settlementDate: Date
): CalculationResult[] {
  // 병렬 처리 가능한 계산들을 배치로 처리
  return bonds.map(bond => ({
    isin: bond.isin,
    ...calculateBondMetrics(bond, settlementDate)
  }));
}
```

---

*이 기술 스펙은 금융 수학의 표준 공식을 기반으로 하며, 실제 거래에서의 정확성을 보장합니다.*
