import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Category, Product } from '../models/product.type';
import { HttpParams } from '@angular/common/http';
import { finalize } from 'rxjs';

const API_URL = 'http://localhost:3000';

type PaginatedResponse<T> = {
  data: T[];
  pages: number;
  items: number;
};

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  http = inject(HttpClient);
  isLoading = signal(false);
  error = signal<string | null>(null);
  paginatedProducts = signal<Product[]>([]);
  totalPages = signal<number>(0);
  totalItems = signal<number>(0);

  constructor() {}

  // Original method kept for backward compatibility
  fetchProducts(page: number = 1, limit: number = 6) {
    return this.fetchProductsWithFilters(page, limit);
  }

  // fetch categories
  fetchCategories() {
    return this.http.get<Category[]>(`${API_URL}/categories`);
  }

  // fetch products with filters
  fetchProductsWithFilters(
    page: number = 1,
    limit: number = 6,
    categories: Category[] = [],
    minPrice: number = 0,
    maxPrice: number = Infinity,
    minRating: number = 0,
    sortOption: string = 'priceLowToHigh'
  ) {
    this.isLoading.set(true);
    this.error.set(null);

    let params = new HttpParams()
      .set('_page', page.toString())
      .set('_per_page', limit.toString());

    // Add category filters (if JSON server supports this syntax)
    if (categories && categories.length > 0) {
      categories.forEach((category) => {
        params = params.append('category', category.name);
      });
    }

    // Add price range filters
    if (minPrice > 0) {
      params = params.set('price_gte', minPrice.toString());
    }
    if (maxPrice < Infinity) {
      params = params.set('price_lte', maxPrice.toString());
    }

    // Add rating filter
    if (minRating > 0) {
      params = params.set('rating_gte', minRating.toString());
    }

    switch (sortOption) {
      case 'priceHighToLow':
        params = params.set('_sort', '-price')
        break;
      case 'popularity':
        params = params.set('_sort', 'rating').set('_order', 'desc');
        break;
      case 'priceLowToHigh':
      default:
        params = params.set('_sort', 'price')
        break;
    }
    
    return this.http
      .get<PaginatedResponse<Product>>(`${API_URL}/products`, {
        params,
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.paginatedProducts.set(response.data);
          this.totalPages.set(response.pages);
          this.totalItems.set(response.items);
        },
        error: (error) => {
          this.error.set(error.message);
        },
      });
  }

  // Fetch product details by ID
  fetchProductById(productId: number) {
    return this.http.get<Product>(`${API_URL}/products/${productId}`);
  }

  fetchTop4RatedProductsInCategory(category: string, excludeId: number) {
    this.isLoading.set(true);
    this.error.set(null);

    let params = new HttpParams()
      .set('_limit', '5')
      .set('_sort', 'rating')
      .set('_order', 'desc')
      .set('category', category);

    return this.http
      .get<Product[]>(`${API_URL}/products`, { params })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (products) => {
          const filteredProducts = products
            .filter((product) => Number(product.id) !== excludeId)
            .slice(0, 4);
          this.paginatedProducts.set(filteredProducts);
        },
        error: (error) => {
          this.error.set(error.message);
        },
      });
  }
}
