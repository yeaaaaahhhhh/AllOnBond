export type Currency = 'KRW' | 'USD';
export type BondType = 'coupon' | 'zero';

export interface Bond {
  isin: string;
  name: string;
  issuer: string;
  bondType: BondType;
  currency: Currency;
  faceValue: number;
  couponRate: number;
  couponFrequency: number; // 0 for zero-coupon bonds, 2 for semi-annual, 4 for quarterly
  issueDate: Date;
  maturityDate: Date;
  creditRating?: string;
  yieldToMaturity?: number;
  marketPrice?: number;
}

export interface CashFlow {
  date: Date;
  amount: number;
  type: 'coupon' | 'principal';
}

export interface CalculationResult {
  bond: Bond;
  settlementDate: Date;
  yieldToMaturity: number;
  cleanPrice: number;
  dirtyPrice: number;
  accruedInterest: number;
  bankEquivalentYield: number;
  duration?: number;
  modifiedDuration?: number;
  cashFlows: CashFlow[];
}

export interface TaxCalculation {
  interestIncome: number;
  capitalGain: number;
  interestTax: number;
  capitalGainTax: number;
  totalTaxAmount: number;
  netReturn: number;
  effectiveTaxRate: number;
}
