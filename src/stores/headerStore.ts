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
  setSelectedType: (type) => set({ selectedType: type }),
  selectedSubType: null,
  setSelectedSubType: (subType) => set({ selectedSubType: subType }),
}));