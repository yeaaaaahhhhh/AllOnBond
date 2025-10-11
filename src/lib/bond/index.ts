/**
 * Bond Math Library
 * 채권 가격, 수익률, 경과이자 등을 계산하는 핵심 라이브러리
 */

// Date Utilities
export {
  getMonthsBetweenCoupons,
  generateCouponDates,
  findAdjacentCouponDates,
  isLeapYear,
  getYearsToMaturity,
  getCouponDatesFromBond,
} from './dateUtils';

// Day Count Conventions
export {
  getActualDays,
  calculateYearFractionACT365,
  calculateYearFractionACTACT,
  calculateYearFraction,
  calculateCouponAccrualRatio,
  type DayCountConvention,
} from './dayCount';

// Cash Flow Generation
export {
  generateCashFlows,
  calculateCouponAmount,
  calculatePresentValue,
  getTotalCashFlow,
  getCouponCashFlows,
  getPrincipalCashFlows,
  formatCashFlow,
} from './cashFlow';

// Accrued Interest
export {
  calculateAccruedInterest,
  calculateCleanPrice,
  calculateDirtyPrice,
  roundByCurrency,
  accruedInterestAsPercent,
  type AccruedInterestResult,
} from './accruedInterest';

// Pricing
export {
  calculateBondPrice,
  calculatePriceDerivative,
  calculatePriceSecondDerivative,
  calculateZeroCouponYTM,
  estimateYTM,
  type BondPrice,
} from './pricing';

// Yield & Duration
export {
  calculateYTM,
  calculateYTMNewtonRaphson,
  calculateYTMBisection,
  calculateMacaulayDuration,
  calculateModifiedDuration,
  calculateDollarDuration,
  calculateConvexity,
  type YTMCalculationOptions,
  type YTMResult,
} from './yield';

// Rate Conversion
export {
  bondYTMToDepositRate,
  bondYTMToSimpleRate,
  simpleRateToCompoundRate,
  nominalToRealRate,
  convertRateFrequency,
  beforeTaxToAfterTax,
  afterTaxToBeforeTax,
  discountRateToYield,
  yieldToDiscountRate,
  calculateBEY,
  calculateEAY,
  compareDepositVsBond,
} from './conversion';
