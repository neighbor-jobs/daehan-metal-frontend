
export interface PostPayrollReq {
  payments: PostPayment[];
}

export interface PostPayment {
  employeeId: string;
  employeeName: string;
  employeePosition: string;
  paymentDetail: PostPaymentDetail,
  deductionDetail: PostDeductionDetail[],
  memo?: string;
}

export interface PatchPayment {
  id: string;
  payrollRegisterId: string;
  employeeName: string;
  employeePosition: string;
  paymentDetail: PostPaymentDetail,
  deductionDetail: PostDeductionDetail[],
  memo?: string;
}

export interface PostPaymentDetail {
  pay: string
  workingDay: number | string;
  extendWorkingTime: number | string;
  extendWorkingMulti: number | string;
  dayOffWorkingTime: number | string;
  dayOffWorkingMulti: number | string;
  annualLeaveAllowanceMulti: number | string;
  mealAllowance: string;
}

export interface PostDeductionDetail     {
  purpose: string;
  value: string;
  additionalProp1?: string | null;
  additionalProp2?: string | null;
  additionalProp3?: string | null;
}
