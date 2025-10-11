import { DollarSign } from 'lucide-react';

interface CurrencyToggleProps {
  value: 'KRW' | 'USD';
  onChange: (currency: 'KRW' | 'USD') => void;
}

export default function CurrencyToggle({ value, onChange }: CurrencyToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <DollarSign className="h-4 w-4 text-gray-500" />
      <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
        <button
          onClick={() => onChange('KRW')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            value === 'KRW' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'
          } `}
        >
          원화 (₩)
        </button>
        <button
          onClick={() => onChange('USD')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            value === 'USD' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'
          } `}
        >
          달러 ($)
        </button>
      </div>
    </div>
  );
}
