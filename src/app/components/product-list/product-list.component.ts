import { Component, signal } from '@angular/core';
import { PaginationComponent } from '../pagination/pagination.component';
import { ProductGridComponent } from '../product-grid/product-grid.component';
import { FilterComponent } from '../filter/filter.component';

@Component({
  selector: 'app-product-list',
  imports: [PaginationComponent, ProductGridComponent, FilterComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent {
  isMobileFiltersVisible = signal(false);

  toggleMobileFilters() {
    this.isMobileFiltersVisible.update((prev) => !prev);

    if (this.isMobileFiltersVisible()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  closeMobileFilters() {
    this.isMobileFiltersVisible.set(false);
    document.body.style.overflow = 'auto';
  }
}
