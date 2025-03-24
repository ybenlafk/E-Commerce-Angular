import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
} from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Category } from '../../models/product.type';

@Component({
  selector: 'app-filter',
  imports: [ReactiveFormsModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css',
})
export class FilterComponent implements OnInit {
  productService = inject(ProductService);
  categories = signal<Category[]>([]);

  filterForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      categories: this.buildCategoriesFormArray(),
      priceRange: this.fb.group({
        min: [0],
        max: [1000],
      }),
      ratings: this.fb.group({
        fourStars: [false],
        threeStars: [false],
        twoStars: [false],
        oneStar: [false],
      }),
    });
  }

  ngOnInit() {
    // Fetch categories from the product service
    this.productService.fetchCategories().subscribe((categories) => {
      this.categories.set(categories);
      const categoriesFormArray = this.filterForm.get(
        'categories'
      ) as FormArray;
      categories.forEach(() => {
        categoriesFormArray.push(this.fb.control(false));
      });
    });

    // Listen for form changes with debounce to prevent excessive API calls
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        )
      )
      .subscribe(() => {
        this.applyFilters();
      });

    // Apply initial filter
    this.applyFilters();
  }

  private buildCategoriesFormArray(): FormArray {
    const arr = this.fb.array([]);
    this.categories().forEach(() => {
      arr.push(this.fb.control(false));
    });
    return arr;
  }

  getSelectedCategories(): Category[] {
    const categoriesFormArray = this.filterForm.get('categories') as FormArray;
    return this.categories().filter(
      (_category, index) => categoriesFormArray.at(index).value
    );
  }

  getMinRating(): number {
    const ratings = this.filterForm.get('ratings')?.value;
    if (ratings.fourStars) return 4;
    if (ratings.threeStars) return 3;
    if (ratings.twoStars) return 2;
    if (ratings.oneStar) return 1;
    return 0;
  }

  applyFilters(page: number = 1) {
    const selectedCategories = this.getSelectedCategories();
    const minRating = this.getMinRating();
    const priceRange = this.filterForm.get('priceRange')?.value;

    // Call the product service with the filters
    this.productService.fetchProductsWithFilters(
      page,
      6, // limit
      selectedCategories,
      priceRange.min,
      priceRange.max,
      minRating
    );
  }

  clearFilters() {
    // Reset categories
    const categoriesFormArray = this.filterForm.get('categories') as FormArray;
    categoriesFormArray.controls.forEach((control) => control.setValue(false));

    // Reset price range
    this.filterForm.get('priceRange')?.patchValue({
      min: 0,
      max: 1000,
    });

    // Reset ratings
    this.filterForm.get('ratings')?.patchValue({
      fourStars: false,
      threeStars: false,
      twoStars: false,
      oneStar: false,
    });

    // Reapply filters
    this.applyFilters();
  }

  getStars(count: number): number[] {
    return Array(count).fill(0);
  }
}
