export interface RevenueMainColumn {
  id: 'item' | 'size' | 'count' | 'material-price' | 'processing-price' | 'vcut-count' | 'length' | 'unit-price' | 'amount' | 'total-amount' |'paying-amount' ;
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: string) => string;
}

export interface DailySalesColumn {
  id: 'date' | 'client' | 'item' | 'size' | 'count' | 'material-price' | 'processing-price' | 'vcut-count' | 'length' | 'unit-price' | 'total-amount' | 'paying-amount';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: string) => string;
}

export interface ClientSalesColumn {
  id: 'date' | 'item' | 'size' | 'count' | 'material-price' | 'processing-price' | 'vcut-count' | 'length' | 'unit-price' | 'total-amount' | 'received-amount' | 'remaining-amount';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: string) => string;
}

export interface ClientSalesSummaryColumn {
  id: 'client' | 'material-price' | 'processing-price' | 'vcut-processing-price' | 'total-amount' | 'received-amount' | 'remaining-amount';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: string) => string;
}

export interface ItemSalesColumn {
  id: 'date' | 'client' | 'count' | 'material-unit-price' | 'material-price' |'processing-unit-price' | 'processing-price' | 'vcut-count' | 'length' | 'unit-price' | 'vcut-processing-price' | 'total-amount';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: string) => string;
}

export interface ItemSalesSummaryColumn {
  id: 'item' | 'size' | 'count' | 'material-unit-price' | 'material-price' |'processing-unit-price' | 'processing-price' | 'vcut-count' | 'amount';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: string) => string;
}

export interface ClientOutstandingBalanceColumn {
  id: 'client' | 'carryover-amount' | 'sales-amount' | 'paying-amount' |'outstanding-amount' | 'phone-number';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: string) => string;
}