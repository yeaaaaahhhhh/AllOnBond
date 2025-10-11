import type { Bond } from '@/types/bond';
import {
  calculateBondPrice,
  calculatePriceDerivative,
  calculateZeroCouponYTM,
  estimateYTM,
} from './pricing';

/**
 * YTM 계산 옵션
 */
export interface YTMCalculationOptions {
  /** 최대 반복 횟수 (기본값: 100) */
  maxIterations?: number;
  /** 수렴 기준 (기본값: 0.0001 = 0.01bp) */
  tolerance?: number;
  /** 초기 추정값 (기본값: 자동 계산) */
  initialGuess?: number;
  /** 뉴턴-랩슨 실패 시 이분법 사용 여부 (기본값: true) */
  useBisectionFallback?: boolean;
}

/**
 * YTM 계산 결과
 */
export interface YTMResult {
  /** 계산된 YTM (%, 연율) */
  ytm: number;
  /** 사용된 방법 ('newton-raphson' | 'bisection' | 'direct') */
  method: 'newton-raphson' | 'bisection' | 'direct';
  /** 반복 횟수 */
  iterations: number;
  /** 수렴 여부 */
  converged: boolean;
  /** 최종 오차 */
  error: number;
}

/**
 * 뉴턴-랩슨 방법으로 YTM 계산
 * f(y) = P_market - P_calculated(y) = 0을 만족하는 y를 찾음
 * y_{n+1} = y_n - f(y_n) / f'(y_n)
 *
 * @param bond - 채권 정보
 * @param settlementDate - 결제일
 * @param targetPrice - 목표 가격 (Clean Price)
 * @param options - 계산 옵션
 * @returns YTM 계산 결과
 */
export function calculateYTMNewtonRaphson(
  bond: Bond,
  settlementDate: Date,
  targetPrice: number,
  options: YTMCalculationOptions = {}
): YTMResult {
  const {
    maxIterations = 100,
    tolerance = 0.0001, // 0.01bp
    initialGuess,
  } = options;

  // 무이표채는 직접 계산
  if (bond.bondType === 'zero' || bond.couponFrequency === 0) {
    const ytm = calculateZeroCouponYTM(bond, settlementDate, targetPrice);
    return {
      ytm,
      method: 'direct',
      iterations: 0,
      converged: true,
      error: 0,
    };
  }

  // 초기 추정값
  let currentYTM = initialGuess ?? estimateYTM(bond, settlementDate, targetPrice);
  let iterations = 0;
  let error = Infinity;

  while (iterations < maxIterations) {
    // f(y) = P_calculated - P_target
    const calculatedPrice = calculateBondPrice(bond, settlementDate, currentYTM).cleanPrice;
    const priceError = calculatedPrice - targetPrice;

    error = Math.abs(priceError);

    // 수렴 확인
    if (error < tolerance) {
      return {
        ytm: currentYTM,
        method: 'newton-raphson',
        iterations,
        converged: true,
        error,
      };
    }

    // f'(y) = dP/dy
    const derivative = calculatePriceDerivative(bond, settlementDate, currentYTM);

    // 도함수가 0에 가까우면 실패
    if (Math.abs(derivative) < 1e-10) {
      return {
        ytm: currentYTM,
        method: 'newton-raphson',
        iterations,
        converged: false,
        error,
      };
    }

    // 뉴턴-랩슨 업데이트: y_{n+1} = y_n - f(y) / f'(y)
    // 주의: derivative는 dP/dy이므로 부호가 반대
    currentYTM = currentYTM - priceError / derivative;

    iterations++;
  }

  return {
    ytm: currentYTM,
    method: 'newton-raphson',
    iterations,
    converged: false,
    error,
  };
}

/**
 * 이분법으로 YTM 계산 (뉴턴-랩슨 실패 시 백업)
 *
 * @param bond - 채권 정보
 * @param settlementDate - 결제일
 * @param targetPrice - 목표 가격 (Clean Price)
 * @param options - 계산 옵션
 * @returns YTM 계산 결과
 */
export function calculateYTMBisection(
  bond: Bond,
  settlementDate: Date,
  targetPrice: number,
  options: YTMCalculationOptions = {}
): YTMResult {
  const { maxIterations = 100, tolerance = 0.0001 } = options;

  // 탐색 범위: -10% ~ 50%
  let lowerBound = -10;
  let upperBound = 50;
  let iterations = 0;
  let error = Infinity;

  // 경계값에서 가격 계산
  let priceLower = calculateBondPrice(bond, settlementDate, lowerBound).cleanPrice;
  let priceUpper = calculateBondPrice(bond, settlementDate, upperBound).cleanPrice;

  // 목표 가격이 범위 내에 있는지 확인
  if ((targetPrice - priceLower) * (targetPrice - priceUpper) > 0) {
    // 범위를 넓혀 재시도
    lowerBound = -20;
    upperBound = 100;
    priceLower = calculateBondPrice(bond, settlementDate, lowerBound).cleanPrice;
    priceUpper = calculateBondPrice(bond, settlementDate, upperBound).cleanPrice;
  }

  while (iterations < maxIterations) {
    const midPoint = (lowerBound + upperBound) / 2;
    const midPrice = calculateBondPrice(bond, settlementDate, midPoint).cleanPrice;

    error = Math.abs(midPrice - targetPrice);

    // 수렴 확인
    if (error < tolerance || Math.abs(upperBound - lowerBound) < tolerance / 100) {
      return {
        ytm: midPoint,
        method: 'bisection',
        iterations,
        converged: true,
        error,
      };
    }

    // 다음 구간 선택
    if ((midPrice - targetPrice) * (priceLower - targetPrice) < 0) {
      upperBound = midPoint;
      priceUpper = midPrice;
    } else {
      lowerBound = midPoint;
      priceLower = midPrice;
    }

    iterations++;
  }

  return {
    ytm: (lowerBound + upperBound) / 2,
    method: 'bisection',
    iterations,
    converged: false,
    error,
  };
}

/**
 * YTM 계산 (뉴턴-랩슨 + 이분법 자동 전환)
 *
 * @param bond - 채권 정보
 * @param settlementDate - 결제일
 * @param price - 채권 가격 (Clean Price)
 * @param options - 계산 옵션
 * @returns YTM 계산 결과
 */
export function calculateYTM(
  bond: Bond,
  settlementDate: Date,
  price: number,
  options: YTMCalculationOptions = {}
): YTMResult {
  const { useBisectionFallback = true } = options;

  // 먼저 뉴턴-랩슨 시도
  const newtonResult = calculateYTMNewtonRaphson(bond, settlementDate, price, options);

  // 수렴했으면 성공
  if (newtonResult.converged) {
    return newtonResult;
  }

  // 수렴 실패 시 이분법으로 전환
  if (useBisectionFallback) {
    console.warn('Newton-Raphson failed to converge, falling back to bisection method');
    return calculateYTMBisection(bond, settlementDate, price, options);
  }

  return newtonResult;
}

/**
 * Macaulay Duration 계산
 * Duration = Σ(t × PV_t) / Price
 *
 * @param bond - 채권 정보
 * @param settlementDate - 결제일
 * @param ytm - 만기수익률 (%, 연율)
 * @returns Macaulay Duration (년)
 */
export function calculateMacaulayDuration(bond: Bond, settlementDate: Date, ytm: number): number {
  const price = calculateBondPrice(bond, settlementDate, ytm).dirtyPrice;

  if (price === 0) return 0;

  // -dP/dy / P
  const derivative = calculatePriceDerivative(bond, settlementDate, ytm);
  const yieldDecimal = ytm / 100;

  // Macaulay Duration = -(1 + y) × (dP/dy) / P
  return (-(1 + yieldDecimal) * derivative) / price;
}

/**
 * Modified Duration 계산
 * Modified Duration = Macaulay Duration / (1 + y)
 *
 * @param bond - 채권 정보
 * @param settlementDate - 결제일
 * @param ytm - 만기수익률 (%, 연율)
 * @returns Modified Duration (년)
 */
export function calculateModifiedDuration(bond: Bond, settlementDate: Date, ytm: number): number {
  const macaulayDuration = calculateMacaulayDuration(bond, settlementDate, ytm);
  const yieldDecimal = ytm / 100;

  return macaulayDuration / (1 + yieldDecimal);
}

/**
 * Dollar Duration 계산 (DV01)
 * 수익률이 1bp(0.01%) 변할 때 가격 변화 (달러 기준)
 *
 * @param bond - 채권 정보
 * @param settlementDate - 결제일
 * @param ytm - 만기수익률 (%, 연율)
 * @returns Dollar Duration
 */
export function calculateDollarDuration(bond: Bond, settlementDate: Date, ytm: number): number {
  const modifiedDuration = calculateModifiedDuration(bond, settlementDate, ytm);
  const price = calculateBondPrice(bond, settlementDate, ytm).dirtyPrice;

  // DV01 = Modified Duration × Price × 0.0001
  return modifiedDuration * price * 0.0001;
}

/**
 * Convexity 계산
 * Convexity = (d²P/dy²) / P
 *
 * @param bond - 채권 정보
 * @param settlementDate - 결제일
 * @param ytm - 만기수익률 (%, 연율)
 * @returns Convexity
 */
export function calculateConvexity(bond: Bond, settlementDate: Date, ytm: number): number {
  const price = calculateBondPrice(bond, settlementDate, ytm).dirtyPrice;

  if (price === 0) return 0;

  // 가격 함수를 직접 미분하여 계산
  const epsilon = 0.01; // 1bp
  const yieldUp = ytm + epsilon;
  const yieldDown = ytm - epsilon;

  const priceUp = calculateBondPrice(bond, settlementDate, yieldUp).dirtyPrice;
  const priceDown = calculateBondPrice(bond, settlementDate, yieldDown).dirtyPrice;
  const priceCenter = price;

  // d²P/dy² ≈ (P(y+h) - 2P(y) + P(y-h)) / h²
  const secondDerivative = (priceUp - 2 * priceCenter + priceDown) / Math.pow(epsilon / 100, 2);

  return secondDerivative / price;
}
