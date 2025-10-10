import type { Bond, CashFlow, TaxCalculation } from './bond';

export interface BondCalculatorInput {
  bond: Bond;
  inputType: 'price' | 'yield';
  inputValue: number;
  settlementDate: Date;
  includeTax: boolean;
  targetCurrency: 'KRW' | 'USD';
}

export interface BondCalculatorResult {
  bond: Bond;
  settlementDate: Date;
  marketPrice: number;
  yieldToMaturity: number;
  accruedInterest: number;
  cleanPrice: number;
  dirtyPrice: number;
  bankEquivalentYield: number;
  duration: number;
  modifiedDuration: number;
  cashFlows: CashFlow[];
  taxCalculation?: TaxCalculation;
}

export type SortDirection = 'asc' | 'desc';

export interface BondFilter {
  currency?: 'KRW' | 'USD' | 'ALL';
  minYield?: number;
  maxYield?: number;
  minMaturity?: Date;
  maxMaturity?: Date;
  issuer?: string;
  creditRating?: string[];
}
