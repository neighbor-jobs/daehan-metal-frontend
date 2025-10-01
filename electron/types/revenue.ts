import {Dayjs} from 'dayjs';

/** 최상위 전체 데이터 */
export interface DailySalesData {
  startAt: Dayjs | string;
  endAt: Dayjs | string;
  dailySalesList: DailySalesListItem[];
  amount: DailySalesAmount;
}

export type DailySalesListItem = DailySalesItem | DailySalesPayingItem;

export interface DailySalesItem {
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
  totalRawMatAmount: number;
  totalManufactureAmount: number;
}

export interface DailySalesPayingItem {
  createdAt: string;
  companyName: string;
  productName: '입금액';
  scale: string;
  payingAmount: string;
}

export interface DailySalesAmount {
  totalManufactureAmount: string;
  totalRawMatAmount: string;
  totalVatAmount: string;
  totalDeliveryCharge: string;
  totalPayingAmount: number;
}