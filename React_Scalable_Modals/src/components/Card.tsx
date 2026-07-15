import type { CSSProperties } from "react";
import type { CardProps } from "../types/product.types";
import { useConfirmation } from "../modal/hooks/useConfirmation";



const Card = (props: CardProps) => {
  const { product, onRename } = props;
const { confirm, editProduct } = useConfirmation();


  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(product.price);

  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      type: 'delete' as const,
    });
    if (isConfirmed) {
      console.log(`Deleted product ${product.id}`);
    }
  };


  const handleEdit = async () => {
    const isConfirmed = await confirm({
      title: 'Edit Product',
      message: `Do you want to edit "${product.name}"?`,
      type: 'ask' as const,
    });

    if (!isConfirmed) return;

    const nextName = await editProduct({
      title: `Edit ${product.name}`,
      message: 'Update the product name. Saving asks for one more confirmation on top of this modal.',
      initialValue: product.name,
    });

    if (nextName && nextName !== product.name) {
      onRename(product.id, nextName);
    }
  };


  return (
    <article
      key={product.id}
      className="product"
      style={{ "--product-accent": product.accent } as CSSProperties}
    >
      <div className="product__media" aria-hidden="true">
        <span>{product.name.slice(0, 1)}</span>
      </div>
      <div className="product__body">
        <div className="product__meta">
          <span>{product.category}</span>
          <span>{product.stock} in stock</span>
        </div>
        <h2 className="product__body--title">{product.name}</h2>
        <p className="product__body--desc">{product.description}</p>
        <div className="product__price">{formattedPrice}</div>
      </div>
      <div className="product__footer">
        <button className="product__btn product__btn--edit" onClick={handleEdit}>Edit</button>
        <button className="product__btn product__btn--delete" onClick={handleDelete}>Delete</button>
      </div>
    </article>
  );
};

export default Card;
