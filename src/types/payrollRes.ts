export interface PayrollData {
  id: string;
  payments: Payment[];
  createdAt: string;
}

export interface Payment {
  id: string;
  employeeName: string;
  employeePosition: string;
  memo?: string;
  paymentDetail: PaymentDetail;
  deductionDetail: DeductionDetail[];
  salary: string;
  deduction: string;
  totalSalary: string;
  createdAt: string;
}

export interface PaymentDetail {
  id: string;
  pay: string;
  workingDay: number;
  hourlyWage: string;
  extendWorkingTime: number;
  dayOffWorkingTime: number;
  extendWokringWage: string;
  dayOffWorkingWage: string;
  annualLeaveAllowance: string;
  multis: Multi;
  mealAllowance: string;
  createdAt: string; // ISO 8601 날짜 문자열
}

export interface DeductionDetail {
  value: string;
  purpose: string;
  additionalProp1?: any; // 현재 null
  additionalProp2?: any; // 현재 null
  additionalProp3?: any; // 현재 null
}

export interface Multi {
  annualLeaveAllowanceMulti: number;
  dayOffWorkingMulti: number;
  extendWorkingMulti: number;
}