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

  ngOnInit(): void {
    this.cartItems.set(this.cartService.getCartItems());
    this.total.set(this.cartService.getTotal());
  }

  incrementQuantity(item: CartItem): void {
    this.cartService.updateQuantity(Number(item.product.id), item.quantity + 1);
    this.total.set(this.cartService.getTotal());
  }

  decrementQuantity(item: CartItem): void {
    this.cartService.updateQuantity(Number(item.product.id), item.quantity - 1);
    this.total.set(this.cartService.getTotal());
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(Number(item.product.id));
    this.total.set(this.cartService.getTotal());
    this.cartItems.set(this.cartService.getCartItems());
  }
}
