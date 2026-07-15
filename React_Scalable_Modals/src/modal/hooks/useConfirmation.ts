import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch } from '../../store-hooks';
import { pushModal } from '../confirmation.slice';
import type { ConfirmationOptions, EditProductOptions, ModalConfig, ModalHandlers } from '../types';

const promiseMap = new Map<string, ModalHandlers>();

export const resolveModal = <T,>(id: string, value: T) => {
  const handlers = promiseMap.get(id);
  if (handlers) {
    handlers.resolve(value);
    promiseMap.delete(id);
  }
};

export const resolveConfirmation = (id: string, value: boolean) => {
  resolveModal(id, value);
};

export const resolveEditProduct = (id: string, value: string | null) => {
  resolveModal(id, value);
};

export const rejectConfirmation = (id: string, reason?: unknown) => {
  const handlers = promiseMap.get(id);
  if (handlers) {
    handlers.reject(reason);
    promiseMap.delete(id);
  }
};

export const resolveAllConfirmations = () => {
  promiseMap.forEach((handlers) => handlers.resolve(handlers.fallbackValue));
  promiseMap.clear();
};

export const useConfirmation = () => {
  const dispatch = useAppDispatch();

  const confirm = useCallback((options: ConfirmationOptions): Promise<boolean> => {
    const id = uuidv4();
    return new Promise<boolean>((resolve, reject) => {
      promiseMap.set(id, { resolve: resolve as (value: unknown) => void, reject, fallbackValue: false });
      const config: ModalConfig = {
        id,
        isOpen: true,
        type: options.type,
        title: options.title,
        message: options.message,
      };
      dispatch(pushModal(config));
    });
  }, [dispatch]);

  const editProduct = useCallback((options: EditProductOptions): Promise<string | null> => {
    const id = uuidv4();
    return new Promise<string | null>((resolve, reject) => {
      promiseMap.set(id, { resolve: resolve as (value: unknown) => void, reject, fallbackValue: null });
      const config: ModalConfig = {
        id,
        isOpen: true,
        type: 'editProduct',
        title: options.title,
        message: options.message,
        initialValue: options.initialValue,
      };
      dispatch(pushModal(config));
    });
  }, [dispatch]);

  return { confirm, editProduct };
};
