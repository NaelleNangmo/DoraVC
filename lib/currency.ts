import currencyData from '@/data/currencyRates.json';

export type Currency = 'USD' | 'EUR' | 'XAF' | 'CAD' | 'GBP' | 'JPY' | 'AUD';

interface CurrencyRates {
  [key: string]: {
    [key: string]: number;
  };
}

export const convertCurrency = (amount: number, from: Currency, to: Currency): number => {
  if (from === to) return amount;
  
  const rates = currencyData.rates as CurrencyRates;
  const fromRates = rates[from];
  
  if (!fromRates || typeof fromRates[to] !== 'number') {
    console.warn(`Exchange rate not found for ${from} to ${to}`);
    return amount;
  }
  
  return Math.round(amount * fromRates[to] * 100) / 100;
};

export const formatCurrency = (amount: number, currency: Currency): string => {
  const symbols: Record<Currency, string> = {
    USD: '$',
    EUR: '€',
    XAF: 'FCFA',
    CAD: 'CAD$',
    GBP: '£',
    JPY: '¥',
    AUD: 'AUD$'
  };

  const symbol = symbols[currency];
  
  if (currency === 'XAF') {
    return `${amount.toLocaleString()} ${symbol}`;
  }
  
  if (currency === 'JPY') {
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }
  
  return `${symbol}${amount.toLocaleString()}`;
};

export const getCurrencySymbol = (currency: Currency): string => {
  const symbols: Record<Currency, string> = {
    USD: '$',
    EUR: '€',
    XAF: 'FCFA',
    CAD: 'CAD$',
    GBP: '£',
    JPY: '¥',
    AUD: 'AUD$'
  };
  
  return symbols[currency];
};

export const getCurrencyName = (currency: Currency): string => {
  const names: Record<Currency, string> = {
    USD: 'Dollar américain',
    EUR: 'Euro',
    XAF: 'Franc CFA',
    CAD: 'Dollar canadien',
    GBP: 'Livre sterling',
    JPY: 'Yen japonais',
    AUD: 'Dollar australien'
  };
  
  return names[currency];
};

export const getAvailableCurrencies = (): Currency[] => {
  return ['USD', 'EUR', 'XAF', 'CAD', 'GBP', 'JPY', 'AUD'];
};