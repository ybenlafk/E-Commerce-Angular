import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Order, OrderItem } from '../models/order.type';
import { HttpClient } from '@angular/common/http';
const API_URL = 'http://localhost:3000/orders';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private cartItems: OrderItem[] = [];

  constructor() {}

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + item.subtotal, 0);
  }

  getShippingCost(): number {
    return 10.0;
  }

  getTaxAmount(subtotal: number): number {
    return subtotal * 0.1;
  }

  getTotal(subtotal: number, shipping: number, tax: number): number {
    return subtotal + shipping + tax;
  }

  getItems(): OrderItem[] {
    return this.cartItems;
  }

  setItems(items: OrderItem[]): void {
    this.cartItems = items;
  }

  placeOrder(order: Partial<Order>): Observable<Order> {
    const newOrder: Order = {
      items: this.cartItems,
      shippingAddress: order.shippingAddress!,
      billingAddress: order.billingAddress!,
      paymentMethod: order.paymentMethod!,
      subtotal: this.getSubtotal(),
      shippingCost: this.getShippingCost(),
      tax: this.getTaxAmount(this.getSubtotal()),
      total: this.getTotal(
        this.getSubtotal(),
        this.getShippingCost(),
        this.getTaxAmount(this.getSubtotal())
      ),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: order.notes,
    };

    // Use HttpClient to post the order to the server
    return this.http.post<Order>(API_URL, newOrder);
  }

  updateOrder(orderId: number, updates: Partial<Order>): Observable<Order> {
    // Prepare the update with the current timestamp
    const orderUpdate: Partial<Order> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Use HttpClient to patch (partially update) the order
    return this.http.patch<Order>(`${API_URL}/${orderId}`, orderUpdate);
  }

  // Optional: Fetch all orders
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(API_URL);
  }

  // Optional: Fetch a single order by ID
  getOrderById(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${API_URL}/${orderId}`);
  }

  getStatusColor(status: Order['status']): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: Order['status']): string {
    switch (status) {
      case 'pending':
        return 'clock';
      case 'processing':
        return 'refresh-cw';
      case 'shipped':
        return 'truck';
      case 'delivered':
        return 'check-circle';
      case 'cancelled':
        return 'x-circle';
      default:
        return 'help-circle';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
