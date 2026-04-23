export type StoreId = 'lehmuhn' | 'kohfee';

export type LehMuhnDrinkType = 'HOT' | 'COLD' | 'BLENDED' | 'SPARKLING';

export type KohFeeMenuGroup = 'COLD' | 'HOT' | 'BLENDED' | 'FOOD';

export type KohFeeSubGroup = 'COFFEE' | 'NON_COFFEE';

export type SizeOz = 12 | 16 | 22;

export interface AddOnOption {
  id: string;
  name: string;
  extraCost: number;
}

interface BaseProduct {
  id: string;
  storeId: StoreId;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  isPremium: boolean;
  isBestSeller: boolean;
  isFanFave: boolean;
  isTrending: boolean;
  priceBySizeOz?: Partial<Record<SizeOz, number>>;
  defaultToppingsLabel?: string;
  defaultToppingsCost?: number;
}

export interface LehmuhnProduct extends BaseProduct {
  storeId: 'lehmuhn';
  drinkType: LehMuhnDrinkType;
  allowedDrinkTypes?: LehMuhnDrinkType[];
  hotOptions?: string[];
  requiresFruitSelection?: {
    min: number;
    max: number;
    options: string[];
  };
}

export interface KohfeeProduct extends BaseProduct {
  storeId: 'kohfee';
  menuGroup: KohFeeMenuGroup;
  subGroup?: KohFeeSubGroup;
  isFood: boolean;
  allowedMenuGroups?: KohFeeMenuGroup[];
}

export type Product = LehmuhnProduct | KohfeeProduct;

export interface CartItem {
  cartItemId: string;
  productId: string;
  storeId: StoreId;
  name: string;
  description: string;
  image: string;
  basePrice: number;
  quantity: number;
  isPremium: boolean;
  isBestSeller?: boolean;
  isFanFave?: boolean;
  isTrending?: boolean;
  selectedSizeOz?: SizeOz;
  selectedDrinkType?: LehMuhnDrinkType;
  selectedMenuGroup?: KohFeeMenuGroup;
  selectedSubGroup?: KohFeeSubGroup;
  addOns: AddOnOption[];
  toppingsRemoved: boolean;
  toppingsLabel?: string;
  toppingsCost?: number;
  selectedHotOption?: string;
  selectedFruits?: string[];
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  hours: string;
  available: boolean;
  brand: StoreId;
  image?: string;
}
