import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { OrdersComponent } from './components/orders/orders.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ProductListComponent,
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
  },
  {
    path: 'cart',
    component: CartComponent,
  },
  {
    path: 'orders',
    component: OrdersComponent
  },
  {
    path: 'product/:id',
    component: ProductDetailComponent,
  }
];
