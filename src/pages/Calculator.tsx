import { useState } from 'react';
import CurrencyToggle from '@/components/Common/CurrencyToggle';
import TaxToggle from '@/components/Common/TaxToggle';
import BondInputForm, { type BondFormData } from '@/components/Calculator/BondInputForm';
import ResultDisplay from '@/components/Calculator/ResultDisplay';
import type { Currency, Bond } from '@/types/bond';
import type { BondCalculatorResult } from '@/types/calculation';
import {
  calculateBondPrice,
  calculateYTM,
  generateCashFlows,
  calculateAccruedInterest,
  calculateMacaulayDuration,
  calculateModifiedDuration,
  calculateConvexity,
  bondYTMToDepositRate,
  type BondPrice,
} from '@/lib/bond';

export default function Calculator() {
  const [currency, setCurrency] = useState<Currency>('KRW');
  const [includeTax, setIncludeTax] = useState(false);
  const [result, setResult] = useState<BondCalculatorResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (formData: BondFormData) => {
    setIsCalculating(true);
    setError(null);

    try {
      const settlementDate = new Date(formData.settlementDate);
      const maturityDate = new Date(formData.maturityDate);

      // Create Bond object
      const bond: Bond = {
        isin: '',
        name: '',
        issuer: '',
        bondType: formData.couponFrequency === 0 ? 'zero' : 'coupon',
        currency,
        faceValue: formData.faceValue,
        couponRate: formData.couponRate / 100, // Convert percentage to decimal
        couponFrequency: formData.couponFrequency,
        issueDate: settlementDate, // Using settlement as issue date for now
        maturityDate,
      };

      let ytm: number;
      let priceResult: BondPrice;

      // Calculate based on input type
      if (formData.inputType === 'yield') {
        // User provided YTM, calculate price
        ytm = formData.inputValue / 100; // Convert percentage to decimal
        priceResult = calculateBondPrice(bond, settlementDate, ytm);
      } else {
        // User provided price, calculate YTM
        const dirtyPrice = formData.inputValue;
        const ytmResult = calculateYTM(bond, settlementDate, dirtyPrice, {
          tolerance: 1e-8,
          maxIterations: 100,
        });

        if (!ytmResult.converged) {
          throw new Error('수익률 계산이 수렴하지 않았습니다. 입력값을 확인해주세요.');
        }

        ytm = ytmResult.ytm;
        priceResult = calculateBondPrice(bond, settlementDate, ytm);
      }

      // Generate cash flows
      const cashFlows = generateCashFlows(bond, settlementDate);

      // Calculate accrued interest
      const accruedInterestResult = calculateAccruedInterest(bond, settlementDate);

      // Calculate duration metrics
      const macaulayDuration = calculateMacaulayDuration(bond, settlementDate, ytm);
      const modifiedDuration = calculateModifiedDuration(bond, settlementDate, ytm);
      const convexity = calculateConvexity(bond, settlementDate, ytm);

      // Calculate bank equivalent yield (deposit rate)
      // TODO: 세금 계산 모듈 완성 후 실제 세후 수익률 사용
      // 현재는 YTM을 세후 수익률로 가정하고 근사 계산
      const afterTaxYieldApprox = ytm * 100 * (1 - 0.154); // 임시: 이자소득세 15.4% 가정
      const bankEquivalentYield = bondYTMToDepositRate(afterTaxYieldApprox) / 100;

      // Prepare result
      const calculatorResult: BondCalculatorResult = {
        bond,
        settlementDate,
        marketPrice: priceResult.dirtyPrice,
        yieldToMaturity: ytm * 100, // Convert to percentage
        accruedInterest: accruedInterestResult.accruedInterest,
        cleanPrice: priceResult.cleanPrice,
        dirtyPrice: priceResult.dirtyPrice,
        bankEquivalentYield: bankEquivalentYield * 100, // Convert to percentage
        duration: macaulayDuration,
        modifiedDuration,
        convexity,
        cashFlows,
      };

      setResult(calculatorResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : '계산 중 오류가 발생했습니다.');
      console.error('Calculation error:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">채권 수익률 계산기</h2>
          <p className="mt-1 text-sm text-gray-600">채권 정보를 입력하여 수익률을 계산하세요</p>
        </div>
        <div className="flex items-center gap-4">
          <CurrencyToggle value={currency} onChange={setCurrency} />
          <TaxToggle value={includeTax} onChange={setIncludeTax} />
        </div>
      </div>

      {/* Layout: Side by side on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <BondInputForm currency={currency} onCalculate={handleCalculate} />

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">계산 오류</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isCalculating && (
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 animate-spin text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">계산 중...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div>
          {result ? (
            <ResultDisplay result={result} />
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">계산 결과가 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">
                좌측 입력 폼에 채권 정보를 입력하고 '계산하기' 버튼을 눌러주세요.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Note */}
      {includeTax && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">세금 계산 기능</h3>
              <div className="mt-2 text-sm text-yellow-700">
                세금 계산 모듈은 현재 개발 중입니다. 현재는 세전 수익률만 표시됩니다.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
