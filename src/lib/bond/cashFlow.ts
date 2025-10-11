import type { Bond, CashFlow } from '@/types/bond';
import { getCouponDatesFromBond } from './dateUtils';
import dayjs from 'dayjs';

/**
 * 채권의 전체 현금흐름을 생성
 * @param bond - 채권 정보
 * @param settlementDate - 결제일 (optional, 미래 현금흐름만 필요한 경우)
 * @returns 현금흐름 배열 (시간순 정렬)
 */
export function generateCashFlows(bond: Bond, settlementDate?: Date): CashFlow[] {
  const cashFlows: CashFlow[] = [];

  // 무이표채인 경우
  if (bond.bondType === 'zero' || bond.couponFrequency === 0) {
    cashFlows.push({
      date: bond.maturityDate,
      amount: bond.faceValue,
      type: 'principal',
    });
    return cashFlows;
  }

  // 이표채인 경우
  const couponDates = getCouponDatesFromBond(bond);
  const couponAmount = calculateCouponAmount(bond);

  const settlement = settlementDate ? dayjs(settlementDate) : null;

  // 쿠폰 현금흐름 추가
  for (const date of couponDates) {
    // settlementDate가 지정된 경우, 미래 현금흐름만 포함
    if (settlement && dayjs(date).isBefore(settlement)) {
      continue;
    }

    cashFlows.push({
      date,
      amount: couponAmount,
      type: 'coupon',
    });
  }

  // 만기 원금 상환 추가
  if (!settlement || dayjs(bond.maturityDate).isAfter(settlement)) {
    cashFlows.push({
      date: bond.maturityDate,
      amount: bond.faceValue,
      type: 'principal',
    });
  }

  // 날짜순 정렬
  cashFlows.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

  return cashFlows;
}

/**
 * 단일 쿠폰 지급액 계산
 * @param bond - 채권 정보
 * @returns 쿠폰 지급액
 */
export function calculateCouponAmount(bond: Bond): number {
  if (bond.bondType === 'zero' || bond.couponFrequency === 0) {
    return 0;
  }

  // 연 쿠폰 이자 = 액면가 × 표면금리
  // 1회 쿠폰 지급액 = 연 쿠폰 이자 / 연간 지급 횟수
  const annualCouponAmount = bond.faceValue * (bond.couponRate / 100);
  return annualCouponAmount / bond.couponFrequency;
}

/**
 * 결제일 이후 남은 현금흐름의 현재가치 합계 계산
 * @param bond - 채권 정보
 * @param settlementDate - 결제일
 * @param yieldRate - 할인율 (YTM, %)
 * @returns 현재가치 합계
 */
export function calculatePresentValue(bond: Bond, settlementDate: Date, yieldRate: number): number {
  const cashFlows = generateCashFlows(bond, settlementDate);
  const yieldDecimal = yieldRate / 100;

  let presentValue = 0;
  const settlement = dayjs(settlementDate);

  for (const cf of cashFlows) {
    const yearsToPayment = dayjs(cf.date).diff(settlement, 'day') / 365;

    // PV = CF / (1 + y)^t
    const discountFactor = Math.pow(1 + yieldDecimal, yearsToPayment);
    presentValue += cf.amount / discountFactor;
  }

  return presentValue;
}

/**
 * 현금흐름의 총액 계산 (할인하지 않음)
 * @param cashFlows - 현금흐름 배열
 * @returns 총 현금흐름
 */
export function getTotalCashFlow(cashFlows: CashFlow[]): number {
  return cashFlows.reduce((sum, cf) => sum + cf.amount, 0);
}

/**
 * 쿠폰 현금흐름만 필터링
 * @param cashFlows - 현금흐름 배열
 * @returns 쿠폰 현금흐름만
 */
export function getCouponCashFlows(cashFlows: CashFlow[]): CashFlow[] {
  return cashFlows.filter((cf) => cf.type === 'coupon');
}

/**
 * 원금 현금흐름만 필터링
 * @param cashFlows - 현금흐름 배열
 * @returns 원금 현금흐름만
 */
export function getPrincipalCashFlows(cashFlows: CashFlow[]): CashFlow[] {
  return cashFlows.filter((cf) => cf.type === 'principal');
}

/**
 * 현금흐름을 통화 단위로 포맷팅된 문자열로 변환
 * @param amount - 금액
 * @param currency - 통화 ('KRW' | 'USD')
 * @returns 포맷팅된 문자열
 */
export function formatCashFlow(amount: number, currency: 'KRW' | 'USD'): string {
  if (currency === 'KRW') {
    return `₩${amount.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}`;
  } else {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
