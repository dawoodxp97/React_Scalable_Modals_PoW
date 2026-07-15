import { useState } from "react";
import type { Product } from "../types/product.types";
import heroImage from "../assets/hero.png";
import { PRODUCTS } from "../utils/product.util";
import Card from "./Card";

const ProductWrapper = () => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);

  const handleRenameProduct = (productId: number, name: string) => {
    setProducts((currentProducts) => {
      return currentProducts.map((product) => {
        if (product.id !== productId) return product;
        return { ...product, name };
      });
    });
  };

  return (
    <main className="catalog-page">
      <section className="catalog-hero">
        //Header component
        <div className="catalog-hero__content">
          <span className="eyebrow">Promise-based modal Demo</span>
          <h1>Product catalog</h1>
          <p>
            Manage products with clean confirmation flows, modern cards, and a
            calmer workspace.
          </p>
        </div>
        <div className="catalog-hero__visual" aria-hidden="true">
          <img src={heroImage} alt="" />
        </div>
      </section>
      <section className="product-wrapper">
        // List of Products
        {products.map((item: Product) => {
          return (
            <Card key={item.id} product={item} onRename={handleRenameProduct} />
          );
        })}
      </section>
    </main>
 )
}

export default ProductWrapper;
