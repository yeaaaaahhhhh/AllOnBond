import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Currency } from '@/types/bond';

interface BondInputFormProps {
  currency: Currency;
  onCalculate: (data: BondFormData) => void;
}

export interface BondFormData {
  settlementDate: string;
  maturityDate: string;
  faceValue: number;
  couponRate: number;
  couponFrequency: number;
  inputType: 'price' | 'yield';
  inputValue: number;
}

export default function BondInputForm({ currency, onCalculate }: BondInputFormProps) {
  const [inputType, setInputType] = useState<'price' | 'yield'>('yield');
  const [formData, setFormData] = useState<BondFormData>({
    settlementDate: new Date().toISOString().split('T')[0],
    maturityDate: '',
    faceValue: currency === 'KRW' ? 10000 : 1000,
    couponRate: 0,
    couponFrequency: 2,
    inputType: 'yield',
    inputValue: 0,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BondFormData, string>>>({});

  const handleInputChange = (field: keyof BondFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BondFormData, string>> = {};

    if (!formData.settlementDate) {
      newErrors.settlementDate = '결제일을 입력하세요';
    }

    if (!formData.maturityDate) {
      newErrors.maturityDate = '만기일을 입력하세요';
    } else if (new Date(formData.maturityDate) <= new Date(formData.settlementDate)) {
      newErrors.maturityDate = '만기일은 결제일보다 이후여야 합니다';
    }

    if (formData.faceValue <= 0) {
      newErrors.faceValue = '액면가는 0보다 커야 합니다';
    }

    if (formData.couponRate < 0 || formData.couponRate > 100) {
      newErrors.couponRate = '쿠폰율은 0-100 사이여야 합니다';
    }

    if (![0, 1, 2, 4, 12].includes(formData.couponFrequency)) {
      newErrors.couponFrequency = '올바른 쿠폰 빈도를 선택하세요';
    }

    if (formData.inputValue <= 0) {
      newErrors.inputValue = `${inputType === 'price' ? '가격' : '수익률'}을 입력하세요`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onCalculate({ ...formData, inputType });
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input Type Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">계산 유형</Label>
          <RadioGroup
            value={inputType}
            onValueChange={(value: string) => {
              setInputType(value as 'price' | 'yield');
              handleInputChange('inputType', value);
            }}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="price" id="price" />
              <Label htmlFor="price" className="cursor-pointer font-normal">
                가격 입력 (수익률 계산)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yield" id="yield" />
              <Label htmlFor="yield" className="cursor-pointer font-normal">
                수익률 입력 (가격 계산)
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Settlement Date */}
          <div className="space-y-2">
            <Label htmlFor="settlementDate">
              결제일 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="settlementDate"
              type="date"
              value={formData.settlementDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange('settlementDate', e.target.value)
              }
              className={errors.settlementDate ? 'border-red-500' : ''}
            />
            {errors.settlementDate && (
              <p className="text-sm text-red-500">{errors.settlementDate}</p>
            )}
          </div>

          {/* Maturity Date */}
          <div className="space-y-2">
            <Label htmlFor="maturityDate">
              만기일 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="maturityDate"
              type="date"
              value={formData.maturityDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange('maturityDate', e.target.value)
              }
              className={errors.maturityDate ? 'border-red-500' : ''}
            />
            {errors.maturityDate && <p className="text-sm text-red-500">{errors.maturityDate}</p>}
          </div>

          {/* Face Value */}
          <div className="space-y-2">
            <Label htmlFor="faceValue">
              액면가 ({currency}) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="faceValue"
              type="number"
              value={formData.faceValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange('faceValue', parseFloat(e.target.value))
              }
              className={errors.faceValue ? 'border-red-500' : ''}
              step={currency === 'KRW' ? 1000 : 100}
            />
            {errors.faceValue && <p className="text-sm text-red-500">{errors.faceValue}</p>}
          </div>

          {/* Coupon Rate */}
          <div className="space-y-2">
            <Label htmlFor="couponRate">
              쿠폰율 (%) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="couponRate"
              type="number"
              value={formData.couponRate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange('couponRate', parseFloat(e.target.value))
              }
              className={errors.couponRate ? 'border-red-500' : ''}
              step="0.01"
              min="0"
              max="100"
            />
            {errors.couponRate && <p className="text-sm text-red-500">{errors.couponRate}</p>}
          </div>

          {/* Coupon Frequency */}
          <div className="space-y-2">
            <Label htmlFor="couponFrequency">
              쿠폰 지급 빈도 <span className="text-red-500">*</span>
            </Label>
            <select
              id="couponFrequency"
              value={formData.couponFrequency}
              onChange={(e) => handleInputChange('couponFrequency', parseInt(e.target.value))}
              className={`border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${errors.couponFrequency ? 'border-red-500' : ''}`}
            >
              <option value="0">무이표 (Zero Coupon)</option>
              <option value="1">연 1회</option>
              <option value="2">연 2회 (반기)</option>
              <option value="4">연 4회 (분기)</option>
              <option value="12">연 12회 (월)</option>
            </select>
            {errors.couponFrequency && (
              <p className="text-sm text-red-500">{errors.couponFrequency}</p>
            )}
          </div>

          {/* Input Value (Price or Yield) */}
          <div className="space-y-2">
            <Label htmlFor="inputValue">
              {inputType === 'price' ? `가격 (${currency})` : '수익률 (%)'}
              <span className="text-red-500"> *</span>
            </Label>
            <Input
              id="inputValue"
              type="number"
              value={formData.inputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange('inputValue', parseFloat(e.target.value))
              }
              className={errors.inputValue ? 'border-red-500' : ''}
              step={inputType === 'price' ? (currency === 'KRW' ? 100 : 1) : 0.01}
            />
            {errors.inputValue && <p className="text-sm text-red-500">{errors.inputValue}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" className="w-full md:w-auto">
            계산하기
          </Button>
        </div>
      </form>
    </Card>
  );
}
