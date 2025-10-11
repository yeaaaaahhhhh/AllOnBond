import dayjs from 'dayjs';

/**
 * Day Count Convention 타입
 * 현재는 ACT/365만 구현, 추후 확장 가능
 */
export type DayCountConvention = 'ACT/365' | 'ACT/360' | 'ACT/ACT' | '30/360';
/**
 * ACT/365 방식으로 두 날짜 간 일수를 계산
 * @param startDate - 시작일
 * @param endDate - 종료일
 * @returns 실제 경과 일수
 */
export function getActualDays(startDate: Date, endDate: Date): number {
  return dayjs(endDate).diff(dayjs(startDate), 'day');
}

/**
 * ACT/365 기준 Year Fraction 계산
 * @param startDate - 시작일
 * @param endDate - 종료일
 * @returns 연 단위 분수 (예: 0.5 = 6개월)
 */
export function calculateYearFractionACT365(startDate: Date, endDate: Date): number {
  const actualDays = getActualDays(startDate, endDate);
  return actualDays / 365;
}

/**
 * ACT/ACT 기준 Year Fraction 계산 (ICMA 방식)
 * 쿠폰 기간 내 실제 일수 / 쿠폰 기간 실제 일수
 * @param startDate - 시작일 (이전 쿠폰일)
 * @param endDate - 종료일 (현재 날짜)
 * @param nextCouponDate - 다음 쿠폰일
 * @returns 연 단위 분수
 */
export function calculateYearFractionACTACT(
  startDate: Date,
  endDate: Date,
  nextCouponDate: Date
): number {
  const daysAccrued = getActualDays(startDate, endDate);
  const daysInPeriod = getActualDays(startDate, nextCouponDate);

  if (daysInPeriod === 0) return 0;

  return daysAccrued / daysInPeriod;
}

/**
 * Day Count Convention에 따른 Year Fraction 계산
 * @param startDate - 시작일
 * @param endDate - 종료일
 * @param convention - 일수 계산 방식
 * @param nextCouponDate - 다음 쿠폰일 (ACT/ACT에서 필요)
 * @returns 연 단위 분수
 */
export function calculateYearFraction(
  startDate: Date,
  endDate: Date,
  convention: DayCountConvention = 'ACT/365',
  nextCouponDate?: Date
): number {
  switch (convention) {
    case 'ACT/365':
      return calculateYearFractionACT365(startDate, endDate);

    case 'ACT/360':
      return getActualDays(startDate, endDate) / 360;

    case 'ACT/ACT':
      if (!nextCouponDate) {
        throw new Error('nextCouponDate is required for ACT/ACT convention');
      }
      return calculateYearFractionACTACT(startDate, endDate, nextCouponDate);

    case '30/360':
      return calculate30360Days(startDate, endDate) / 360;

    default:
      throw new Error(`Unsupported day count convention: ${convention}`);
  }
}

/**
 * 30/360 방식으로 일수 계산 (미국 회사채 등에서 사용)
 * 모든 월을 30일로, 1년을 360일로 가정
 * @param startDate - 시작일
 * @param endDate - 종료일
 * @returns 30/360 기준 일수
 */
function calculate30360Days(startDate: Date, endDate: Date): number {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  let d1 = start.date();
  let d2 = end.date();
  const m1 = start.month() + 1;
  const m2 = end.month() + 1;
  const y1 = start.year();
  const y2 = end.year();

  // 30/360 규칙 적용
  if (d1 === 31) d1 = 30;
  if (d2 === 31 && d1 === 30) d2 = 30;

  return 360 * (y2 - y1) + 30 * (m2 - m1) + (d2 - d1);
}

/**
 * 쿠폰 기간 내 경과 비율 계산
 * 현재는 ACT/ACT 방식만 지원 (실제일수 기준)
 *
 * @param previousCouponDate - 이전 쿠폰일
 * @param settlementDate - 결제일
 * @param nextCouponDate - 다음 쿠폰일
 * @returns 0~1 사이의 경과 비율
 */
export function calculateCouponAccrualRatio(
  previousCouponDate: Date,
  settlementDate: Date,
  nextCouponDate: Date
): number {
  const daysAccrued = getActualDays(previousCouponDate, settlementDate);
  const daysInPeriod = getActualDays(previousCouponDate, nextCouponDate);

  if (daysInPeriod === 0) return 0;

  return daysAccrued / daysInPeriod;
}
