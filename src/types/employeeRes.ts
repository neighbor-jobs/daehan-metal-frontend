// 직원 기본 정보
export interface Employee {
  id: string;
  bankIds: string[];
  info: EmployeeInfo;
  payments: any[];
  startWorkingAt?: string | null;
  retirementAt?: string | null;
}

// 직원 상세 정보
export interface EmployeeInfo {
  id: string;
  name: string;
  age: number;
  position: string;
  countryCode: string;
  birth?: string | null;
  address?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
}

// 은행 상세 정보