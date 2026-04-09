export function resolveRegionFromCountry(country?: string): 'USA' | 'EUROPE' {
  const value = (country || '').toUpperCase().trim();

  if (
    value === 'USA' ||
    value === 'US' ||
    value === 'UNITED STATES' ||
    value === 'AMERICA'
  ) {
    return 'USA';
  }

  return 'EUROPE';
}
