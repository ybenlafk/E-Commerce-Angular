import { HttpClient, HttpInterceptor, HttpRequest, HttpResponse, HttpHandler, HttpEvent } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Category, Product } from '../models/product.type';
import { HttpParams } from '@angular/common/http';
import { finalize, Observable, of } from 'rxjs';
import { environment } from '../../environments/environments';
import { shareReplay, tap } from 'rxjs/operators';

type PaginatedResponse<T> = {
  data: T[];
  pages: number;
  items: number;
};

// Caching Interceptor
@Injectable()
export class CachingInterceptor implements HttpInterceptor {
  private cache = new Map<string, Observable<any>>();
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    const cachedResponse = this.cache.get(req.urlWithParams);
    
    // If cached response exists and is not expired, return it
    if (cachedResponse) {
      return cachedResponse;
    }

    // Otherwise, make the request and cache the response
    const request = next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          this.cache.set(req.urlWithParams, of(event));
          
          // Set timeout to remove cache after specified duration
          setTimeout(() => {
            this.cache.delete(req.urlWithParams);
          }, this.cacheDuration);
        }
      }),
      shareReplay(1)
    );

    this.cache.set(req.urlWithParams, request);
    return request;
  }
}

// Updated Product Service with Caching Support
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

  // Cache configuration
  private categoriesCache$: Observable<Category[]> | null = null;
  private productDetailsCache = new Map<number, Observable<Product>>();

  constructor() {}

  /**
   * Fetches products using default pagination settings with caching.
   * @param page The current page number.
   * @param limit The number of items per page.
   * @returns The observable result of fetchProductsWithFilters.
   */
  fetchProducts(page: number = 1, limit: number = 6) {
    return this.fetchProductsWithFilters(page, limit);
  }

  /**
   * Fetches a list of available product categories with caching.
   * @returns An observable containing a list of categories.
   */
  fetchCategories() {
    // If categories are not already cached, fetch and cache them
    if (!this.categoriesCache$) {
      this.categoriesCache$ = this.http.get<Category[]>(`${environment.API_URL}/categories`).pipe(
        shareReplay(1)
      );
    }
    return this.categoriesCache$;
  }

  /**
   * Fetches products with optional filters, including pagination, categories, price range, rating, and sorting.
   * Note: Due to dynamic nature of filters, this method does not use long-term caching.
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
        params = params.set('_sort', '-rating')
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
   * Fetches product details by ID with caching.
   * @param productId The ID of the product to fetch.
   * @returns An observable containing the product details.
   */
  fetchProductById(productId: number) {
    // Check if product details are already cached
    if (!this.productDetailsCache.has(productId)) {
      const productDetails$ = this.http.get<Product>(
        `${environment.API_URL}/products/${productId}`
      ).pipe(
        shareReplay(1)
      );
      
      this.productDetailsCache.set(productId, productDetails$);
    }
    
    return this.productDetailsCache.get(productId)!;
  }

  /**
   * Fetches the top 4 rated products within a given category, excluding a specific product ID.
   * Note: This method does not use long-term caching due to its dynamic nature.
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

  /**
   * Clear all cached data
   */
  clearCache() {
    this.categoriesCache$ = null;
    this.productDetailsCache.clear();
  }
}