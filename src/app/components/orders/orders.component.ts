import { Component, OnInit } from '@angular/core';
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
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;
  
  statusFilter: 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' = 'all';
  searchTerm: string = '';
  
  isLoading = true;
  showDetailView = false;
  
  constructor(private orderService: OrderService) {}
  
  ngOnInit(): void {
    this.loadOrders();
  }
  
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
      }
    });
  }
  
  onFilterChange(): void {
    // Placeholder for future filtering logic
    this.filteredOrders = this.statusFilter === 'all' 
      ? this.orders 
      : this.orders.filter(order => order.status === this.statusFilter);
  }
  
  viewOrderDetails(order: Order): void {
    this.orderService.getOrderById(order.id!).subscribe({
      next: (fullOrder) => {
        this.selectedOrder = fullOrder;
        this.showDetailView = true;
      },
      error: (error) => {
        console.error('Error fetching order details:', error);
      }
    });
  }
  
  closeOrderDetails(): void {
    this.selectedOrder = null;
    this.showDetailView = false;
  }
  
  cancelOrder(orderId: number, event: Event): void {
    event.stopPropagation();
    
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.updateOrder(orderId, { status: 'cancelled' }).subscribe({
        next: (updatedOrder) => {
          // Update the order in the list
          const index = this.orders.findIndex(o => o.id === orderId);
          if (index !== -1) {
            this.orders[index] = updatedOrder;
          }
          
          // Update filtered orders
          const filteredIndex = this.filteredOrders.findIndex(o => o.id === orderId);
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
        }
      });
    }
  }
  
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

  getStatusColor(status: Order['status']): string {
    return this.orderService.getStatusColor(status);
  }
  
  getStatusIcon(status: Order['status']): string {
    return this.orderService.getStatusIcon(status);
  }
  
  formatDate(dateString: string): string {
    return this.orderService.formatDate(dateString);
  }
  
  formatTime(dateString: string): string {
    return this.orderService.formatTime(dateString);
  }
}