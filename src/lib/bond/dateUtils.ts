import dayjs from 'dayjs';
import type { Bond } from '@/types/bond';

/**
 * 쿠폰 지급 주기에 따른 월 수를 반환
 * @param frequency - 연간 쿠폰 지급 횟수 (0: 무이표채, 1: 연1회, 2: 반년, 4: 분기)
 * @returns 쿠폰 지급 간격 (월 단위)
 */
export function getMonthsBetweenCoupons(frequency: number): number {
  if (frequency === 0) return 0; // 무이표채
  if (frequency === 1) return 12; // 연1회
  if (frequency === 2) return 6; // 반년
  if (frequency === 4) return 3; // 분기
  throw new Error(`Unsupported coupon frequency: ${frequency}`);
}

/**
 * 만기일로부터 역산하여 모든 쿠폰 지급일을 생성
 * @param maturityDate - 만기일
 * @param issueDate - 발행일
 * @param frequency - 연간 쿠폰 지급 횟수
 * @returns 쿠폰 지급일 배열 (발행일 이후, 시간순 정렬)
 */
export function generateCouponDates(
  maturityDate: Date,
  issueDate: Date,
  frequency: number
): Date[] {
  if (frequency === 0) return []; // 무이표채는 쿠폰 없음

  const months = getMonthsBetweenCoupons(frequency);
  const couponDates: Date[] = [];

  let currentDate = dayjs(maturityDate);
  const issueDateDayjs = dayjs(issueDate);

  // 만기일부터 역산하여 쿠폰일 생성
  while (currentDate.isAfter(issueDateDayjs)) {
    couponDates.unshift(currentDate.toDate());
    currentDate = currentDate.subtract(months, 'month');
  }

  return couponDates;
}

/**
 * 결제일 기준으로 직전 쿠폰일과 직후 쿠폰일을 찾음
 * @param settlementDate - 결제일
 * @param couponDates - 모든 쿠폰 지급일 배열
 * @returns { previous: 직전 쿠폰일, next: 직후 쿠폰일 }
 */
export function findAdjacentCouponDates(
  settlementDate: Date,
  couponDates: Date[]
): { previous: Date | null; next: Date | null } {
  const settlement = dayjs(settlementDate);

  let previous: Date | null = null;
  let next: Date | null = null;

  for (const date of couponDates) {
    const couponDate = dayjs(date);

    if (couponDate.isBefore(settlement) || couponDate.isSame(settlement, 'day')) {
      previous = date;
    } else if (couponDate.isAfter(settlement) && next === null) {
      next = date;
      break;
    }
  }

  return { previous, next };
}

/**
 * 윤년 여부 확인
 * @param year - 연도
 * @returns 윤년이면 true
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * 특정 연도의 일수를 반환 (365 or 366)
 * @param year - 연도
 * @returns 해당 연도의 일수
 */
export function getDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

/**
 * 채권의 남은 기간(년) 계산
 * @param settlementDate - 결제일
 * @param maturityDate - 만기일
 * @returns 남은 기간 (년 단위, 소수)
 */
export function getYearsToMaturity(settlementDate: Date, maturityDate: Date): number {
  const days = dayjs(maturityDate).diff(dayjs(settlementDate), 'day');
  return days / 365; // ACT/365 기준
}

/**
 * 채권 정보에서 모든 쿠폰 지급일을 생성하는 헬퍼 함수
 */
export function getCouponDatesFromBond(bond: Bond): Date[] {
  return generateCouponDates(bond.maturityDate, bond.issueDate, bond.couponFrequency);
}
