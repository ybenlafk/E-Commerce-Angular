import { Component, computed, inject } from '@angular/core';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent {
  productService = inject(ProductService);
  currentPage = 1;
  totalPages = this.productService.totalPages.asReadonly();
  totalHomes = this.productService.totalItems.asReadonly();
  pages = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  onPageChange(page: number) {
    this.currentPage = page;
    this.productService.fetchProducts(page);
  }
}
