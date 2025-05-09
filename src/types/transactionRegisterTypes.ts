export type Choice = {
  quantity: number,
  productName: string,
  scale?: string ,
  unitWeight?: string,
  stocks?: number,
  rawMatAmount: string,
  manufactureAmount: string,
  vCutAmount?: string,
  vCut?: string ,
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
};

export const defaultAmount: Amount = {
  cachedRawMatAmount: '0',
  cachedManufactureAmount: '0',
  newRawMatAmount: '0',
  newManufactureAmount: '0',
}