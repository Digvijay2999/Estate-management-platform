export const SUPPORTED_CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'Pound Sterling', symbol: '£' },
];

const BASE_RATES = {
  INR: 1,
  USD: 0.012,
  AED: 0.045,
  EUR: 0.011,
  GBP: 0.0096,
};

export function getPreferredCurrency() {
  const savedCurrency = localStorage.getItem('preferred-currency');
  return savedCurrency || 'INR';
}

export function setPreferredCurrency(currencyCode) {
  const safeCode = String(currencyCode || 'INR').toUpperCase();
  localStorage.setItem('preferred-currency', safeCode);
  return safeCode;
}

export function getPreferredLanguage() {
  return localStorage.getItem('preferred-language') || 'en';
}

export function convertCurrency(amount, fromCurrency = 'INR', toCurrency = getPreferredCurrency()) {
  const numericAmount = Number(amount ?? 0);
  if (!Number.isFinite(numericAmount)) {
    return 0;
  }

  const fromRate = BASE_RATES[fromCurrency] ?? BASE_RATES.INR;
  const toRate = BASE_RATES[toCurrency] ?? BASE_RATES.INR;
  return numericAmount * (toRate / fromRate);
}

export function formatPrice(amount, currencyCode = getPreferredCurrency(), locale = getPreferredLanguage() === 'hi' ? 'hi-IN' : 'en-IN') {
  const numericAmount = Number(amount ?? 0);
  const safeCurrency = String(currencyCode || 'INR').toUpperCase();
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: safeCurrency,
      maximumFractionDigits: 2,
    }).format(convertCurrency(numericAmount, 'INR', safeCurrency));
  } catch (error) {
    return `${safeCurrency} ${numericAmount.toLocaleString(locale)}`;
  }
}
