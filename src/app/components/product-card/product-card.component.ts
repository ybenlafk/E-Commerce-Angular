import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  @Input() product!: any;
  imageLoaded = false;

  onImageLoad() {
    this.imageLoaded = true;
  }

  getStarWidth(starNumber: number): number {
    const rating = Math.min(this.product.rating, 5);
    const clampedRating = rating - (starNumber - 1);
    return Math.max(0, Math.min(100, clampedRating * 100));
  }
}
