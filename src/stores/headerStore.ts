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
    set({ selectedType: type });
    await window.ipcRenderer.invoke('set-store', 'selectedType', type);
    // console.log('store에 selected type 저장: ', type);
  },
  selectedSubType: null,
  setSelectedSubType: async (subType) => {
    set({ selectedSubType: subType });
    await window.ipcRenderer.invoke('set-store', 'selectedSubType', subType);
  },
}));

if (window.ipcRenderer) {
  window.ipcRenderer.invoke('get-store', 'selectedType').then((type) => {
    useHeaderStore.setState({ selectedType: type });
    // console.log('프로그램 진입 시 selectedType: ', type);
  });
  window.ipcRenderer.invoke('get-store', 'selectedSubType').then((subType) => {
    useHeaderStore.setState({ selectedSubType: subType });
  });
}
