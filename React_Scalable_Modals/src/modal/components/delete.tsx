import { resolveConfirmation } from '../hooks/useConfirmation';
import type { ModalConfig } from '../types';

interface Props {
  config: ModalConfig;
  onClose: () => void;
}

const DeleteConfirmation = ({ config, onClose }: Props) => {
  return (
    <div className="card card-danger">
      <h2>{config.title || 'Delete'}</h2>
      <p>{config.message || 'Are you sure you want to delete this item?'}</p>
      <div className="actions">
        <button className="secondary" onClick={() => { resolveConfirmation(config.id, false); onClose(); }}>Cancel</button>
        <button className="danger" onClick={() => { resolveConfirmation(config.id, true); onClose(); }}>Delete</button>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
