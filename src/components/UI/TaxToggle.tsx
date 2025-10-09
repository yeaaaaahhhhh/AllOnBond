import { Percent } from 'lucide-react';

interface TaxToggleProps {
  value: boolean;
  onChange: (includeTax: boolean) => void;
}

export default function TaxToggle({ value, onChange }: TaxToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <Percent className="h-4 w-4 text-gray-500" />
      <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
        <button
          onClick={() => onChange(false)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            !value ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'
          } `}
        >
          세전
        </button>
        <button
          onClick={() => onChange(true)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            value ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'
          } `}
        >
          세후
        </button>
      </div>
    </div>
  );
}
