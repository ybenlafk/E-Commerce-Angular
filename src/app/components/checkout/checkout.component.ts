import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { OrderService } from '../../services/order.service';
import {
  OrderItem,
  Address,
  PaymentMethod,
  Order,
} from '../../models/order.type';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Countries, States } from '../../mock/mock-data';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  cartService = inject(CartService);
  orderService = inject(OrderService);
  currentStep = 1;
  cartItems: OrderItem[] = [];
  subtotal = 0;
  shippingCost = 0;
  tax = 0;
  total = 0;

  countries = Countries;
  states = States;

  shippingForm!: FormGroup;
  billingForm!: FormGroup;
  paymentForm!: FormGroup;

  sameBillingAddress = true;

  paymentMethods: {
    type: PaymentMethod['type'];
    label: string;
    icon: string;
  }[] = [
    { type: 'creditCard', label: 'Credit Card', icon: 'credit-card' },
    { type: 'paypal', label: 'PayPal', icon: 'paypal' },
    { type: 'applePay', label: 'Apple Pay', icon: 'apple' },
    { type: 'googlePay', label: 'Google Pay', icon: 'google' },
  ];

  selectedPaymentMethod: PaymentMethod['type'] = 'creditCard';

  isSubmitting = false;
  orderComplete = false;
  orderConfirmation: Order | null = null;
  orderError: string | null = null;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.initForms();

    // Prepare cart items for order
    this.cartItems = this.cartService.getCartItems().map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      imageUrl: item.product.imageUrl,
      unitPrice: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    })) as OrderItem[];

    // Set cart items in OrderService
    this.orderService.setItems(this.cartItems);
    this.updateOrderSummary();
  }

  /**
   * Initializes all form groups for shipping, billing, and payment information
   * with their respective validators
   */
  initForms(): void {
    this.shippingForm = this.fb.group({
      fullName: ['', [Validators.required]],
      streetAddress: ['', [Validators.required]],
      apartment: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: [
        '',
        [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)],
      ],
      country: ['United States', [Validators.required]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)],
      ],
    });

    this.billingForm = this.fb.group({
      fullName: ['', [Validators.required]],
      streetAddress: ['', [Validators.required]],
      apartment: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: [
        '',
        [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)],
      ],
      country: ['United States', [Validators.required]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)],
      ],
    });

    this.paymentForm = this.fb.group({
      type: ['creditCard', [Validators.required]],
      cardNumber: [
        '',
        [Validators.required, Validators.pattern(/^\d{4} \d{4} \d{4} \d{4}$/)],
      ],
      nameOnCard: ['', [Validators.required]],
      expirationDate: [
        '',
        [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)],
      ],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    });
  }

  /**
   * Updates the order summary values (subtotal, shipping, tax, total)
   * by fetching data from OrderService
   */
  updateOrderSummary(): void {
    this.subtotal = this.orderService.getSubtotal();
    this.shippingCost = this.orderService.getShippingCost();
    this.tax = this.orderService.getTaxAmount(this.subtotal);
    this.total = this.orderService.getTotal(
      this.subtotal,
      this.shippingCost,
      this.tax
    );
  }

  /**
   * Advances to the next step in the checkout process
   * Validates current step's form before proceeding
   */
  nextStep(): void {
    if (this.currentStep === 1 && this.shippingForm.valid) {
      if (this.sameBillingAddress) {
        this.billingForm.setValue(this.shippingForm.value);
      }
      this.currentStep++;
    } else if (this.currentStep === 2 && this.billingForm.valid) {
      this.currentStep++;
    }
  }

  /**
   * Returns to the previous step in the checkout process
   */
  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  /**
   * Toggles between using the same address for billing and shipping
   * or entering a separate billing address
   */
  toggleBillingAddress(): void {
    this.sameBillingAddress = !this.sameBillingAddress;
    if (this.sameBillingAddress) {
      this.billingForm.setValue(this.shippingForm.value);
    } else {
      // Reset billing form if user wants to enter different billing address
      this.billingForm.reset({
        country: 'United States',
      });
    }
  }

  /**
   * Selects a payment method and updates the payment form
   * @param method - The payment method type to select
   */
  selectPaymentMethod(method: PaymentMethod['type']): void {
    this.selectedPaymentMethod = method;
    this.paymentForm.patchValue({ type: method });

    // Clear card details if not credit card
    if (method !== 'creditCard') {
      this.paymentForm.patchValue({
        cardNumber: '',
        nameOnCard: '',
        expirationDate: '',
        cvv: '',
      });
    }
  }

  /**
   * Submits the order to the OrderService
   * Handles success and error cases, clears cart on success
   */
  placeOrder(): void {
    if (this.paymentForm.valid || this.selectedPaymentMethod !== 'creditCard') {
      this.isSubmitting = true;
      this.orderError = null;

      const order: Partial<Order> = {
        shippingAddress: this.shippingForm.value as Address,
        billingAddress: this.billingForm.value as Address,
        paymentMethod: {
          type: this.selectedPaymentMethod,
          ...this.paymentForm.value,
        } as PaymentMethod,
        notes: 'Order placed via web checkout',
      };

      this.orderService.placeOrder(order).subscribe({
        next: (confirmation) => {
          this.orderComplete = true;
          this.orderConfirmation = confirmation;
          this.isSubmitting = false;

          // Clear cart after successful order
          this.cartService.clearCart();
        },
        error: (error) => {
          console.error('Error placing order:', error);
          this.isSubmitting = false;
          this.orderError = 'Failed to place order. Please try again.';
        },
      });
    }
  }

  updateExistingOrder(): void {
    if (this.orderConfirmation) {
      const partialUpdate: Partial<Order> = {
        status: 'processing',
        notes: 'Order updated by customer',
      };

      this.orderService
        .updateOrder(Number(this.orderConfirmation.id), partialUpdate)
        .subscribe({
          next: (updatedOrder) => {
            console.log('Order updated:', updatedOrder);
            // Handle successful update (e.g., show success message)
          },
          error: (error) => {
            console.error('Error updating order:', error);
            // Handle update error
          },
        });
    }
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);

    // Format with spaces
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.slice(i, i + 4));
    }

    event.target.value = parts.join(' ');
    this.paymentForm.patchValue({ cardNumber: event.target.value });
  }

  formatPhoneNumber(event: any, formName: 'shipping' | 'billing'): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);

    if (value.length >= 6) {
      value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
    } else if (value.length >= 3) {
      value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }

    event.target.value = value;

    if (formName === 'shipping') {
      this.shippingForm.patchValue({ phoneNumber: value });
    } else {
      this.billingForm.patchValue({ phoneNumber: value });
    }
  }

  formatExpirationDate(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);

    if (value.length >= 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }

    event.target.value = value;
    this.paymentForm.patchValue({ expirationDate: value });
  }

  continueShopping(): void {
    // Navigate back to products page
    this.router.navigate(['/']);
  }

  viewOrder(): void {
    // Navigate to order details page
    if (this.orderConfirmation) {
      this.router.navigate(['/orders']);
    }
  }
}
