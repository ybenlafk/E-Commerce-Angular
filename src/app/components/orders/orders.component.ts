import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.type';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit {
  orderService = inject(OrderService);
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;

  statusFilter:
    | 'all'
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled' = 'all';
  searchTerm: string = '';

  isLoading = true;
  showDetailView = false;

  /**
   * Initializes the component and loads orders when the component is created
   */
  ngOnInit(): void {
    this.loadOrders();
  }

  /**
   * Fetches all orders from the OrderService and updates the component state
   * Shows loading state during the request and handles errors
   */
  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.filteredOrders = orders;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.isLoading = false;
      },
    });
  }

  /**
   * Filters orders based on the selected status filter
   * Updates the filteredOrders array to show either all orders or only those matching the selected status
   */
  onFilterChange(): void {
    // Placeholder for future filtering logic
    this.filteredOrders =
      this.statusFilter === 'all'
        ? this.orders
        : this.orders.filter((order) => order.status === this.statusFilter);
  }

  /**
   * Fetches and displays detailed information for a specific order
   * @param order - The order object to view details for
   */
  viewOrderDetails(order: Order): void {
    this.orderService.getOrderById(order.id!).subscribe({
      next: (fullOrder) => {
        this.selectedOrder = fullOrder;
        this.showDetailView = true;
      },
      error: (error) => {
        console.error('Error fetching order details:', error);
      },
    });
  }

  /**
   * Closes the order detail view and resets the selected order
   */
  closeOrderDetails(): void {
    this.selectedOrder = null;
    this.showDetailView = false;
  }

  /**
   * Cancels a specific order after user confirmation
   * @param orderId - The ID of the order to cancel
   * @param event - The click event to stop propagation
   */
  cancelOrder(orderId: number, event: Event): void {
    event.stopPropagation();

    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService
        .updateOrder(orderId, { status: 'cancelled' })
        .subscribe({
          next: (updatedOrder) => {
            // Update the order in the list
            const index = this.orders.findIndex((o) => o.id === orderId);
            if (index !== -1) {
              this.orders[index] = updatedOrder;
            }

            // Update filtered orders
            const filteredIndex = this.filteredOrders.findIndex(
              (o) => o.id === orderId
            );
            if (filteredIndex !== -1) {
              this.filteredOrders[filteredIndex] = updatedOrder;
            }

            // Update selected order if it's the same
            if (this.selectedOrder && this.selectedOrder.id === orderId) {
              this.selectedOrder = updatedOrder;
            }
          },
          error: (error) => {
            console.error('Error cancelling order:', error);
            alert('An error occurred while trying to cancel the order.');
          },
        });
    }
  }

  /**
   * Converts payment method type to a more readable format
   * @param type - The payment method type to convert
   * @returns Human-readable payment method name
   */
  getPaymentMethodName(type: string): string {
    switch (type) {
      case 'creditCard':
        return 'Credit Card';
      case 'paypal':
        return 'PayPal';
      case 'applePay':
        return 'Apple Pay';
      case 'googlePay':
        return 'Google Pay';
      default:
        return type;
    }
  }

  /**
   * Gets the color associated with an order status for UI display
   * @param status - The order status to get color for
   * @returns CSS color class or value
   */
  getStatusColor(status: Order['status']): string {
    return this.orderService.getStatusColor(status);
  }

  /**
   * Gets the icon associated with an order status for UI display
   * @param status - The order status to get icon for
   * @returns Icon class or identifier
   */
  getStatusIcon(status: Order['status']): string {
    return this.orderService.getStatusIcon(status);
  }

  /**
   * Formats a date string for display
   * @param dateString - The date string to format
   * @returns Formatted date string
   */
  formatDate(dateString: string): string {
    return this.orderService.formatDate(dateString);
  }

  /**
   * Formats a time string for display
   * @param dateString - The date string containing time to format
   * @returns Formatted time string
   */
  formatTime(dateString: string): string {
    return this.orderService.formatTime(dateString);
  }
}
