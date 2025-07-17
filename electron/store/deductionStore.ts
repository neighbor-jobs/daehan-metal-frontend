import Store from 'electron-store';

const schema = {
  deductions: {
    type: 'array',
    items: {
      type: 'string'
    },
    default: [
      '소득세',
      '주민세',
      '건강보험료(요양포함)',
      '국민연금',
      '고용보험',
      '작년연말정산'
    ]
  }
}

const deductionStore = new Store({
  schema,
  name: 'deductions',
  cwd: 'store'
})

export const getDeductions = (): string[] => {
  return deductionStore.get('deductions') as string[]
}

export const replaceDeductions = (newDeductions: string[]): void => {
  deductionStore.set('deductions', newDeductions);
}