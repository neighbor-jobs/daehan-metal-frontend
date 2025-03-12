export const formatCurrency = (value: string) =>
  new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(Number(value));

export const formatDecimal = (value: string, digits: number = 3) =>
  Number(value).toFixed(digits);
