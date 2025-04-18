import { create } from 'zustand';

interface AlertState {
  message: string;
  open: boolean;
  severity: 'error' | 'warning' | 'info' | 'success';
  showAlert: (message: string, severity?: 'error' | 'warning' | 'info' | 'success') => void;
  closeAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  message: '',
  open: false,
  severity: 'info',
  showAlert: (message, severity = 'info') =>
    set({ message, open: true, severity }),
  closeAlert: () => set({ open: false }),
}));