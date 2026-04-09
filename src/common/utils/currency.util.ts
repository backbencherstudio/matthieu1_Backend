export type SupportedCurrency = 'USD' | 'EUR';

export function resolveCurrencyFromCountry(
  country?: string,
): SupportedCurrency {
  if (!country) return 'EUR';

  const normalized = country.toLowerCase().trim();

  // USA → USD
  if (
    normalized === 'us' ||
    normalized === 'usa' ||
    normalized === 'united states'||
    normalized === 'america'

  ) {
    return 'USD';
  }

  // Rest of the world → EUR
  return 'EUR';
}