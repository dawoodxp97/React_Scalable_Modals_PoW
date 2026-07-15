export type ModalType = 'ask' | 'delete' | 'editProduct';

export interface ModalConfig {
  id: string;
  isOpen: boolean;
  type: ModalType;
  title?: string;
  message?: string;
  initialValue?: string;
}

export interface ConfirmationOptions {
  title?: string;
  message?: string;
  type: Exclude<ModalType, 'editProduct'>;
}

export interface EditProductOptions {
  title?: string;
  message?: string;
  initialValue: string;
}

export interface ConfirmationState {
  modals: ModalConfig[];
}

export interface ModalHandlers {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  fallbackValue: unknown;
}
