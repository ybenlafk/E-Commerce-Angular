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

  /**
   * Adds a product to the cart.
   * If the product already exists, its quantity is increased.
   * @param product The product to add.
   * @param quantity The quantity to add (default is 1).
   */
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

  /**
   * Updates the quantity of a product in the cart.
   * @param productId The ID of the product to update.
   * @param quantity The new quantity to set.
   */
  updateQuantity(productId: number, quantity: number): void {
    const item = this.cart.find(
      (item) => Number(item.product.id) === productId
    );
    if (item) {
      item.quantity = quantity;
      this.saveCart();
    }
  }

  /**
   * Removes a product from the cart.
   * @param productId The ID of the product to remove.
   */
  removeFromCart(productId: number): void {
    this.cart = this.cart.filter(
      (item) => Number(item.product.id) !== productId
    );
    this.saveCart();
  }

  /**
   * Calculates the subtotal for a specific product in the cart.
   * @param productId The ID of the product.
   * @returns The subtotal price (product price * quantity).
   */
  getSubtotal(productId: number): number {
    const item = this.cart.find((item) => item.product.id === productId);
    return item ? item.product.price * item.quantity : 0;
  }

  /**
   * Calculates the total price of all products in the cart.
   * @returns The total cart price.
   */
  getTotal(): number {
    return this.cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }

  /**
   * Retrieves all items currently in the cart.
   * @returns The list of cart items.
   */
  getCartItems(): CartItem[] {
    return this.cart;
  }

  /**
   * Clears all items from the cart.
   */
  clearCart(): void {
    this.cart = [];
    this.saveCart();
  }

  /**
   * Loads cart data from localStorage to persist across sessions.
   */
  private loadCart(): void {
    const cart = localStorage.getItem('cart');
    if (cart) {
      this.cart = JSON.parse(cart);
    }
  }

  /**
   * Saves the current cart state to localStorage.
   */
  private saveCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }
}
