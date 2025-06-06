import Store from 'electron-store';

export interface Ledger {
  memo?: string | null;
  group: string | null;
  value: string | null;
  purpose: string | null;
}

const schema = {
  ledgers: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        memo: {type: ['string', 'null']},
        group: {type: ['string', 'null']},
        value: {type: ['string', 'null']},
        purpose: {type: ['string', 'null']}
      },
      required: ['group', 'value', 'purpose']
    },
    default: [
      {purpose: '급여', value: '0', group: '5일', memo: ''},
      {purpose: '사장님 급여', value: '0', group: '5일', memo: ''},
      {purpose: '회계 사무실', value: '0', group: '5일', memo: '25.1월부터'},
      {purpose: '식대', value: '0', group: '5일', memo: ''},
      {purpose: '용달', value: '0', group: '5일', memo: ''},
      {purpose: '현대보험', value: '0', group: '5일', memo: ''},
      {purpose: '국민연금', value: '0', group: '10일', memo: ''},
      {purpose: '건강보험', value: '0', group: '10일', memo: ''},
      {purpose: '고용산재', value: '0', group: '10일', memo: ''},
      {purpose: '세콤', value: '0', group: '10일', memo: ''},
      {purpose: '정수기', value: '0', group: '10일', memo: ''},
      {purpose: 'LIG암보험', value: '0', group: '10일', memo: ''},
      {purpose: '화재보험', value: '0', group: '10일', memo: ''},
      {purpose: '마이너스 통장', value: '0', group: '5일', memo: ''},
      {purpose: '출국만기보험', value: '0', group: '11~25일', memo: ''},
      {purpose: '3.6.9.12월 분기별 이자', value: '0', group: '5일', memo: ''},
      {purpose: '제네시스 할부금', value: '0', group: '5일', memo: ''},
      {purpose: '대출이자', value: '0', group: '5일', memo: ''},
      {purpose: '삼성화재', value: '0', group: '11~25일', memo: ''},
      {purpose: '통신비', value: '0', group: '11~25일', memo: ''},
      {purpose: '전기료', value: '0', group: '11~25일', memo: ''},
      {purpose: '수도세', value: '0', group: '11~25일', memo: ''},
      {purpose: '갑근세', value: '0', group: '11~25일', memo: ''},
      {purpose: '경조사비', value: '0', group: '5일', memo: '24.3월부터'},
      {purpose: '퇴직연금', value: '0', group: '5일', memo: ''},
      {purpose: '사장님 상해보험', value: '0', group: '5일', memo: ''},
      {purpose: '공기청정기', value: '0', group: '11~25일', memo: ''},
      {purpose: '', value: '', group: '', memo: ''},
      {purpose: '', value: '', group: '', memo: ''},
      {purpose: '', value: '', group: '', memo: ''},
    ]
  }
}

const ledgerStore = new Store({
  schema,
  name: 'ledgers',
  cwd: 'store'
});

// 데이터 조회
export const getLedgers = (): Ledger[] => {
  return ledgerStore.get('ledgers') as Ledger[];
};

// 데이터 추가
export const addLedgers = (ledger: Ledger) => {
  const current = getLedgers();
  ledgerStore.set('ledgers', [...current, ledger]);
};

// 데이터 업데이트
export const updateLedgers = (index: number, newData: Partial<Ledger>) => {
  const current = getLedgers();
  current[index] = {...current[index], ...newData};
  ledgerStore.set('ledgers', current);
};

// 데이터 삭제
export const removeLedgers = (index: number) => {
  const current = getLedgers();
  ledgerStore.set('ledgers', current.filter((_, i) => i !== index));
};