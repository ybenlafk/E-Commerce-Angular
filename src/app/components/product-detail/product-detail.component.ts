import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.type';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { ProductCardComponent } from '../product-card/product-card.component';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit {
  @Input() product!: Product;
  private paramSubscription: any;
  cartService = inject(CartService);
  productService = inject(ProductService);
  products = this.productService.paginatedProducts;
  isLoading = this.productService.isLoading;
  error = this.productService.error;

  selectedImage: string = '';
  quantity: number = 1;
  router = inject(Router);
  route = inject(ActivatedRoute);
  selectedImageLoaded = false;
  thumbnailsLoaded: { [key: string]: boolean } = {};

  onThumbnailLoad(image: string): void {
    this.thumbnailsLoaded = { ...this.thumbnailsLoaded, [image]: true };
  }

  loadProduct(): void {
    this.selectedImage = this.product.images[0];
    this.selectedImageLoaded = false;
    this.thumbnailsLoaded = {};
  }

  goBack() {
    this.router.navigate(['/']);
  }

  ngOnInit(): void {
    this.scrollToTop();

    this.paramSubscription = this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (id) {
            return this.productService.fetchProductById(Number(id));
          } else {
            this.router.navigate(['/']);
            return [];
          }
        })
      )
      .subscribe((product) => {
        this.product = product;
        this.selectedImage = product.images[0];
        this.scrollToTop(); // Scroll again after new data loads
        this.productService.fetchTop4RatedProductsInCategory(
          product.category,
          Number(product.id)
        );
      });
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  selectImage(image: string): void {
    this.selectedImage = image;
    this.selectedImageLoaded = false;
  }

  incrementQuantity(): void {
    if (this.quantity < this.product.stockCount) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    this.cartService.addToCart(this.product, this.quantity);
    this.router.navigate(['/cart']);
  }

  getDiscountPercentage(): number {
    if (this.product.discountPrice) {
      return Math.round(
        ((this.product.price - this.product.discountPrice) /
          this.product.price) *
          100
      );
    }
    return 0;
  }

  getRatingArray(): number[] {
    return Array(5)
      .fill(0)
      .map((_, i) =>
        i < Math.floor(this.product.rating)
          ? 1
          : i < this.product.rating
          ? 0.5
          : 0
      );
  }

  getSpecKeys(): string[] {
    return Object.keys(this.product.specs);
  }

  isSpecArray(spec: any): boolean {
    return Array.isArray(spec);
  }

  getSpecValue(value: string | number | string[]): string[] {
    return Array.isArray(value) ? value : [value.toString()];
  }

  ngOnDestroy(): void {
    if (this.paramSubscription) {
      this.paramSubscription.unsubscribe();
    }
  }
}
