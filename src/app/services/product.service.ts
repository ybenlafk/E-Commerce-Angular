import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Category, Product } from '../models/product.type';
import { HttpParams } from '@angular/common/http';
import { finalize } from 'rxjs';
import { environment } from '../../environments/environments';

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

  /**
   * Fetches products using default pagination settings.
   * @param page The current page number.
   * @param limit The number of items per page.
   * @returns The observable result of fetchProductsWithFilters.
   */
  fetchProducts(page: number = 1, limit: number = 6) {
    return this.fetchProductsWithFilters(page, limit);
  }

  /**
   * Fetches a list of available product categories.
   * @returns An observable containing a list of categories.
   */
  fetchCategories() {
    return this.http.get<Category[]>(`${environment.API_URL}/categories`);
  }

  /**
   * Fetches products with optional filters, including pagination, categories, price range, rating, and sorting.
   * @param page The current page number.
   * @param limit The number of items per page.
   * @param categories The list of selected categories for filtering.
   * @param minPrice The minimum price filter.
   * @param maxPrice The maximum price filter.
   * @param minRating The minimum rating filter.
   * @param sortOption The sorting option (e.g., 'priceLowToHigh', 'priceHighToLow', 'popularity').
   */
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

    // Apply category filters
    if (categories && categories.length > 0) {
      categories.forEach((category) => {
        params = params.append('category', category.name);
      });
    }

    // Apply price range filters
    if (minPrice > 0) {
      params = params.set('price_gte', minPrice.toString());
    }
    if (maxPrice < Infinity) {
      params = params.set('price_lte', maxPrice.toString());
    }

    // Apply rating filter
    if (minRating > 0) {
      params = params.set('rating_gte', minRating.toString());
    }

    // Apply sorting options
    switch (sortOption) {
      case 'priceHighToLow':
        params = params.set('_sort', '-price');
        break;
      case 'popularity':
        params = params.set('_sort', 'rating').set('_order', 'desc');
        break;
      case 'priceLowToHigh':
      default:
        params = params.set('_sort', 'price');
        break;
    }

    // Make HTTP request to fetch products with filters
    return this.http
      .get<PaginatedResponse<Product>>(`${environment.API_URL}/products`, {
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

  /**
   * Fetches product details by ID.
   * @param productId The ID of the product to fetch.
   * @returns An observable containing the product details.
   */
  fetchProductById(productId: number) {
    return this.http.get<Product>(
      `${environment.API_URL}/products/${productId}`
    );
  }

  /**
   * Fetches the top 4 rated products within a given category, excluding a specific product ID.
   * @param category The category name to filter products.
   * @param excludeId The product ID to exclude from the results.
   */
  fetchTop4RatedProductsInCategory(category: string, excludeId: number) {
    this.isLoading.set(true);
    this.error.set(null);

    let params = new HttpParams()
      .set('_limit', '5')
      .set('_sort', 'rating')
      .set('_order', 'desc')
      .set('category', category);

    return this.http
      .get<Product[]>(`${environment.API_URL}/products`, { params })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (products) => {
          // Filter out the excluded product and take only the top 4
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
