export const CURRENCY_CATALOG = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', countryCode: 'IN', defaultRate: 1 },
  { code: 'USD', name: 'US Dollar', symbol: '$', countryCode: 'US', defaultRate: 0.012 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', countryCode: 'AE', defaultRate: 0.045 },
  { code: 'EUR', name: 'Euro', symbol: '€', countryCode: 'DE', defaultRate: 0.011 },
  { code: 'GBP', name: 'Pound Sterling', symbol: '£', countryCode: 'GB', defaultRate: 0.0096 },
];

export function getDefaultCurrencyCode() {
  return 'INR';
}

export function getCurrencyMeta(currencyCode = getDefaultCurrencyCode()) {
  return CURRENCY_CATALOG.find((currency) => currency.code === String(currencyCode).toUpperCase()) ?? CURRENCY_CATALOG[0];
}

export function resolveCurrencyCodeFromCountry(countryCode = 'IN') {
  const countryMap = {
    IN: 'INR',
    US: 'USD',
    AE: 'AED',
    DE: 'EUR',
    GB: 'GBP',
  };

  return countryMap[String(countryCode).toUpperCase()] ?? getDefaultCurrencyCode();
}

export function convertCurrency(amount, fromCurrency = 'INR', toCurrency = 'INR') {
  const numericAmount = Number(amount ?? 0);
  const from = getCurrencyMeta(fromCurrency);
  const to = getCurrencyMeta(toCurrency);

  if (!Number.isFinite(numericAmount)) {
    return 0;
  }

  return numericAmount * (to.defaultRate / from.defaultRate);
}

export function formatCurrency(amount, currencyCode = getDefaultCurrencyCode(), locale = 'en-IN') {
  const numericAmount = Number(amount ?? 0);
  const currency = getCurrencyMeta(currencyCode);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.code,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}
