import cacheManager from './cacheManager.ts';

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
    },
  }));

/** 급여대장 생성 후 캐시데이터 업데이트 */
export const updateCacheAfterCreate = async ({
                                               formData,
                                               standardAt,
                                               totalMemo,
                                               leftLedger,
                                               rightLedger
                                             }) => {
  const updateEmployees = formData.map((item: any) => ({
    id: item.employeeId,
    pay: item.paymentDetail.pay,
    memo: item.memo && "",
  }));

  await Promise.all([
    cacheManager.updateEmployees(updateEmployees),
    cacheManager.replacePayrollMemo({date: standardAt, totalMemo}),
    cacheManager.replaceLedgers([...leftLedger, ...rightLedger]),
  ]);
};