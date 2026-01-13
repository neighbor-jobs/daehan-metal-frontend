import cacheManager from '../utils/cacheManager.ts';

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
    name: item.employeeName,
    pay: item.paymentDetail.pay,
    deductions: item.deductionDetail,
    memo: item.memo && "",
  }));
  console.log('updateCacheAfterCreate', updateEmployees);

  await Promise.all([
    cacheManager.updateEmployees(updateEmployees),
    cacheManager.replacePayrollMemo({date: standardAt, totalMemo}),
    cacheManager.replaceLedgers([...leftLedger, ...rightLedger]),
  ]);
};