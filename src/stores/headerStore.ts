import { create } from 'zustand';
import {ClientManageMenuType, MenuType, PurchaseManageMenuType, RevenueManageMenuType} from '../types/headerMenu.ts';

interface HeaderState {
  selectedType: MenuType | null;
  setSelectedType: (type: MenuType | null) => void;
  selectedSubType: RevenueManageMenuType | PurchaseManageMenuType | ClientManageMenuType | null;
  setSelectedSubType: (subType: RevenueManageMenuType | PurchaseManageMenuType | ClientManageMenuType | null) => void;
}

export const useHeaderStore = create<HeaderState>((set) => ({
  selectedType: null,
  setSelectedType: async (type) => {
    await window.ipcRenderer.invoke('set-store', 'selectedType', type);
    set({ selectedType: type });
  },
  selectedSubType: null,
  setSelectedSubType: async (subType) => {
    await window.ipcRenderer.invoke('set-store', 'selectedSubType', subType);
    set({ selectedSubType: subType });
  },
}));

if (window.ipcRenderer) {
  window.ipcRenderer.invoke('get-store', 'selectedType').then((type) => {
    useHeaderStore.setState({ selectedType: type });
  });
  window.ipcRenderer.invoke('get-store', 'selectedSubType').then((subType) => {
    useHeaderStore.setState({ selectedSubType: subType });
  });
}
