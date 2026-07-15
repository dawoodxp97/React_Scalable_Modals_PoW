import { useCallback, useEffect, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useAppDispatch, useAppSelector } from '../store-hooks';
import { closeAllModals, popModal } from './confirmation.slice';
import { selectModals } from './confirmation.selector';
import { resolveAllConfirmations, resolveConfirmation, resolveEditProduct } from './hooks/useConfirmation';
import Popup from './components';
import type { ModalConfig } from './types';

const BASE_Z_INDEX = 1000;

const ModalRenderer = () => {
  const dispatch = useAppDispatch();
  const modals = useAppSelector(selectModals);
  const topModal = modals.at(-1);

  const dismissModal = useCallback((modal: ModalConfig) => {
    if (modal.type === 'editProduct') {
      resolveEditProduct(modal.id, null);
    } else {
      resolveConfirmation(modal.id, false);
    }
    dispatch(popModal(modal.id));
  }, [dispatch]);

  useEffect(() => {
    if (!topModal) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dismissModal(topModal);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dismissModal, topModal]);

  useEffect(() => {
    return () => {
      resolveAllConfirmations();
      dispatch(closeAllModals());
    };
  }, [dispatch]);

  if (modals.length === 0) return null;

  return createPortal(
    <div className="modal-backdrop">
      {modals.map((modal, index) => (
        <div
          key={modal.id}
          className={`modal-layer ${index === modals.length - 1 ? 'modal-layer--top' : ''}`}
          style={getLayerStyle(index, modals.length)}
          onClick={() => {
            if (index === modals.length - 1) {
              dismissModal(modal);
            }
          }}
        >
          <div
            className="modal-content"
            role="dialog"
            aria-modal={index === modals.length - 1}
            aria-label={modal.title || 'Confirmation dialog'}
            onClick={(e) => e.stopPropagation()}
          >
            <Popup config={modal} onClose={() => dismissModal(modal)} />
          </div>
        </div>
      ))}
    </div>,
    document.body
  );
};

const getLayerStyle = (index: number, totalModals: number): CSSProperties => {
  const depth = totalModals - 1 - index;
  const isTopModal = depth === 0;

  return {
    zIndex: BASE_Z_INDEX + index,
    opacity: Math.max(0.62, 1 - depth * 0.16),
    pointerEvents: isTopModal ? 'auto' : 'none',
    transform: `translateY(${-18 * depth}px) scale(${Math.max(0.9, 1 - depth * 0.04)})`,
  };
};

export default ModalRenderer;
