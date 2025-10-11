/**
 * Bond Math Library 사용 예제
 * 실제 프로덕션에서는 이 파일을 제거하고, Calculator 컴포넌트에서 사용
 */

import type { Bond } from '@/types/bond';
import {
  generateCashFlows,
  calculateAccruedInterest,
  calculatePresentValue,
  formatCashFlow,
} from './index';

// 예제 1: 한국 국고채 (연 1회 이자 지급)
const koreanBond: Bond = {
  isin: 'KR103501GC99',
  name: '국고채권 03500-5009(20-4)',
  issuer: '대한민국',
  bondType: 'coupon',
  currency: 'KRW',
  faceValue: 10000, // 액면가 10,000원
  couponRate: 3.5, // 표면금리 3.5%
  couponFrequency: 1, // 연 1회 지급
  issueDate: new Date('2020-09-10'),
  maturityDate: new Date('2029-09-10'),
  creditRating: 'AAA',
};

// 예제 2: 미국 국채 (반년 1회 이자 지급)
const usBond: Bond = {
  isin: 'US912810TW15',
  name: 'US Treasury Note 2.5% 2029',
  issuer: 'United States Treasury',
  bondType: 'coupon',
  currency: 'USD',
  faceValue: 1000, // 액면가 $1,000
  couponRate: 2.5, // 표면금리 2.5%
  couponFrequency: 2, // 반년 1회 지급
  issueDate: new Date('2019-05-15'),
  maturityDate: new Date('2029-05-15'),
  creditRating: 'AAA',
};

// 예제 3: 무이표채
const zeroCouponBond: Bond = {
  isin: 'KR103502GC89',
  name: '국고채권(할인) 2028-03-10',
  issuer: '대한민국',
  bondType: 'zero',
  currency: 'KRW',
  faceValue: 10000,
  couponRate: 0,
  couponFrequency: 0,
  issueDate: new Date('2023-03-10'),
  maturityDate: new Date('2028-03-10'),
  creditRating: 'AAA',
};

/**
 * 한국 국고채 예제 실행
 */
export function exampleKoreanBond() {
  console.log('=== 한국 국고채 예제 ===\n');

  const settlementDate = new Date('2024-10-10');
  const ytm = 3.2; // YTM 3.2%

  // 1. 현금흐름 생성
  console.log('1. 현금흐름:');
  const cashFlows = generateCashFlows(koreanBond, settlementDate);
  cashFlows.forEach((cf, idx) => {
    console.log(
      `  ${idx + 1}. ${cf.date.toLocaleDateString('ko-KR')}: ${formatCashFlow(cf.amount, 'KRW')} (${cf.type})`
    );
  });

  // 2. 경과이자 계산
  console.log('\n2. 경과이자:');
  const accruedResult = calculateAccruedInterest(koreanBond, settlementDate);
  console.log(`  경과이자: ${formatCashFlow(accruedResult.accruedInterest, 'KRW')}`);
  console.log(`  이전 쿠폰일: ${accruedResult.previousCouponDate?.toLocaleDateString('ko-KR')}`);
  console.log(`  다음 쿠폰일: ${accruedResult.nextCouponDate?.toLocaleDateString('ko-KR')}`);
  console.log(`  경과 일수: ${accruedResult.daysAccrued}일 / ${accruedResult.daysInPeriod}일`);
  console.log(`  경과 비율: ${(accruedResult.accrualRatio * 100).toFixed(2)}%`);

  // 3. 현재가치 계산
  console.log('\n3. 현재가치 (YTM 3.2%):');
  const pv = calculatePresentValue(koreanBond, settlementDate, ytm);
  console.log(`  현재가치: ${formatCashFlow(pv, 'KRW')}`);
  console.log(`  Clean Price: ${formatCashFlow(pv - accruedResult.accruedInterest, 'KRW')}`);
  console.log(`  Dirty Price: ${formatCashFlow(pv, 'KRW')}`);
}

/**
 * 미국 국채 예제 실행
 */
export function exampleUSBond() {
  console.log('\n\n=== 미국 국채 예제 ===\n');

  const settlementDate = new Date('2024-10-10');
  const ytm = 4.0; // YTM 4.0%

  // 1. 현금흐름 생성 (처음 5개만 표시)
  console.log('1. 현금흐름 (처음 5개):');
  const cashFlows = generateCashFlows(usBond, settlementDate);
  cashFlows.slice(0, 5).forEach((cf, idx) => {
    console.log(
      `  ${idx + 1}. ${cf.date.toLocaleDateString('en-US')}: ${formatCashFlow(cf.amount, 'USD')} (${cf.type})`
    );
  });
  console.log(`  ... 총 ${cashFlows.length}개 현금흐름`);

  // 2. 경과이자 계산
  console.log('\n2. 경과이자:');
  const accruedResult = calculateAccruedInterest(usBond, settlementDate);
  console.log(`  경과이자: ${formatCashFlow(accruedResult.accruedInterest, 'USD')}`);
  console.log(`  경과 일수: ${accruedResult.daysAccrued}일 / ${accruedResult.daysInPeriod}일`);

  // 3. 현재가치 계산
  console.log('\n3. 현재가치 (YTM 4.0%):');
  const pv = calculatePresentValue(usBond, settlementDate, ytm);
  console.log(`  현재가치: ${formatCashFlow(pv, 'USD')}`);
  console.log(`  Clean Price: ${formatCashFlow(pv - accruedResult.accruedInterest, 'USD')}`);
}

/**
 * 무이표채 예제 실행
 */
export function exampleZeroCouponBond() {
  console.log('\n\n=== 무이표채 예제 ===\n');

  const settlementDate = new Date('2024-10-10');
  const ytm = 3.5; // YTM 3.5%

  // 1. 현금흐름 (만기에 원금만 상환)
  console.log('1. 현금흐름:');
  const cashFlows = generateCashFlows(zeroCouponBond, settlementDate);
  cashFlows.forEach((cf, idx) => {
    console.log(
      `  ${idx + 1}. ${cf.date.toLocaleDateString('ko-KR')}: ${formatCashFlow(cf.amount, 'KRW')} (${cf.type})`
    );
  });

  // 2. 경과이자 (무이표채는 0)
  console.log('\n2. 경과이자:');
  const accruedResult = calculateAccruedInterest(zeroCouponBond, settlementDate);
  console.log(
    `  경과이자: ${formatCashFlow(accruedResult.accruedInterest, 'KRW')} (무이표채는 경과이자 없음)`
  );

  // 3. 현재가치 계산
  console.log('\n3. 현재가치 (YTM 3.5%):');
  const pv = calculatePresentValue(zeroCouponBond, settlementDate, ytm);
  console.log(`  현재가치: ${formatCashFlow(pv, 'KRW')}`);

  const yearsToMaturity =
    (zeroCouponBond.maturityDate.getTime() - settlementDate.getTime()) /
    (1000 * 60 * 60 * 24 * 365);
  console.log(`  만기까지: ${yearsToMaturity.toFixed(2)}년`);
  console.log(`  할인율: ${((1 - pv / zeroCouponBond.faceValue) * 100).toFixed(2)}%`);
}

/**
 * 모든 예제 실행
 */
export function runAllExamples() {
  exampleKoreanBond();
  exampleUSBond();
  exampleZeroCouponBond();
}

// 브라우저 콘솔에서 테스트하려면:
// import { runAllExamples } from '@/lib/bond/__example';
// runAllExamples();
