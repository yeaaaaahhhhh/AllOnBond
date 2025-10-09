import { useState } from 'react';
import CurrencyToggle from '@/components/UI/CurrencyToggle';
import TaxToggle from '@/components/UI/TaxToggle';

export default function Calculator() {
  const [currency, setCurrency] = useState<'KRW' | 'USD'>('KRW');
  const [includeTax, setIncludeTax] = useState(false);

  return (
    <div className="space-y-6">
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

      <div className="rounded-lg border border-gray-200 bg-white p-8">
        <div className="text-center text-gray-500">
          <p className="mb-2 text-lg font-medium">계산기 구현 예정</p>
          <p className="text-sm">입력 폼과 계산 결과가 여기에 표시됩니다.</p>
        </div>
      </div>
    </div>
  );
}
