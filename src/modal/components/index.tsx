import type { ModalConfig } from '../types';
import AskConfirmation from './ask';
import DeleteConfirmation from './delete';
import EditProductModal from './edit-product';

interface PopupProps {
  config: ModalConfig;
  onClose: () => void;
}

const Popup = ({ config, onClose }: PopupProps) => {
  switch (config.type) {
    case 'delete':
      return <DeleteConfirmation config={config} onClose={onClose} />;
    case 'editProduct':
      return <EditProductModal config={config} onClose={onClose} />;
    case 'ask':
    default:
      return <AskConfirmation config={config} onClose={onClose} />;
  }
};

export default Popup;
