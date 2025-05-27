
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

export interface PostPaymentDetail {
  pay: string
  workingDay: number;
  extendWorkingTime: number;
  extendWorkingMulti: number;
  dayOffWorkingTime: number;
  dayOffWorkingMulti: number;
  annualLeaveAllowanceMulti: number;
  mealAllowance: string;
}

export interface PostDeductionDetail     {
  purpose: string;
  value: string;
  additionalProp1?: string | null;
  additionalProp2?: string | null;
  additionalProp3?: string | null;
}
