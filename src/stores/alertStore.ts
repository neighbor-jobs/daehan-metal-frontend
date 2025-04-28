import { create } from 'zustand';

interface AlertState {
  message: string;
  openAlert: boolean;
  severity: 'error' | 'warning' | 'info' | 'success';
  showAlert: (message: string, severity?: 'error' | 'warning' | 'info' | 'success') => void;
  closeAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  message: '',
  openAlert: false,
  severity: 'info',
  showAlert: (message, severity = 'info') =>
    set({ message, openAlert: true, severity }),
  closeAlert: () => set({ openAlert: false }),
}));