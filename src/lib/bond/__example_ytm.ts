/**
 * YTM 계산 및 듀레이션 계산 예제
 */

import type { Bond } from '@/types/bond';
import {
  calculateBondPrice,
  calculateYTM,
  calculateMacaulayDuration,
  calculateModifiedDuration,
  calculateConvexity,
  compareDepositVsBond,
  formatCashFlow,
} from './index';

// 예제 채권들
const koreanBond: Bond = {
  isin: 'KR103501GC99',
  name: '국고채권 3.5% 2029',
  issuer: '대한민국',
  bondType: 'coupon',
  currency: 'KRW',
  faceValue: 10000,
  couponRate: 3.5,
  couponFrequency: 1,
  issueDate: new Date('2020-09-10'),
  maturityDate: new Date('2029-09-10'),
  creditRating: 'AAA',
};

const usBond: Bond = {
  isin: 'US912810TW15',
  name: 'US Treasury Note 2.5% 2029',
  issuer: 'United States Treasury',
  bondType: 'coupon',
  currency: 'USD',
  faceValue: 1000,
  couponRate: 2.5,
  couponFrequency: 2,
  issueDate: new Date('2019-05-15'),
  maturityDate: new Date('2029-05-15'),
  creditRating: 'AAA',
};

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
 * 예제 1: YTM 계산 (가격 → 수익률)
 */
export function exampleYTMCalculation() {
  console.log('=== YTM 계산 예제 ===\n');

  const settlementDate = new Date('2024-10-10');
  const marketPrice = 9800; // Clean Price

  console.log(`채권: ${koreanBond.name}`);
  console.log(`결제일: ${settlementDate.toLocaleDateString('ko-KR')}`);
  console.log(`시장가격(Clean): ${formatCashFlow(marketPrice, 'KRW')}\n`);

  // YTM 계산
  const ytmResult = calculateYTM(koreanBond, settlementDate, marketPrice);

  console.log('계산 결과:');
  console.log(`  YTM: ${ytmResult.ytm.toFixed(4)}%`);
  console.log(`  방법: ${ytmResult.method}`);
  console.log(`  반복 횟수: ${ytmResult.iterations}`);
  console.log(`  수렴 여부: ${ytmResult.converged ? '성공' : '실패'}`);
  console.log(`  최종 오차: ${ytmResult.error.toFixed(6)}`);

  // 검증: 계산된 YTM으로 가격 역산
  const calculatedPrice = calculateBondPrice(koreanBond, settlementDate, ytmResult.ytm);
  console.log(`\n검증 (YTM으로 가격 역산):`);
  console.log(`  Clean Price: ${formatCashFlow(calculatedPrice.cleanPrice, 'KRW')}`);
  console.log(
    `  오차: ${formatCashFlow(Math.abs(calculatedPrice.cleanPrice - marketPrice), 'KRW')}`
  );
}

/**
 * 예제 2: 가격 계산 (수익률 → 가격)
 */
export function examplePriceCalculation() {
  console.log('\n\n=== 가격 계산 예제 ===\n');

  const settlementDate = new Date('2024-10-10');
  const ytm = 3.2; // 3.2%

  console.log(`채권: ${koreanBond.name}`);
  console.log(`결제일: ${settlementDate.toLocaleDateString('ko-KR')}`);
  console.log(`YTM: ${ytm}%\n`);

  const price = calculateBondPrice(koreanBond, settlementDate, ytm);

  console.log('계산 결과:');
  console.log(`  Clean Price: ${formatCashFlow(price.cleanPrice, 'KRW')}`);
  console.log(`  경과이자: ${formatCashFlow(price.accruedInterest, 'KRW')}`);
  console.log(`  Dirty Price: ${formatCashFlow(price.dirtyPrice, 'KRW')}`);
  console.log(`  가격(%): ${price.pricePercentage.toFixed(4)}%`);
}

/**
 * 예제 3: 듀레이션과 Convexity 계산
 */
export function exampleDurationCalculation() {
  console.log('\n\n=== 듀레이션 & Convexity 예제 ===\n');

  const settlementDate = new Date('2024-10-10');
  const ytm = 3.5;

  console.log(`채권: ${koreanBond.name}`);
  console.log(`YTM: ${ytm}%\n`);

  const macaulayDuration = calculateMacaulayDuration(koreanBond, settlementDate, ytm);
  const modifiedDuration = calculateModifiedDuration(koreanBond, settlementDate, ytm);
  const convexity = calculateConvexity(koreanBond, settlementDate, ytm);

  console.log('계산 결과:');
  console.log(`  Macaulay Duration: ${macaulayDuration.toFixed(4)}년`);
  console.log(`  Modified Duration: ${modifiedDuration.toFixed(4)}년`);
  console.log(`  Convexity: ${convexity.toFixed(4)}`);

  // 금리 변화에 따른 가격 변화 추정
  console.log('\n금리 변화 시 가격 변화 추정:');
  const yieldChange = 0.5; // 50bp 상승
  const price = calculateBondPrice(koreanBond, settlementDate, ytm);

  // Duration만 사용한 추정
  const durationEffect = -modifiedDuration * (yieldChange / 100) * price.cleanPrice;
  console.log(`  금리 ${yieldChange}% 상승 시:`);
  console.log(`    Duration 효과: ${formatCashFlow(durationEffect, 'KRW')}`);

  // Convexity 보정 추가
  const convexityEffect = 0.5 * convexity * Math.pow(yieldChange / 100, 2) * price.cleanPrice;
  console.log(`    Convexity 효과: ${formatCashFlow(convexityEffect, 'KRW')}`);
  console.log(`    총 변화 (추정): ${formatCashFlow(durationEffect + convexityEffect, 'KRW')}`);

  // 실제 가격 변화
  const newPrice = calculateBondPrice(koreanBond, settlementDate, ytm + yieldChange);
  const actualChange = newPrice.cleanPrice - price.cleanPrice;
  console.log(`    실제 변화: ${formatCashFlow(actualChange, 'KRW')}`);
  console.log(
    `    추정 오차: ${formatCashFlow(Math.abs(actualChange - (durationEffect + convexityEffect)), 'KRW')}`
  );
}

/**
 * 예제 4: 무이표채 YTM 계산
 */
export function exampleZeroCouponYTM() {
  console.log('\n\n=== 무이표채 YTM 계산 ===\n');

  const settlementDate = new Date('2024-10-10');
  const marketPrice = 8500; // 할인된 가격

  console.log(`채권: ${zeroCouponBond.name}`);
  console.log(`액면가: ${formatCashFlow(zeroCouponBond.faceValue, 'KRW')}`);
  console.log(`시장가격: ${formatCashFlow(marketPrice, 'KRW')}\n`);

  const ytmResult = calculateYTM(zeroCouponBond, settlementDate, marketPrice);

  console.log('계산 결과:');
  console.log(`  YTM: ${ytmResult.ytm.toFixed(4)}%`);
  console.log(`  방법: ${ytmResult.method} (무이표채는 직접 계산)`);

  const yearsToMaturity =
    (zeroCouponBond.maturityDate.getTime() - settlementDate.getTime()) /
    (1000 * 60 * 60 * 24 * 365);
  const totalReturn = (zeroCouponBond.faceValue - marketPrice) / marketPrice;

  console.log(`\n상세 정보:`);
  console.log(`  만기까지: ${yearsToMaturity.toFixed(2)}년`);
  console.log(`  총 수익률: ${(totalReturn * 100).toFixed(2)}%`);
  console.log(`  할인율: ${((1 - marketPrice / zeroCouponBond.faceValue) * 100).toFixed(2)}%`);
}

/**
 * 예제 5: 예금 vs 채권 비교
 */
export function exampleDepositVsBondComparison() {
  console.log('\n\n=== 예금 vs 채권 비교 ===\n');

  const depositRate = 3.5; // 정기예금 3.5%
  const bondYTM = 3.8; // 채권 YTM 3.8%
  const bondCouponRate = 3.5;
  const bondPrice = 98; // 액면가 대비 98%

  console.log(`정기예금 금리: ${depositRate}%`);
  console.log(`채권 YTM: ${bondYTM}%`);
  console.log(`채권 표면금리: ${bondCouponRate}%`);
  console.log(`채권 가격: ${bondPrice}%\n`);

  const comparison = compareDepositVsBond(depositRate, bondYTM, bondCouponRate, bondPrice);

  console.log('세후 수익률 비교:');
  console.log(`  예금 세후: ${comparison.depositAfterTax.toFixed(4)}%`);
  console.log(`  채권 세후: ${comparison.bondAfterTax.toFixed(4)}%`);
  console.log(`  차이: ${comparison.difference.toFixed(4)}%p`);
  console.log(`  결론: ${comparison.bondAdvantage ? '채권이 유리' : '예금이 유리'}`);

  console.log('\n참고:');
  console.log('  - 예금: 이자소득세 15.4% 과세');
  console.log('  - 채권: 쿠폰 이자 15.4% 과세, 매매차익 비과세(개인 장내)');
}

/**
 * 예제 6: 미국 국채 (반년 지급)
 */
export function exampleUSBondYTM() {
  console.log('\n\n=== 미국 국채 YTM 계산 ===\n');

  const settlementDate = new Date('2024-10-10');
  const marketPrice = 950; // $950

  console.log(`채권: ${usBond.name}`);
  console.log(`쿠폰: ${usBond.couponRate}% (반년 지급)`);
  console.log(`시장가격: ${formatCashFlow(marketPrice, 'USD')}\n`);

  const ytmResult = calculateYTM(usBond, settlementDate, marketPrice);

  console.log('계산 결과:');
  console.log(`  YTM: ${ytmResult.ytm.toFixed(4)}%`);
  console.log(`  반복 횟수: ${ytmResult.iterations}`);

  // 듀레이션 계산
  const duration = calculateModifiedDuration(usBond, settlementDate, ytmResult.ytm);
  console.log(`  Modified Duration: ${duration.toFixed(4)}년`);

  // 가격 검증
  const calculatedPrice = calculateBondPrice(usBond, settlementDate, ytmResult.ytm);
  console.log(`\n가격 검증:`);
  console.log(`  Clean Price: ${formatCashFlow(calculatedPrice.cleanPrice, 'USD')}`);
  console.log(
    `  오차: ${formatCashFlow(Math.abs(calculatedPrice.cleanPrice - marketPrice), 'USD')}`
  );
}

/**
 * 모든 예제 실행
 */
export function runYTMExamples() {
  exampleYTMCalculation();
  examplePriceCalculation();
  exampleDurationCalculation();
  exampleZeroCouponYTM();
  exampleDepositVsBondComparison();
  exampleUSBondYTM();

  console.log('\n\n=== 모든 예제 완료 ===');
  console.log('\n💡 브라우저 개발자 도구에서 테스트하려면:');
  console.log('import { runYTMExamples } from "@/lib/bond/__example_ytm";');
  console.log('runYTMExamples();');
}

// 개별 테스트용 export
export const examples = {
  ytm: exampleYTMCalculation,
  price: examplePriceCalculation,
  duration: exampleDurationCalculation,
  zeroCoupon: exampleZeroCouponYTM,
  comparison: exampleDepositVsBondComparison,
  usBond: exampleUSBondYTM,
};
