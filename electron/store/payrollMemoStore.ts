import Store from 'electron-store';

export interface CachePayrollMemo {
  date: string;
  memo: string;
}

const defaultMemo: CachePayrollMemo = {
  date: "",
  memo: "",
};

const schema = {
  deductions: {
    type: 'object',
    properties: {
      date: {type: ['string']},
      memo: {type: ['string']},
    },
    default: defaultMemo
  }
};

const payrollMemoStore = new Store({
  schema,
  name: 'payrollMemo',
  cwd: 'store'
});

// 데이터 조회
export const getPayrollMemo = (): CachePayrollMemo => {
  return payrollMemoStore.get('payrollMemo');
};

// 데이터 수정
export const replacePayrollMemo = (newMemo: CachePayrollMemo) => {
  payrollMemoStore.set('payrollMemo', newMemo);
};

// 데이터 삭제
export const removePayrollMemo = () => {
  payrollMemoStore.set('payrollMemo', defaultMemo);
};