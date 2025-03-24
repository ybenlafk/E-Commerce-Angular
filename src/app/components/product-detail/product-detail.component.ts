import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.type';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit {
  productService = inject(ProductService);
  @Input() product!: Product;
  selectedImage: string = '';
  quantity: number = 1;
  router = inject(Router);
  route = inject(ActivatedRoute);
  selectedImageLoaded = false;
  thumbnailsLoaded: { [key: string]: boolean } = {};

  onThumbnailLoad(image: string): void {
    // Create new object to trigger change detection
    this.thumbnailsLoaded = { ...this.thumbnailsLoaded, [image]: true };
  }

  // Reset states when product changes (in ngOnInit or wherever you load your product)
  loadProduct(): void {
    // Your existing product loading logic...
    this.selectedImage = this.product.images[0];
    this.selectedImageLoaded = false;
    this.thumbnailsLoaded = {};
  }

  goBack() {
    this.router.navigate(['/']);
  }

  ngOnInit(): void {
    // Fetch product details if not provided
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (id) {
            return this.productService.fetchProductById(Number(id));
          } else {
            // redirect to home if no id is found
            this.router.navigate(['/']);
            return [];
          }
        })
      )
      .subscribe((product) => {
        this.product = product;
        this.selectedImage = product.images[0];
      });
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

  addToCart(): void {}

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
}
