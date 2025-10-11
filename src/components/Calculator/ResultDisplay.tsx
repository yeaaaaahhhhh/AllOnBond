import { MetricsGrid } from './MetricsCard';
import CashFlowTable from './CashFlowTable';
import type { BondCalculatorResult } from '@/types/calculation';

interface ResultDisplayProps {
  result: BondCalculatorResult;
}

export default function ResultDisplay({ result }: ResultDisplayProps) {
  return (
    <div className="space-y-6">
      <MetricsGrid
        cleanPrice={result.cleanPrice}
        dirtyPrice={result.dirtyPrice}
        accruedInterest={result.accruedInterest}
        ytm={result.yieldToMaturity}
        bankEquivalentYield={result.bankEquivalentYield}
        duration={result.duration}
        modifiedDuration={result.modifiedDuration}
        convexity={result.convexity}
        currency={result.bond.currency}
      />

      <CashFlowTable
        cashFlows={result.cashFlows}
        currency={result.bond.currency}
        ytm={result.yieldToMaturity}
      />
    </div>
  );
}
