export interface Market {
  id: number;
  name: string;
  description?: string;
  image?: string;
}

export interface Category {
  id: number;
  name: string;
  image?: string;
  subCategories?: SubCategory[];
}

export interface SubCategory {
  id: number;
  name: string;
  categoryId: number;
  items?: Item[];
}

export interface Item {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  subCategoryId: number;
}

export interface MarketDetail {
  id: number;
  name: string;
  categories: Category[];
}

export interface CategoryDetail {
  id: number;
  name: string;
  subCategories: SubCategory[];
} 