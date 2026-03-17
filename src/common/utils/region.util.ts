export function resolveRegionFromCountry(country?: string): 'USA' | 'EUROPE' {
  const value = (country || '').toUpperCase();

  if (
    value === 'USA' ||
    value === 'us' ||
    value === 'united states' ||
    value === 'america'
  ) {
    return 'USA';
  }

  return 'EUROPE';
}
