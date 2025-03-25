import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Order, OrderItem } from '../models/order.type';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';

const API_URL = `${environment.API_URL}/orders`;

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private cartItems: OrderItem[] = [];

  constructor() {}

  /**
   * Calculates and returns the subtotal of all items in the cart.
   */
  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + item.subtotal, 0);
  }

  /**
   * Returns a fixed shipping cost.
   */
  getShippingCost(): number {
    return 10.0;
  }

  /**
   * Calculates and returns the tax amount based on the subtotal.
   * @param subtotal The subtotal amount.
   */
  getTaxAmount(subtotal: number): number {
    return subtotal * 0.1;
  }

  /**
   * Calculates and returns the total amount, including subtotal, shipping, and tax.
   * @param subtotal The subtotal amount.
   * @param shipping The shipping cost.
   * @param tax The calculated tax amount.
   */
  getTotal(subtotal: number, shipping: number, tax: number): number {
    return subtotal + shipping + tax;
  }

  /**
   * Returns the list of items currently in the cart.
   */
  getItems(): OrderItem[] {
    return this.cartItems;
  }

  /**
   * Sets the cart items with a new list.
   * @param items The list of order items to set.
   */
  setItems(items: OrderItem[]): void {
    this.cartItems = items;
  }

  /**
   * Places an order by posting the order details to the API.
   * @param order A partial order containing user-inputted details.
   * @returns An observable of the created order.
   */
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

  /**
   * Updates an existing order by sending a partial update to the API.
   * @param orderId The ID of the order to update.
   * @param updates The partial update details.
   * @returns An observable of the updated order.
   */
  updateOrder(orderId: number, updates: Partial<Order>): Observable<Order> {
    // Prepare the update with the current timestamp
    const orderUpdate: Partial<Order> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Use HttpClient to patch (partially update) the order
    return this.http.patch<Order>(
      `${API_URL}/${orderId}`,
      orderUpdate
    );
  }

  /**
   * Fetches all orders from the API.
   * @returns An observable containing the list of all orders.
   */
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(API_URL);
  }

  /**
   * Fetches a single order by ID from the API.
   * @param orderId The ID of the order to fetch.
   * @returns An observable containing the order details.
   */
  getOrderById(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${API_URL}/${orderId}`);
  }

  /**
   * Returns a CSS class for the given order status.
   * @param status The status of the order.
   * @returns A CSS class string for styling the order status.
   */
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

  /**
   * Returns an icon name for the given order status.
   * @param status The status of the order.
   * @returns A string representing an icon name.
   */
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

  /**
   * Formats a date string into a readable format (e.g., "January 1, 2025").
   * @param dateString The date string to format.
   * @returns A formatted date string.
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Formats a time string into a readable format (e.g., "02:30 PM").
   * @param dateString The date string to extract time from.
   * @returns A formatted time string.
   */
  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
