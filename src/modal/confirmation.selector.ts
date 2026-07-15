import type { RootState } from '../store';

export const selectModals = (state: RootState) => state.confirmation.modals;
