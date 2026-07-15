import { useState, type FormEvent } from 'react';
import { resolveEditProduct, useConfirmation } from '../hooks/useConfirmation';
import type { ModalConfig } from '../types';

interface Props {
  config: ModalConfig;
  onClose: () => void;
}

const EditProductModal = ({ config, onClose }: Props) => {
  const [name, setName] = useState(config.initialValue || '');
  const [error, setError] = useState('');
  const { confirm } = useConfirmation();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextName = name.trim();

    if (!nextName) {
      setError('Product name is required.');
      return;
    }

    const isConfirmed = await confirm({
      title: 'Save product changes?',
      message: `Confirm saving "${nextName}". This opens on top of the edit modal and keeps the edit form underneath.`,
      type: 'ask',
    });

    if (isConfirmed) {
      resolveEditProduct(config.id, nextName);
      onClose();
    }
  };

  return (
    <form className="card edit-card" onSubmit={handleSubmit}>
      <h2>{config.title || 'Edit product'}</h2>
      <p>{config.message || 'Update the product details and save your changes.'}</p>

      <label className="field">
        <span>Product name</span>
        <input
          autoFocus
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError('');
          }}
          placeholder="Enter product name"
        />
      </label>

      {error && <div className="field-error">{error}</div>}

      <div className="actions">
        <button type="button" className="secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="success">Save</button>
      </div>
    </form>
  );
};

export default EditProductModal;
