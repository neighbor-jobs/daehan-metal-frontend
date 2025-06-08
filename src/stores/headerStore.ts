import { create } from 'zustand';
import {
  AccountingManageMenuType,
  ClientManageMenuType,
  MenuType,
  PurchaseManageMenuType,
  RevenueManageMenuType
} from '../types/headerMenu.ts';

interface HeaderState {
  selectedType: MenuType | null;
  setSelectedType: (type: MenuType | null) => void;

  selectedSubType: RevenueManageMenuType | PurchaseManageMenuType | ClientManageMenuType | AccountingManageMenuType | null;
  setSelectedSubType: (subType: RevenueManageMenuType | PurchaseManageMenuType | ClientManageMenuType | AccountingManageMenuType | null) => void;

  subNavIdx: number;
  setSubNavIdx: (idx: number) => void;

  setHeaderByPath: (path: string) => void;
}

export const useHeaderStore = create<HeaderState>((set, get) => ({
  selectedType: null,
  setSelectedType: async (type) => {
    set({ selectedType: type });
    await window.ipcRenderer.invoke('set-store', 'selectedType', type);
    // console.log('store에 selected type 저장: ', type);
  },

  selectedSubType: null,
  setSelectedSubType: async (subType) => {
    set({ selectedSubType: subType });
    await window.ipcRenderer.invoke('set-store', 'selectedSubType', subType);
  },

  subNavIdx: 0,
  setSubNavIdx: (idx) => set({ subNavIdx: idx }),

  setHeaderByPath: (path: string) => {
    const { setSelectedType, setSelectedSubType, setSubNavIdx } = get();

    if (path.startsWith('/revenue')) {
      setSelectedType(MenuType.RevenueManage);
      if (path === '/revenue') {
        setSelectedSubType(RevenueManageMenuType.SalesDetail);
        setSubNavIdx(0);
      } else if (path === '/revenue/daily') {
        setSelectedSubType(RevenueManageMenuType.DailySales);
        setSubNavIdx(1);
      } else if (path === '/revenue/client') {
        setSelectedSubType(RevenueManageMenuType.ClientSales);
        setSubNavIdx(2);
      } else if (path === '/revenue/client-summary') {
        setSelectedSubType(RevenueManageMenuType.ClientSalesSummary);
        setSubNavIdx(3);
      } else if (path === '/revenue/item') {
        setSelectedSubType(RevenueManageMenuType.ItemSales);
        setSubNavIdx(4);
      } else if (path === '/revenue/item-summary') {
        setSelectedSubType(RevenueManageMenuType.ItemSalesSummary);
        setSubNavIdx(5);
      } else if (path === '/revenue/client-outstanding') {
        setSelectedSubType(RevenueManageMenuType.ClientOutstandingBalance);
        setSubNavIdx(6);
      }
    } else if (path.startsWith('/purchase')) {
      setSelectedType(MenuType.PurchaseManage);
      if (path === '/purchase') {
        setSelectedSubType(PurchaseManageMenuType.PurchaseDetail);
        setSubNavIdx(0);
      } else if (path === '/purchase/monthly') {
        setSelectedSubType(PurchaseManageMenuType.MonthlyPurchase);
        setSubNavIdx(1);
      }
    } else if (path.startsWith('/client')) {
      setSelectedType(MenuType.ClientManage);
      if (path === '/client/sales') {
        setSelectedSubType(ClientManageMenuType.SalesManage);
        setSubNavIdx(0);
      } else if (path === '/client/purchase') {
        setSelectedSubType(ClientManageMenuType.SupplierManage);
        setSubNavIdx(1);
      }
    } else if (path.startsWith('/account')) {
      setSelectedType(MenuType.AccountingManage);
      if (path === '/account/payroll') {
        setSelectedSubType(AccountingManageMenuType.PayrollDetail);
        setSubNavIdx(0);
      } else if (path === '/account/payroll-new') {
        setSelectedSubType(AccountingManageMenuType.PayrollRegister);
        setSubNavIdx(1);
      } else if (path === '/account/employee') {
        setSelectedSubType(AccountingManageMenuType.EmployeeManage);
        setSubNavIdx(2);
      }
    } else {
      setSelectedType(null);
      setSelectedSubType(null);
    }
  }
}));

if (window.ipcRenderer) {
  window.ipcRenderer.invoke('get-store', 'selectedType').then((type) => {
    useHeaderStore.setState({ selectedType: type });
  });
  window.ipcRenderer.invoke('get-store', 'selectedSubType').then((subType) => {
    useHeaderStore.setState({ selectedSubType: subType });
  });
}
