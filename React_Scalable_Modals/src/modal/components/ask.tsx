import { resolveConfirmation } from '../hooks/useConfirmation';
import type { ModalConfig } from '../types';

interface Props {
  config: ModalConfig;
  onClose: () => void;
}

const AskConfirmation = ({ config, onClose }: Props) => {
  return (
    <div className="card">
      <h2>{config.title || 'Are you sure?'}</h2>
      <p>{config.message || 'This action cannot be undone.'}</p>
      <div className="actions">
        <button className="secondary" onClick={() => { resolveConfirmation(config.id, false); onClose(); }}>No</button>
        <button className="success" onClick={() => { resolveConfirmation(config.id, true); onClose(); }}>Yes</button>
      </div>
    </div>
  );
};

export default AskConfirmation;
