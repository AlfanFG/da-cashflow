import { create } from 'zustand';
import { type TransactionModalState } from '../types';

interface AppState {
  transactionModal: TransactionModalState & {
    openModal: (type: TransactionModalState['type']) => void;
    closeModal: () => void;
  };
}

export const useAppStore = create<AppState>((set) => ({
  transactionModal: {
    isOpen: false,
    type: 'EXPENSE',
    openModal: (type) =>
      set((state) => ({ transactionModal: { ...state.transactionModal, isOpen: true, type } })),
    closeModal: () =>
      set((state) => ({ transactionModal: { ...state.transactionModal, isOpen: false } })),
  },
}));
