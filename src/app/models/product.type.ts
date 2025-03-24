export interface Product {
  id?: number;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  discountPrice: number | null;
  imageUrl: string;
  images: string[];
  category: string;
  rating: number;
  reviews: number;
  stockCount: number;
  specs: Record<string, string | number | string[]>;
  featured: boolean;
}

export interface Category {
  id: number;
  name: string;
  displayName: string;
  description: string;
}
