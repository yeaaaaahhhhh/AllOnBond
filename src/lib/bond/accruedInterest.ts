import type { Bond } from '@/types/bond';
import { findAdjacentCouponDates, getCouponDatesFromBond } from './dateUtils';
import { calculateCouponAmount } from './cashFlow';
import { calculateCouponAccrualRatio } from './dayCount';

/**
 * 경과이자 계산 결과
 */
export interface AccruedInterestResult {
  /** 경과이자 금액 */
  accruedInterest: number;
  /** 이전 쿠폰일 */
  previousCouponDate: Date | null;
  /** 다음 쿠폰일 */
  nextCouponDate: Date | null;
  /** 경과 일수 */
  daysAccrued: number;
  /** 쿠폰 기간 총 일수 */
  daysInPeriod: number;
  /** 경과 비율 (0~1) */
  accrualRatio: number;
}

/**
 * 채권의 경과이자 계산
 * @param bond - 채권 정보
 * @param settlementDate - 결제일
 * @returns 경과이자 계산 결과
 */
export function calculateAccruedInterest(bond: Bond, settlementDate: Date): AccruedInterestResult {
  // 무이표채는 경과이자 없음
  if (bond.bondType === 'zero' || bond.couponFrequency === 0) {
    return {
      accruedInterest: 0,
      previousCouponDate: null,
      nextCouponDate: null,
      daysAccrued: 0,
      daysInPeriod: 0,
      accrualRatio: 0,
    };
  }

  // 쿠폰 날짜 생성
  const couponDates = getCouponDatesFromBond(bond);
  const { previous, next } = findAdjacentCouponDates(settlementDate, couponDates);

  // 발행일 이전이거나 쿠폰일이 없는 경우
  if (!previous || !next) {
    return {
      accruedInterest: 0,
      previousCouponDate: previous,
      nextCouponDate: next,
      daysAccrued: 0,
      daysInPeriod: 0,
      accrualRatio: 0,
    };
  }

  // 경과 비율 계산
  const accrualRatio = calculateCouponAccrualRatio(previous, settlementDate, next);

  // 쿠폰 금액 계산
  const couponAmount = calculateCouponAmount(bond);

  // 경과이자 = 쿠폰 금액 × 경과 비율
  const accruedInterest = couponAmount * accrualRatio;

  // 일수 정보 계산
  const daysAccrued = Math.floor(
    (settlementDate.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysInPeriod = Math.floor((next.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));

  return {
    accruedInterest: roundByCurrency(accruedInterest, bond.currency),
    previousCouponDate: previous,
    nextCouponDate: next,
    daysAccrued,
    daysInPeriod,
    accrualRatio,
  };
}

/**
 * Clean Price (순수 가격) 계산
 * Clean Price = Dirty Price - Accrued Interest
 * @param dirtyPrice - 더티 가격 (시장 가격)
 * @param accruedInterest - 경과이자
 * @returns 클린 가격
 */
export function calculateCleanPrice(dirtyPrice: number, accruedInterest: number): number {
  return dirtyPrice - accruedInterest;
}

/**
 * Dirty Price (전체 가격) 계산
 * Dirty Price = Clean Price + Accrued Interest
 * @param cleanPrice - 클린 가격
 * @param accruedInterest - 경과이자
 * @returns 더티 가격
 */
export function calculateDirtyPrice(cleanPrice: number, accruedInterest: number): number {
  return cleanPrice + accruedInterest;
}

/**
 * 통화에 따라 금액을 시장 관행에 맞게 반올림
 * - 한국 원화(KRW): 원 단위 반올림
 * - 미국 달러(USD): 센트 단위 반올림
 * @param amount - 금액
 * @param currency - 통화
 * @returns 반올림된 금액
 */
export function roundByCurrency(amount: number, currency: 'KRW' | 'USD'): number {
  if (currency === 'KRW') {
    // 원 단위 반올림
    return Math.round(amount);
  } else {
    // 센트 단위 반올림 (소수점 2자리)
    return Math.round(amount * 100) / 100;
  }
}

/**
 * 경과이자를 액면가 대비 퍼센트로 변환
 * @param accruedInterest - 경과이자 금액
 * @param faceValue - 액면가
 * @returns 퍼센트 (예: 1.5 = 1.5%)
 */
export function accruedInterestAsPercent(accruedInterest: number, faceValue: number): number {
  if (faceValue === 0) return 0;
  return (accruedInterest / faceValue) * 100;
}
