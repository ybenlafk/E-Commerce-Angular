import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  isMobileMenuOpen = signal(false);
  cartService = inject(CartService);
  orderService = inject(OrderService);

  getMobileMenuClasses() {
    return this.isMobileMenuOpen() 
      ? 'translate-x-0' 
      : 'translate-x-full';
  }

  cartCount(): number {
    return this.cartService.getCartItems().length;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update((prev) => !prev);
  }
}
