import { Product } from './product.type';

export interface CartItem {
  product: Product;
  quantity: number;
}
