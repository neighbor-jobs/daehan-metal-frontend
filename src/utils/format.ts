/* 원화 표기 */
export const formatCurrency = (value: string) =>
  new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(Number(value));

export const formatDecimal = (value: string, digits: number = 3) =>
  Number(value).toFixed(digits);

export const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
}

export const formatStringList = (data: string[]) => {
  return data.join(', ');
}

/* 소수점 3자리 유효성 검사 */
export const decimalRegex = /^\d*\.?\d{0,3}$/;
