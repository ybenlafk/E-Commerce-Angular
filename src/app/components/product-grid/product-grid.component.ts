import { Component, inject } from '@angular/core';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-grid',
  imports: [ProductCardComponent],
  templateUrl: './product-grid.component.html',
  styleUrl: './product-grid.component.css',
})
export class ProductGridComponent {
  productService = inject(ProductService);
  products = this.productService.paginatedProducts;
  isLoading = this.productService.isLoading;
  error = this.productService.error;

  ngOnInit(): void {
    this.productService.fetchProducts();
  }
}
