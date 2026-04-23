import type {
  AddOnOption,
  KohFeeMenuGroup,
  LehMuhnDrinkType,
  SizeOz,
  StoreId,
} from '../types/menu';

export const SIZE_LABELS: Record<SizeOz, string> = {
  12: 'Tall',
  16: 'Grande',
  22: 'Extra Grande',
};

export const MENU_SIZE_RULES: {
  lehmuhn: Record<LehMuhnDrinkType, SizeOz[]>;
  kohfee: Record<KohFeeMenuGroup, SizeOz[]>;
} = {
  lehmuhn: {
    COLD: [16, 22],
    HOT: [16, 22],
    BLENDED: [16, 22],
    SPARKLING: [16, 22],
  },
  kohfee: {
    COLD: [16, 22],
    HOT: [16, 22],
    BLENDED: [16, 22],
    FOOD: [],
  },
};

export const LEHMUHN_ADD_ONS: AddOnOption[] = [
  // TODO: update extraCost once final pricing is confirmed.
  { id: 'nata-de-coco', name: 'Nata de coco', extraCost: 0 },
  { id: 'lemon', name: 'Lemon', extraCost: 0 },
  { id: 'chia-seeds', name: 'Chia seeds', extraCost: 0 },
];

export function getAllowedSizesByStoreType(
  storeId: StoreId,
  type: LehMuhnDrinkType | KohFeeMenuGroup,
): SizeOz[] {
  if (storeId === 'lehmuhn') {
    return MENU_SIZE_RULES.lehmuhn[type as LehMuhnDrinkType] ?? [];
  }

  return MENU_SIZE_RULES.kohfee[type as KohFeeMenuGroup] ?? [];
}
