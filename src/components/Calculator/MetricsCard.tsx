import { Card } from '@/components/ui/card';
import type { Currency } from '@/types/bond';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  currency?: Currency;
  isPercentage?: boolean;
  tooltip?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  currency,
  isPercentage = false,
  tooltip,
}: MetricCardProps) {
  const formatValue = () => {
    if (typeof value === 'number') {
      if (isPercentage) {
        return `${value.toFixed(4)}%`;
      }
      if (currency === 'KRW') {
        return `₩${value.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}`;
      }
      if (currency === 'USD') {
        return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      return value.toFixed(4);
    }
    return value;
  };

  return (
    <Card className="p-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {tooltip && (
            <span className="cursor-help text-xs text-gray-400" title={tooltip}>
              ⓘ
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-gray-900">{formatValue()}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </Card>
  );
}

interface MetricsGridProps {
  cleanPrice: number;
  dirtyPrice: number;
  accruedInterest: number;
  ytm: number;
  bankEquivalentYield: number;
  duration: number;
  modifiedDuration: number;
  convexity: number;
  currency: Currency;
}

export function MetricsGrid({
  cleanPrice,
  dirtyPrice,
  accruedInterest,
  ytm,
  bankEquivalentYield,
  duration,
  modifiedDuration,
  convexity,
  currency,
}: MetricsGridProps) {
  return (
    <div className="space-y-6">
      {/* Price & Yield Section */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-gray-900">가격 및 수익률</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Clean Price"
            value={cleanPrice}
            subtitle="경과이자 제외"
            currency={currency}
            tooltip="경과이자가 제외된 채권 가격"
          />
          <MetricCard
            title="Dirty Price"
            value={dirtyPrice}
            subtitle="경과이자 포함"
            currency={currency}
            tooltip="경과이자가 포함된 실제 거래 가격"
          />
          <MetricCard
            title="경과이자"
            value={accruedInterest}
            currency={currency}
            tooltip="마지막 쿠폰 지급일 이후 누적된 이자"
          />
          <MetricCard
            title="만기수익률 (YTM)"
            value={ytm}
            isPercentage
            tooltip="만기까지 보유 시 예상되는 연간 수익률"
          />
          <MetricCard
            title="예금환산수익률"
            value={bankEquivalentYield}
            isPercentage
            tooltip="단리 예금으로 환산한 수익률"
          />
        </div>
      </div>

      {/* Risk Metrics Section */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-gray-900">리스크 지표</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="듀레이션"
            value={duration}
            subtitle="맥컬레이 듀레이션"
            tooltip="채권의 평균 현금흐름 회수기간 (단위: 년)"
          />
          <MetricCard
            title="수정듀레이션"
            value={modifiedDuration}
            tooltip="금리 1% 변동 시 채권 가격 변화율"
          />
          <MetricCard
            title="볼록성 (Convexity)"
            value={convexity}
            tooltip="금리 변동에 따른 듀레이션의 변화율"
          />
        </div>
      </div>
    </div>
  );
}
