import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import type { CashFlow, Currency } from '@/types/bond';

interface CashFlowTableProps {
  cashFlows: CashFlow[];
  currency: Currency;
  ytm: number;
}

export default function CashFlowTable({ cashFlows, currency, ytm }: CashFlowTableProps) {
  const formatCurrency = (amount: number) => {
    if (currency === 'KRW') {
      return `₩${amount.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}`;
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  };

  const calculatePresentValue = (amount: number, date: Date, settlementDate: Date) => {
    const yearsToPayment =
      (date.getTime() - settlementDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return amount / Math.pow(1 + ytm / 100, yearsToPayment);
  };

  const settlementDate = cashFlows.length > 0 ? new Date() : new Date();
  const totalCashFlow = cashFlows.reduce((sum, cf) => sum + cf.amount, 0);
  const totalPV = cashFlows.reduce(
    (sum, cf) => sum + calculatePresentValue(cf.amount, cf.date, settlementDate),
    0
  );

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">현금흐름 상세</h3>
        <p className="text-sm text-gray-600">쿠폰 지급일과 원금 상환 일정</p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">번호</TableHead>
              <TableHead>날짜</TableHead>
              <TableHead>유형</TableHead>
              <TableHead className="text-right">금액</TableHead>
              <TableHead className="text-right">현재가치</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cashFlows.map((cf, index) => {
              const pv = calculatePresentValue(cf.amount, cf.date, settlementDate);
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{formatDate(cf.date)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        cf.type === 'coupon'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {cf.type === 'coupon' ? '쿠폰' : '원금'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(cf.amount)}
                  </TableCell>
                  <TableCell className="text-right text-gray-600">{formatCurrency(pv)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="mt-4 flex justify-end space-x-8 border-t pt-4">
        <div className="text-right">
          <p className="text-sm text-gray-600">총 현금흐름</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(totalCashFlow)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">총 현재가치</p>
          <p className="text-lg font-bold text-blue-600">{formatCurrency(totalPV)}</p>
        </div>
      </div>
    </Card>
  );
}
