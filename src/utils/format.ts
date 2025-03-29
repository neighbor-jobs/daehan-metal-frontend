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

export const formatPhoneNumber = (input: string): string => {
  const digitsOnly = input.replace(/\D/g, ""); // 숫자만 남기기

  if (digitsOnly.length === 9) {
    // 예: 02-123-4567
    return digitsOnly.replace(/(\d{2})(\d{3})(\d{4})/, "$1-$2-$3");
  }

  if (digitsOnly.length === 10) {
    if (digitsOnly.startsWith("02")) {
      // 예: 02-1234-5678
      return digitsOnly.replace(/(\d{2})(\d{4})(\d{4})/, "$1-$2-$3");
    } else {
      // 예: 031-123-4567 (지역번호 3자리)
      return digitsOnly.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    }
  }

  if (digitsOnly.length === 11) {
    // 예: 010-1234-5678
    return digitsOnly.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }

  // 길이 안 맞으면 그대로 반환
  return input;
};

/* 소수점 3자리 유효성 검사 */
export const decimalRegex = /^\d*\.?\d{0,3}$/;
