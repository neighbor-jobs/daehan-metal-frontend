/** string param 원화 표기 */
export const formatCurrency = (value: string) =>
  new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(Math.floor(Number(value)));

export const formatDecimal = (value: string, digits: number = 3) =>
  Number(value).toFixed(digits);

/** format: YY/MM/DD(요일) */
export const formatDate = (date: Date) => {
  const year = String(date.getFullYear()).slice(2); // 연도 뒤 두 자리
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 월 두 자리
  const day = String(date.getDate()).padStart(2, '0'); // 일 두 자리

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];

  return `${year}/${month}/${day}(${weekday})`;
}

/** 핸드폰/유선번호 입력 포맷팅 */
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

  // 예: 010-1234-5678
  if (digitsOnly.length === 11) {
    return digitsOnly.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }

  if (digitsOnly.length > 11) {
    return digitsOnly.slice(0, 11).replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }

  // 길이 안 맞으면 그대로 반환
  return digitsOnly;
};

/** 사업자번호 입력 포맷팅 */
export const formatBusinessNumber = (input : string): string | null => {
  const digitsOnly = input.replace(/[^0-9]/g, '');

  if (digitsOnly.length !== 10) return null;

  // 포맷팅
  const formatted = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 5)}-${digitsOnly.slice(5)}`;

  // 형식 확인: 000-00-00000
  const isValid = /^\d{3}-\d{2}-\d{5}$/.test(formatted);
  return isValid ? formatted : null;
}

/** 날짜 입력 포맷팅 : 0000-00-00 */
export const formatStringDate = (date: string): string => {
  const digitsOnly = date.replace(/\D/g, ""); // 숫자만 남기기

  if (digitsOnly.length <= 4) {
    // 연도만 입력 중
    return digitsOnly;
  }
  if (digitsOnly.length <= 6) {
    // 연도 + 월 입력 중
    return digitsOnly.replace(/(\d{4})(\d{1,2})/, "$1-$2");
  }
  if (digitsOnly.length <= 8) {
    // 연도 + 월 + 일 입력 중
    return digitsOnly.replace(/(\d{4})(\d{2})(\d{1,2})/, "$1-$2-$3");
  }
  // 8자리 초과 시 앞 8자리만 포맷
  return digitsOnly.slice(0, 8).replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
};

/** 계좌 번호 입력 포맷팅 : 숫자랑 -(하이픈)만 허용 */
export const formatAccountNumber = (accountNumber: string) => {
  return accountNumber.replace(/[^\d-]/g, '');
}

export const formatVatRate = (input: string) => {
  return input + '%';
}

/* 소수점 3자리 유효성 검사 */
export const decimalRegex = /^\d*\.?\d{0,3}$/;

/* 오직 숫자만 허용 */
export const allowOnlyNumber = (value: string) => value.replace(/[^0-9]/g, '');

/* 숫자랑 - 허용 */
export const allowNumberAndHyphen = (value: string) => value.replace(/[^0-9-]/g, '');