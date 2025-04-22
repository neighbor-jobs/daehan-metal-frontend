export interface Product {
  id: string;
  bridgeId: string;
  productName: string;
  info?: ProductInfo;
}

export interface ProductInfo {
  id: string;
  scales: ProductScale[];
}

export interface ProductScale {
  id: string;
  scale: string;
  snapshot?: ProductSnapshot;
}

export interface ProductSnapshot {
  id: string;
  sequence: number;
  manufactureAmount: string;
  vCutAmount?: string;
  rawMatAmount: string;
  productLength?: string;
  stocks: number;
  unitWeight?: string;
  vCut?: string;
  createdAt: string;
}