import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart.type';
import { Product } from '../models/product.type';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart: CartItem[] = [];

  constructor() {
    this.loadCart();
  }

  // Add product to cart
  addToCart(product: Product, quantity: number = 1): void {
    const existingItem = this.cart.find(
      (item) => item.product.id === product.id
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({ product, quantity });
    }
    this.saveCart();
  }

  // Update product quantity
  updateQuantity(productId: number, quantity: number): void {
    const item = this.cart.find((item) => Number(item.product.id) === productId);
    if (item) {
      item.quantity = quantity;
      this.saveCart();
    }
  }

  // Remove product from cart
  removeFromCart(productId: number): void {
    this.cart = this.cart.filter((item) => Number(item.product.id) !== productId);
    this.saveCart();
  }

  // Calculate subtotal for a product
  getSubtotal(productId: number): number {
    const item = this.cart.find((item) => item.product.id === productId);
    return item ? item.product.price * item.quantity : 0;
  }

  // Calculate total for the entire cart
  getTotal(): number {
    return this.cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }

  // Get all cart items
  getCartItems(): CartItem[] {
    return this.cart;
  }

  // Clear the cart
  clearCart(): void {
    this.cart = [];
    this.saveCart();
  }

  // Load cart from localStorage
  private loadCart(): void {
    const cart = localStorage.getItem('cart');
    if (cart) {
      this.cart = JSON.parse(cart);
    }
  }

  // Save cart to localStorage
  private saveCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }
}
