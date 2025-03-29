export interface TableColumns<T> {
  id: T;
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: string | string[], numValue?: number) => string;
}

/*
* ==================== 매출관리 ========================
*/
export enum RevenueMainColumn {
  PRODUCT_NAME = 'productName',
  SCALE = 'scale',
  LOCATION_NAMES = 'locationNames',
  QUANTITY = 'quantity',
  RAW_MAT_AMOUNT = 'rawMatAmount',
  MANUFACTURE_AMOUNT = 'manufactureAmount',
  PRODUCT_LENGTH = 'productLength',
}

export enum TransactionRegisterColumn {
  ITEM = 'item',
  SCALE = 'scale',
  COUNT = 'count',
  MATERIAL_PRICE = 'materialPrice',
  MATERIAL_TOTAL_PRICE = 'materialTotalPrice',
  PROCESSING_PRICE = 'processingPrice',
  PROCESSING_TOTAL_PRICE = 'processingTotalPrice',
  TOTAL_AMOUNT = 'totalAmount',
}

export enum DailySalesColumn {
  DATE = 'createdAt',
  COMPANY_NAME = 'companyName',
  PRODUCT_NAME = 'productName',
  SCALE = 'scale',
  QUANTITY = 'quantity',
  RAW_MAT_AMOUNT = 'rawMatAmount',
  MANUFACTURE_AMOUNT = 'manufactureAmount',
  PRODUCT_LENGTH = 'productLength',
}

export enum ClientSalesColumn {
  DATE = 'createdAt',
  PRODUCT_NAME = 'productName',
  SCALE = 'scale',
  QUANTITY = 'quantity',
  TOTAL_RAW_MAT_AMOUNT = 'rawMatAmount',
  TOTAL_MANUFACTURE_AMOUNT = 'manufactureAmount',
  PRODUCT_LENGTH = 'productLength',
}

export enum ClientSalesSummaryColumn {
  COMPANY_NAME = 'companyName',
  TOTAL_RAW_MAT_AMOUNT = 'totalRawMatAmount',
  TOTAL_MANUFACTURE_AMOUNT = 'totalManufactureAmount',
  TOTAL_PAYING_AMOUNT = 'totalPayingAmount',
}

export enum ItemSalesColumn {
  DATE = 'createdAt',
  COMPANY_NAME = 'companyName',
  QUANTITY = 'quantity',
  RAW_MAT_AMOUNT = 'rawMatAmount',
  TOTAL_RAW_MAT_AMOUNT = 'totalRawMatAmount',
  MANUFACTURE_AMOUNT = 'manufactureAmount',
  TOTAL_MANUFACTURE_AMOUNT = 'totalManufactureAmount',
  PRODUCT_LENGTH = 'productLength',
  TOTAL_SALES_AMOUNT = 'totalSalesAmount',
}

export enum ItemSalesSummaryColumn {
  PRODUCT_NAME = 'productName',
  SCALE = 'scale',
  QUANTITY = 'quantity',
  RAW_MAT_AMOUNT = 'rawMatAmount',
  TOTAL_RAW_MAT_AMOUNT = 'totalRawMatAmount',
  MANUFACTURE_AMOUNT = 'manufactureAmount',
  TOTAL_MANUFACTURE_AMOUNT = 'totalManufactureAmount',
  TOTAL_SALES_AMOUNT = 'totalSalesAmount',
}
export enum ClientOutstandingBalanceColumn {
  COMPANY_NAME = 'companyName',
  CARRYOVER_AMOUNT = 'carryoverAmount',
  SALES_AMOUNT = 'salesAmount',
  PAYING_AMOUNT = 'payingAmount',
  OUTSTANDING_AMOUNT = 'outstandingAmount',
  PHONE_NUMBER = 'phoneNumber',
}

/*
* ==================== 거래처관리 ========================
*/

export interface SalesCompanyColumn {
  id: 'companyName' | 'ownerName' | 'phoneNumber' | 'locationNames' | 'fax' | 'address' | 'businessType' | 'businessCategory' | 'businessNumber';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: string | string[]) => string;
}

export enum PurchaseCompanyColumn {
  NAME = 'name',
  PHONE_NUMBER = 'phoneNumber',
  SUB_TEL_NUMBER = 'subTelNumber',
  TEL_NUMBER = 'telNumber',
  BUSINESS_NUMBER = 'businessNumber',
}


/*
* ==================== 품목관리 ========================
*/

export interface ProductMainColumn {
  id: 'productName' | 'scale' | 'unitWeight' | 'stocks' | 'vCut' | 'vCutAmount' | 'productLength';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: string) => string;
}

/*
* ==================== 매입관리 ========================
*/
export interface DailyPurchaseColumn {
  id: 'date' | 'client' | 'productName' | 'scale' | 'count' | 'material-unit-price' | 'material-price' | 'processing-unit-price' | 'processing-price' | 'total-amount' | 'paying-amount' | 'remaining-amount';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: string) => string;
}

export enum ClientPurchasesColumn {
  DATE = 'date',
  PRODUCT_NAME = 'productName',
  SCALE = 'scale',
  COUNT = 'count',
  MATERIAL_UNIT_PRICE = 'materialUnitPrice',
  MATERIAL_PRICE = 'materialPrice',
  PROCESSING_UNIT_PRICE = 'processingUnitPrice',
  PROCESSING_PRICE = 'processingPrice',
  TOTAL_AMOUNT = 'totalAmount',
  PAYING_AMOUNT = 'payingAmount',
  REMAINING_AMOUNT = 'remainingAmount',
}

export enum ClientPurchasesSummaryColumn {
  CLIENT = 'client',
  MATERIAL_PRICE = 'materialPrice',
  PROCESSING_PRICE = 'processingPrice',
  TOTAL_AMOUNT = 'totalAmount',
  PAYING_AMOUNT = 'payingAmount',
  REMAINING_AMOUNT = 'remainingAmount',
}

export enum PurchaseRegisterColumn {
  PRODUCT_NAME = 'productName',
  PRODUCT_PRICE = 'productPrice',
  QUANTITY = 'quantity',
  VAT = 'vat',
  VAT_RATE = 'vatRate',
  IS_PAYING = 'isPaying',
}