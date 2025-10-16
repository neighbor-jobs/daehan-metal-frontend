import dayjs from 'dayjs';

export type Choice = {
  quantity: number,
  productName: string,
  scale?: string ,
  unitWeight?: string,
  stocks?: number,
  rawMatAmount: string,
  totalRawMatAmount?: string,
  manufactureAmount: string,
  totalManufactureAmount?: string,
  vCutAmount?: string,
  vCut?: string,
  vatAmount?: string,
  deliveryCharge?: string,
  productLength?: string
};

export type Amount = {
  cachedRawMatAmount: string,
  cachedManufactureAmount: string,
  newRawMatAmount: string | null,       // 재료비
  newManufactureAmount: string | null,  // 가공비
}

export const defaultChoice: Choice = {
  productName: '',
  quantity: 0,
  rawMatAmount: '0',
  manufactureAmount: '0',
  vatAmount: '0',
  deliveryCharge: '0',
};

export const defaultFormData = {
  companyId: '',
  locationName: [] as string[],
  companyName: '',
  payingAmount: '0',
  sequence: 1,
  createdAt: dayjs().format('YYYY-MM-DD'),
};

export const makeDefaultFormData = () => ({
  companyId: '',
  locationName: [] as string[],
  companyName: '',
  payingAmount: '0',
  sequence: 1,
  createdAt: dayjs().format('YYYY-MM-DD'),
});

export const defaultAmount: Amount = {
  cachedRawMatAmount: '0',
  cachedManufactureAmount: '0',
  newRawMatAmount: '0',
  newManufactureAmount: '0',
}