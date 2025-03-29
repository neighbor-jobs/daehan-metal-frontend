export type Choice = {
  bridgeId: string;
  productName: string;
  quantity: string | number;
  productScale: string;
  productScaleSequence: number;
};

export type Amount = {
  cachedRawMatAmount: string,
  cachedManufactureAmount: string,
  newRawMatAmount: string | null,       // 재료비
  newManufactureAmount: string | null,  // 가공비
}

export const defaultChoice: Choice = {
  bridgeId: '',
  productName: '',
  quantity: 0,
  productScale: '',
  productScaleSequence: 1,
};

export const defaultAmount: Amount = {
  cachedRawMatAmount: '0',
  cachedManufactureAmount: '0',
  newRawMatAmount: '0',
  newManufactureAmount: '0',
}