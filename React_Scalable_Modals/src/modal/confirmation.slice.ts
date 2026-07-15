import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ConfirmationState, ModalConfig } from './types';

const initialState: ConfirmationState = {
  modals: [],
};

const confirmationSlice = createSlice({
  name: 'confirmation',
  initialState,
  reducers: {
    pushModal: (state, action: PayloadAction<ModalConfig>) => {
      state.modals.push(action.payload);
    },
    popModal: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter((modal) => modal.id !== action.payload);
    },
    updateModal: (state, action: PayloadAction<{ id: string; updates: Partial<ModalConfig> }>) => {
      const modal = state.modals.find((item) => item.id === action.payload.id);
      if (modal) {
        Object.assign(modal, action.payload.updates);
      }
    },
    closeAllModals: (state) => {
      state.modals = [];
    },
  },
});

export const { pushModal, popModal, updateModal, closeAllModals } = confirmationSlice.actions;
export default confirmationSlice.reducer;
