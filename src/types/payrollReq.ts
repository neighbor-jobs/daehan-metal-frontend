export interface PayrollReq {
  pay: string,
  workingDay?: number,
  extendWorkingTime?: number,
  extendWorkingMulti?: number,
  dayOffWorkingTime?: number,
  dayOffWorkingMulti?: number,
  annualLeaveAllowanceMulti?: number,
  mealAllowance?: string
}