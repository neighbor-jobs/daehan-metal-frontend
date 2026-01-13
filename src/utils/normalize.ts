/** 급여대장 생성 시 formData 가공 **/
export const normalizePostPayments = (formData: any) =>
  formData.map(p => ({
    ...p,
    deductionDetail: (p.deductionDetail ?? []).filter(
      d => (d.purpose ?? '').trim() !== ''
    ),
    paymentDetail: {
      ...p.paymentDetail,
      workingDay: Number(p.paymentDetail.workingDay) || 0,
      extendWorkingTime: Number(p.paymentDetail.extendWorkingTime) || 0,
      extendWorkingMulti: Number(p.paymentDetail.extendWorkingMulti) || 0,
      dayOffWorkingTime: Number(p.paymentDetail.dayOffWorkingTime) || 0,
      dayOffWorkingMulti: Number(p.paymentDetail.dayOffWorkingMulti) || 0,
      annualLeaveAllowanceMulti: Number(p.paymentDetail.annualLeaveAllowanceMulti) || 0,
      unusedAnnualLeaveAllowance: Number(p.paymentDetail.unusedAnnualLeaveAllowance) || 0,
    },
  }));