interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  accent: string;
}

interface CardProps {
  product: Product;
  onRename: (productId: number, name: string) => void;
}

export type { Product, CardProps };
