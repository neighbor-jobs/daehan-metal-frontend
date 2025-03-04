export enum MenuType {
  RevenueManage = '매출관리',
  PurchaseManage = '매입관리',
  InventoryManage = '품목관리',
  ClientManage = '거래처관리',
}

export const menuTypeArr = Object.entries(MenuType).map(([key, value]) => ({key, value}));

export enum RevenueManageMenuType {
  DailySales ='일별매출현황',
  ClientSales = '거래처별 매출현황',
  ClientSalesSummary = '거래처별 매출집계',
  ItemSales = '품목별 매출현황',
  ItemSalesSummary = '품목별 매출집계',
  ClientOutstandingBalance = '매출처별 미수금현황',
}

export const revenueManageTypeArr = Object.entries(RevenueManageMenuType).map(([key, value]) => ({key, value}));

export enum PurchaseManageMenuType {
  DailyPurchase = '일별매입관리',
  ClientPurchase = '거래처별 매입현황',
  ItemPurchase = '품목별 매입현황',
}

export const purchaseManageTypeArr = Object.entries(PurchaseManageMenuType).map(([key, value]) => ({key, value}));

export enum ClientManageMenuType {
  SalesManage = '매출처관리',
  SupplierManage = '매입처관리',
}

export const clientManageTypeArr = Object.entries(ClientManageMenuType).map(([key, value]) => ({key, value}));