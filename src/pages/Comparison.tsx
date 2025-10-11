import { useState } from 'react';
import LastUpdated from '@/components/Common/LastUpdated';
import CurrencyToggle from '@/components/Common/CurrencyToggle';

export default function Comparison() {
  const [currency, setCurrency] = useState<'KRW' | 'USD'>('KRW');
  const [lastUpdated] = useState(new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">채권 비교</h2>
          <p className="mt-1 text-sm text-gray-600">
            실시간 채권 정보를 비교하고 최적의 투자처를 찾으세요
          </p>
        </div>
        <CurrencyToggle value={currency} onChange={setCurrency} />
      </div>

      <LastUpdated timestamp={lastUpdated} />

      <div className="rounded-lg border border-gray-200 bg-white p-8">
        <div className="text-center text-gray-500">
          <p className="mb-2 text-lg font-medium">채권 비교 테이블 구현 예정</p>
          <p className="text-sm">크롤링된 채권 데이터가 여기에 표시됩니다.</p>
        </div>
      </div>
    </div>
  );
}
