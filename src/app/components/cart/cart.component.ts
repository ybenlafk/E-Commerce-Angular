import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CartItem } from '../../models/cart.type';
import { CartService } from '../../services/cart.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  cartService = inject(CartService);
  cartItems = signal<CartItem[]>([]);
  subtotal = signal<number>(0);
  total = signal<number>(0);

  /**
   * Lifecycle hook that initializes the cart items and total price
   * when the component is loaded.
   */
  ngOnInit(): void {
    this.cartItems.set(this.cartService.getCartItems());
    this.total.set(this.cartService.getTotal());
  }

  /**
   * Increases the quantity of a cart item by 1.
   * @param item The cart item whose quantity needs to be increased.
   */
  incrementQuantity(item: CartItem): void {
    this.cartService.updateQuantity(Number(item.product.id), item.quantity + 1);
    this.total.set(this.cartService.getTotal());
  }

  /**
   * Decreases the quantity of a cart item by 1.
   * If the quantity reaches zero, the item should ideally be removed.
   * @param item The cart item whose quantity needs to be decreased.
   */
  decrementQuantity(item: CartItem): void {
    this.cartService.updateQuantity(Number(item.product.id), item.quantity - 1);
    this.total.set(this.cartService.getTotal());
  }

  /**
   * Removes an item from the cart.
   * @param item The cart item to be removed.
   */
  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(Number(item.product.id));
    this.total.set(this.cartService.getTotal());
    this.cartItems.set(this.cartService.getCartItems());
  }
}
