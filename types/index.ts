// Real API Types based on https://user-new-app-staging.internal.haat.delivery/api/markets/4532

export interface LocalizedName {
  ar: string;
  'en-US': string;
  he: string;
  fr: string;
}

export interface MarketAddress {
  ar: string;
  'en-US': string;
  he: string;
  fr: string;
}

export interface MarketDescription {
  ar: string;
  'en-US': string;
  he: string;
  fr: string;
}

export interface ProductImage {
  id: number;
  priority: number;
  serverImageUrl: string;
  smallImageUrl: string;
  blurhash: string;
  group: number;
}

export interface ProductDiscount {
  discountId: number;
  priceAfterDiscount: number;
  originalPrice: number;
  priceAfterDiscountToPresent: number;
  originalPriceToPresent: number;
  type: number;
  value: number;
  valueToPresent: number;
}

export interface ProductDeal {
  id: number;
  quantity: number;
  price: number;
  limitPerOrder: number;
}

export interface UnitDetails {
  stepSize: number;
  unitType: string;
}

export interface Product {
  name: LocalizedName;
  description: LocalizedName;
  categoryId: number;
  categoryName: any;
  subCategoryId: number;
  unitType: number;
  minUnit: number;
  maxUnit: number;
  unitStep: number;
  productColors: any[];
  productSizes: any[];
  productFeatures: any[];
  marketCategoryId: number;
  marketSubCategoryId: number;
  noVat: boolean;
  quantityType: string;
  unitDetails: UnitDetails | null;
  barcode: string | null;
  productCode: string | null;
  discount: ProductDiscount | null;
  discountsHistories: any[] | null;
  availability: any[];
  productDynamicWeightData: {
    supportDynamicPricing: boolean;
    maxWeightPercentage: number;
  };
  productDeal: ProductDeal | null;
  brandId: number;
  brandName: string | null;
  isCocaColaBrand: boolean;
  productBranchSettings: {
    overridePrice: boolean;
    overrideAvailability: boolean;
    overrideVisibility: boolean;
  };
  baseId: string | null;
  storageSection: string;
  redeemableOptions: any[] | null;
  isRedeemable: boolean;
  shareData: any | null;
  id: number;
  priority: number;
  basePrice: number;
  hide: boolean;
  notAvailable: boolean;
  discountPercentage: number;
  discountPrice: number;
  productImages: ProductImage[];
  supportDynamicPricing: boolean;
  pricePerWeight: number | null;
  avgWeightPerItem: number | null;
  weightToPresent: string | null;
  isBigItem: boolean;
}

export interface MarketSubCategory {
  id: number;
  name: LocalizedName;
  serverImageUrl: string | null;
  smallImageUrl: string | null;
  blurhash: string | null;
  priority: number;
  hide: boolean;
  products: Product[];
  productsCount: number;
  hasDiscount: boolean;
  supportDynamicPricing: boolean;
  discountsHistories: any[] | null;
}

export interface MarketCategory {
  id: number;
  name: LocalizedName;
  serverImageUrl: string | null;
  smallImageUrl: string | null;
  blurhash: string | null;
  priority: number;
  hide: boolean;
  marketSubcategories: MarketSubCategory[];
}

export interface BusinessNotice {
  noticeTitle: LocalizedName;
  noticeMessage: LocalizedName;
  showIcon: boolean;
}

export interface WorkingHourRange {
  fromHour: number;
  toHour: number;
  type: number;
  dayOfWeek: number;
}

export interface BusinessStatus {
  status: number;
  closestWorkingHour: any;
  is24Hour: boolean;
}

export interface MarketDetail {
  id: number;
  name: LocalizedName;
  address: MarketAddress;
  description: MarketDescription;
  iconServerImageUrl: string;
  iconSmallImageUrl: string;
  blurhash: string;
  priority: number;
  status: number;
  discount: number;
  longitude: number;
  latitude: number;
  phoneNumber: string;
  isReady: boolean;
  noDelivery: boolean;
  noPick: boolean;
  noSeat: boolean;
  autoRefreshEnabled: boolean;
  busyExpirationDate: string | null;
  marketCategories: MarketCategory[];
  businessNotice: BusinessNotice;
  popUpList: any[];
  areaId: number;
  currentWorkingHourRange: WorkingHourRange;
  businessStatusInMainPage: BusinessStatus;
}
// Real API Category Detail type
export interface CategoryDetail {
  id: number;
  name: LocalizedName;
  serverImageUrl: string | null;
  smallImageUrl: string | null;
  blurhash: string | null;
  priority: number;
  hide: boolean;
  marketSubcategories: MarketSubCategory[];
  productsCount: number;
  hasDiscount: boolean;
  supportDynamicPricing: boolean;
  discountsHistories: any[] | null;
}

// Legacy types for backward compatibility (keeping the old structure for now)
export interface Category {
  id: number;
  name: string;
  image: string;
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: number;
  name: string;
  categoryId: number;
  items: Item[];
}

export interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  subCategoryId: number;
} 
