/* 일별매출현황 */
export interface DailySalesResData {
  receipts: DailySalesReceiptItem[];
  totalManufactureAmount?: string;
  totalRawMatAmount?: string;
  totalDeliveryCharge?: string;
  totalVatAmount?: string;
}

export interface DailySalesReceiptItem {
  reports: DailySalesReportsItem[];
  payingAmount: string;
}

export interface DailySalesReportsItem {
  companyName: string;
  manufactureAmount: string;
  rawMatAmount: string;
  productLength?: string;
  productName: string;
  quantity: number;
  scale: string;
  vCut?: string;
  vCutAmount?: string;
  vatAmount: string;
  deliveryCharge: string;
  createdAt: string;
  locationNames?: string[];
}