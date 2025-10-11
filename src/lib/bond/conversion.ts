/**
 * 수익률 변환 유틸리티
 * 채권 수익률 ↔ 예금 수익률 변환
 */

/**
 * 채권 수익률을 은행예금 환산수익률로 변환
 *
 * **개념:**
 * - 채권: 이자소득(과세) + 자본차익(개인 비과세)
 * - 예금: 모든 수익이 이자소득(과세)
 * - 직접 비교를 위해 채권 세후 수익을 예금 세전 기준으로 역환산
 *
 * **공식:**
 * 은행환산수익률 = 채권 세후 수익률 / (1 - 이자소득세율)
 *
 * **예시:**
 * - 채권 세후 4.5%, 세율 15.4%
 * - 은행환산 = 4.5% / (1 - 0.154) = 5.32%
 * - 의미: "세전 5.32% 예금과 동일한 세후 수익"
 *
 * @param afterTaxYield - 채권 세후 수익률 (%, 연율)
 * @param taxRate - 이자소득세율 (%, 기본값 15.4% = 소득세 14% + 지방소득세 1.4%)
 * @returns 은행환산수익률 (%, 세전 연율)
 */
export function bondYTMToDepositRate(afterTaxYield: number, taxRate: number = 15.4): number {
  const taxRateDecimal = taxRate / 100;

  // 세후 수익률을 세전으로 역환산
  const bankEquivalentYield = afterTaxYield / (1 - taxRateDecimal);

  return bankEquivalentYield;
}

/**
 * 채권 YTM을 단리 수익률로 변환
 * Simple Interest = [(1 + YTM)^t - 1] / t
 *
 * @param bondYTM - 채권 YTM (%, 연율)
 * @param yearsToMaturity - 만기까지 년수
 * @returns 단리 수익률 (%, 연율)
 */
export function bondYTMToSimpleRate(bondYTM: number, yearsToMaturity: number): number {
  const ytmDecimal = bondYTM / 100;

  // Simple Rate = [(1 + YTM)^t - 1] / t
  const totalReturn = Math.pow(1 + ytmDecimal, yearsToMaturity) - 1;
  const simpleRate = totalReturn / yearsToMaturity;

  return simpleRate * 100;
}

/**
 * 단리 수익률을 복리 수익률(YTM)로 변환
 * YTM = (1 + Simple Rate × t)^(1/t) - 1
 *
 * @param simpleRate - 단리 수익률 (%, 연율)
 * @param years - 기간 (년)
 * @returns 복리 수익률 (%, 연율)
 */
export function simpleRateToCompoundRate(simpleRate: number, years: number): number {
  const simpleDecimal = simpleRate / 100;

  // Compound = (1 + Simple × t)^(1/t) - 1
  const compoundDecimal = Math.pow(1 + simpleDecimal * years, 1 / years) - 1;

  return compoundDecimal * 100;
}

/**
 * 명목 수익률을 실질 수익률로 변환 (인플레이션 조정)
 * Real Rate = (1 + Nominal) / (1 + Inflation) - 1
 *
 * @param nominalRate - 명목 수익률 (%, 연율)
 * @param inflationRate - 인플레이션율 (%, 연율)
 * @returns 실질 수익률 (%, 연율)
 */
export function nominalToRealRate(nominalRate: number, inflationRate: number): number {
  const nominalDecimal = nominalRate / 100;
  const inflationDecimal = inflationRate / 100;

  // Fisher Equation: (1 + real) = (1 + nominal) / (1 + inflation)
  const realDecimal = (1 + nominalDecimal) / (1 + inflationDecimal) - 1;

  return realDecimal * 100;
}

/**
 * 연간 수익률을 다른 주기로 환산
 * 예: 연 4% → 월 환산
 *
 * @param annualRate - 연간 수익률 (%, 연율)
 * @param frequency - 목표 주기 (1=연, 2=반년, 4=분기, 12=월, 365=일)
 * @returns 환산된 수익률 (%)
 */
export function convertRateFrequency(annualRate: number, frequency: number): number {
  const annualDecimal = annualRate / 100;

  // (1 + annual)^(1/frequency) - 1
  const periodicDecimal = Math.pow(1 + annualDecimal, 1 / frequency) - 1;

  return periodicDecimal * 100;
}

/**
 * 세전 수익률을 세후 수익률로 변환
 * After-Tax = Before-Tax × (1 - Tax Rate)
 *
 * @param beforeTaxRate - 세전 수익률 (%, 연율)
 * @param taxRate - 세율 (%, 예: 15.4)
 * @returns 세후 수익률 (%, 연율)
 */
export function beforeTaxToAfterTax(beforeTaxRate: number, taxRate: number): number {
  const taxDecimal = taxRate / 100;

  return beforeTaxRate * (1 - taxDecimal);
}

/**
 * 세후 수익률을 세전 수익률로 역산
 * Before-Tax = After-Tax / (1 - Tax Rate)
 *
 * @param afterTaxRate - 세후 수익률 (%, 연율)
 * @param taxRate - 세율 (%, 예: 15.4)
 * @returns 세전 수익률 (%, 연율)
 */
export function afterTaxToBeforeTax(afterTaxRate: number, taxRate: number): number {
  const taxDecimal = taxRate / 100;

  if (taxDecimal >= 1) {
    throw new Error('Tax rate cannot be 100% or higher');
  }

  return afterTaxRate / (1 - taxDecimal);
}

/**
 * 할인율(Discount Rate)을 수익률(Yield)로 변환
 * 할인채에서 사용: Yield = Discount / (1 - Discount × t/360)
 *
 * @param discountRate - 할인율 (%, 연율)
 * @param daysToMaturity - 만기까지 일수
 * @returns 수익률 (%, 연율)
 */
export function discountRateToYield(discountRate: number, daysToMaturity: number): number {
  const discountDecimal = discountRate / 100;
  const yearFraction = daysToMaturity / 360;

  // Yield = Discount / (1 - Discount × t)
  const yieldDecimal = discountDecimal / (1 - discountDecimal * yearFraction);

  return yieldDecimal * 100;
}

/**
 * 수익률(Yield)을 할인율(Discount Rate)로 변환
 * Discount = Yield / (1 + Yield × t/360)
 *
 * @param yieldRate - 수익률 (%, 연율)
 * @param daysToMaturity - 만기까지 일수
 * @returns 할인율 (%, 연율)
 */
export function yieldToDiscountRate(yieldRate: number, daysToMaturity: number): number {
  const yieldDecimal = yieldRate / 100;
  const yearFraction = daysToMaturity / 360;

  // Discount = Yield / (1 + Yield × t)
  const discountDecimal = yieldDecimal / (1 + yieldDecimal * yearFraction);

  return discountDecimal * 100;
}

/**
 * BEY (Bond Equivalent Yield) 계산
 * 반년 복리를 연간 단리로 환산
 * BEY = 2 × Semi-annual Yield
 *
 * @param semiAnnualYield - 반년 수익률 (%)
 * @returns BEY (%, 연율)
 */
export function calculateBEY(semiAnnualYield: number): number {
  return semiAnnualYield * 2;
}

/**
 * EAY (Effective Annual Yield) 계산
 * 반년 복리를 연간 복리로 환산
 * EAY = (1 + Semi-annual)^2 - 1
 *
 * @param semiAnnualYield - 반년 수익률 (%)
 * @returns EAY (%, 연율)
 */
export function calculateEAY(semiAnnualYield: number): number {
  const semiDecimal = semiAnnualYield / 100;

  // EAY = (1 + r/2)^2 - 1
  const eayDecimal = Math.pow(1 + semiDecimal, 2) - 1;

  return eayDecimal * 100;
}

/**
 * 예금 수익률과 채권 수익률 비교 (세후 기준)
 * 예금은 이자소득세 15.4% (지방소득세 포함)
 * 채권은 이자소득세 15.4% + 매매차익은 비과세(개인 장내)
 *
 * @param depositRate - 예금 금리 (%, 연율)
 * @param bondYTM - 채권 YTM (%, 연율)
 * @param bondCouponRate - 채권 표면금리 (%)
 * @param bondPrice - 채권 가격 (액면가 대비 %)
 * @returns { depositAfterTax, bondAfterTax, difference }
 */
export function compareDepositVsBond(
  depositRate: number,
  bondYTM: number,
  bondCouponRate: number,
  bondPrice: number
): {
  depositAfterTax: number;
  bondAfterTax: number;
  difference: number;
  bondAdvantage: boolean;
} {
  const INTEREST_TAX_RATE = 15.4; // 이자소득세 + 지방소득세

  // 예금 세후 수익률
  const depositAfterTax = beforeTaxToAfterTax(depositRate, INTEREST_TAX_RATE);

  // 채권 세후 수익률 계산
  // 쿠폰 이자는 과세, 매매차익은 비과세(개인 장내)
  const couponYield = bondCouponRate; // 액면가 기준 쿠폰 수익률
  const capitalGainYield = bondYTM - (bondCouponRate * 100) / bondPrice; // 매매차익 수익률

  const couponAfterTax = beforeTaxToAfterTax(couponYield, INTEREST_TAX_RATE);
  const bondAfterTax = couponAfterTax + capitalGainYield; // 매매차익은 비과세

  return {
    depositAfterTax,
    bondAfterTax,
    difference: bondAfterTax - depositAfterTax,
    bondAdvantage: bondAfterTax > depositAfterTax,
  };
}
