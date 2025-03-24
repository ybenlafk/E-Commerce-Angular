import { Component } from '@angular/core';
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
  showMobileFilters = false;
}
