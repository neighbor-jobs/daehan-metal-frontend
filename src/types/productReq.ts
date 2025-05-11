export interface PostProduct {
  name: string,
  scale: [string, string, string, string],
  unitWeight?: string,
  stocks: number,
  rawMatAmount?: string,
  manufactureAmount?: string,
  vCutAmount?: string,
  vCut?: string,
  productLength?: string,
}

export interface PatchProductInfo {
  id: string,
  infoId: string,
  productName: string,
  scaleArgs: {
    scaleId: string,
    unitWeight: string | undefined,
    stocks: number | undefined,
    rawMatAmount: string | undefined,
    manufactureAmount: string | undefined,
    vCutAmount: string | undefined,
    vCut: string | undefined,
    productLength: string | undefined,
  }
}