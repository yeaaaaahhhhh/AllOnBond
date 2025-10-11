import type { Bond } from '@/types/bond';
import { generateCashFlows } from './cashFlow';
import { calculateAccruedInterest } from './accruedInterest';
import dayjs from 'dayjs';

/**
 * 채권 가격 계산 결과
 */
export interface BondPrice {
  /** Dirty Price (경과이자 포함) */
  dirtyPrice: number;
  /** Clean Price (경과이자 제외) */
  cleanPrice: number;
  /** 경과이자 */
  accruedInterest: number;
  /** 액면가 대비 가격 (%) */
  pricePercentage: number;
}

/**
 * YTM으로부터 채권 가격 계산
 * @param bond - 채권 정보
 * @param settlementDate - 결제일
 * @param ytm - 만기수익률 (%, 연율)
 * @returns 채권 가격 (Dirty Price / Clean Price)
 */
export function calculateBondPrice(bond: Bond, settlementDate: Date, ytm: number): BondPrice {
  // 현금흐름 생성
  const cashFlows = generateCashFlows(bond, settlementDate);
  const yieldDecimal = ytm / 100;

  let presentValue = 0;
  const settlement = dayjs(settlementDate);

  // 각 현금흐름의 현재가치 계산
  for (const cf of cashFlows) {
    const yearsToPayment = dayjs(cf.date).diff(settlement, 'day') / 365;

    if (yearsToPayment <= 0) continue; // 과거 현금흐름 제외

    // PV = CF / (1 + y)^t
    const discountFactor = Math.pow(1 + yieldDecimal, yearsToPayment);
    presentValue += cf.amount / discountFactor;
  }

  // 경과이자 계산
  const accruedResult = calculateAccruedInterest(bond, settlementDate);
  const accruedInterest = accruedResult.accruedInterest;

  // Dirty Price = 현재가치
  const dirtyPrice = presentValue;
  // Clean Price = Dirty Price - 경과이자
  const cleanPrice = dirtyPrice - accruedInterest;

  return {
    dirtyPrice,
    cleanPrice,
    accruedInterest,
    pricePercentage: (cleanPrice / bond.faceValue) * 100,
  };
}

/**
 * 채권 가격의 1차 도함수 계산 (듀레이션 계산에 사용)
 * dP/dy = -Σ(t × CF_t / (1 + y)^(t+1))
 * @param bond - 채권 정보
 * @param settlementDate - 결제일
 * @param ytm - 만기수익률 (%, 연율)
 * @returns 가격의 수익률에 대한 1차 도함수
 */
export function calculatePriceDerivative(bond: Bond, settlementDate: Date, ytm: number): number {
  const cashFlows = generateCashFlows(bond, settlementDate);
  const yieldDecimal = ytm / 100;

  let derivative = 0;
  const settlement = dayjs(settlementDate);

  for (const cf of cashFlows) {
    const yearsToPayment = dayjs(cf.date).diff(settlement, 'day') / 365;

    if (yearsToPayment <= 0) continue;

    // dP/dy = -Σ(t × CF / (1 + y)^(t+1))
    const discountFactor = Math.pow(1 + yieldDecimal, yearsToPayment + 1);
    derivative -= (yearsToPayment * cf.amount) / discountFactor;
  }

  return derivative;
}

/**
 * 채권 가격의 2차 도함수 계산 (Convexity 계산에 사용)
 * d²P/dy² = Σ(t × (t+1) × CF_t / (1 + y)^(t+2))
 * @param bond - 채권 정보
 * @param settlementDate - 결제일
 * @param ytm - 만기수익률 (%, 연율)
 * @returns 가격의 수익률에 대한 2차 도함수
 */
export function calculatePriceSecondDerivative(
  bond: Bond,
  settlementDate: Date,
  ytm: number
): number {
  const cashFlows = generateCashFlows(bond, settlementDate);
  const yieldDecimal = ytm / 100;

  let secondDerivative = 0;
  const settlement = dayjs(settlementDate);

  for (const cf of cashFlows) {
    const yearsToPayment = dayjs(cf.date).diff(settlement, 'day') / 365;

    if (yearsToPayment <= 0) continue;

    // d²P/dy² = Σ(t × (t+1) × CF / (1 + y)^(t+2))
    const discountFactor = Math.pow(1 + yieldDecimal, yearsToPayment + 2);
    secondDerivative += (yearsToPayment * (yearsToPayment + 1) * cf.amount) / discountFactor;
  }

  return secondDerivative;
}

/**
 * 무이표채의 YTM 직접 계산 (수치해석 불필요)
 * YTM = (Face Value / Price)^(1/years) - 1
 * @param bond - 무이표채 정보
 * @param settlementDate - 결제일
 * @param price - 채권 가격
 * @returns YTM (%, 연율)
 */
export function calculateZeroCouponYTM(bond: Bond, settlementDate: Date, price: number): number {
  if (bond.bondType !== 'zero' && bond.couponFrequency !== 0) {
    throw new Error('This function is only for zero-coupon bonds');
  }

  const yearsToMaturity = dayjs(bond.maturityDate).diff(dayjs(settlementDate), 'day') / 365;

  if (yearsToMaturity <= 0 || price <= 0) {
    throw new Error('Invalid input: years to maturity and price must be positive');
  }

  // YTM = (FV / P)^(1/t) - 1
  const ytmDecimal = Math.pow(bond.faceValue / price, 1 / yearsToMaturity) - 1;

  return ytmDecimal * 100; // 퍼센트로 변환
}

/**
 * 간단한 YTM 추정값 계산 (초기값으로 사용)
 * Approximate YTM = (Annual Coupon + (FV - Price) / Years) / ((FV + Price) / 2)
 * @param bond - 채권 정보
 * @param settlementDate - 결제일
 * @param price - 채권 가격 (Clean Price)
 * @returns 추정 YTM (%, 연율)
 */
export function estimateYTM(bond: Bond, settlementDate: Date, price: number): number {
  const yearsToMaturity = dayjs(bond.maturityDate).diff(dayjs(settlementDate), 'day') / 365;

  if (yearsToMaturity <= 0) return 0;

  // 무이표채는 직접 계산
  if (bond.bondType === 'zero' || bond.couponFrequency === 0) {
    return calculateZeroCouponYTM(bond, settlementDate, price);
  }

  // 연간 쿠폰 금액
  const annualCoupon = bond.faceValue * (bond.couponRate / 100);

  // 간단한 공식으로 추정
  const numerator = annualCoupon + (bond.faceValue - price) / yearsToMaturity;
  const denominator = (bond.faceValue + price) / 2;

  return (numerator / denominator) * 100;
}
