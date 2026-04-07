/**
 * Firestore seed utility.
 * Call seedFirestore() once from the browser console or a dev-only button
 * to populate Firestore with the app's existing static data (stores, branches, products).
 *
 * Usage:  import { seedFirestore } from '../services/seed';  seedFirestore();
 */
import { seedDocument } from './firestore';
import { branches, products } from '../components/data';
import type { Product, LehmuhnProduct, KohfeeProduct } from '../types/menu';

function getCategoryId(p: Product): string {
  if (p.storeId === 'lehmuhn') {
    const lp = p as LehmuhnProduct;
    const map: Record<string, string> = { HOT: 'hot', COLD: 'cold', BLENDED: 'blended', SPARKLING: 'sparkling' };
    return map[lp.drinkType] ?? 'cold';
  }
  const kp = p as KohfeeProduct;
  const map: Record<string, string> = { HOT: 'kf-hot', COLD: 'kf-cold', BLENDED: 'kf-blended', FOOD: 'kf-food' };
  return map[kp.menuGroup] ?? 'kf-hot';
}

function buildMeta(p: Product): Record<string, unknown> {
  const base: Record<string, unknown> = {
    id: p.id,
    storeId: p.storeId,
    name: p.name,
    description: p.description,
    basePrice: p.basePrice,
    image: p.image,
    isPremium: p.isPremium,
  };
  if (p.priceBySizeOz) base.priceBySizeOz = p.priceBySizeOz;
  if (p.defaultToppingsLabel) base.defaultToppingsLabel = p.defaultToppingsLabel;
  if (p.defaultToppingsCost !== undefined) base.defaultToppingsCost = p.defaultToppingsCost;

  if (p.storeId === 'lehmuhn') {
    const lp = p as LehmuhnProduct;
    base.drinkType = lp.drinkType;
    if (lp.allowedDrinkTypes) base.allowedDrinkTypes = lp.allowedDrinkTypes;
    if (lp.hotOptions) base.hotOptions = lp.hotOptions;
    if (lp.requiresFruitSelection) base.requiresFruitSelection = lp.requiresFruitSelection;
  } else {
    const kp = p as KohfeeProduct;
    base.menuGroup = kp.menuGroup;
    base.isFood = kp.isFood;
    if (kp.subGroup) base.subGroup = kp.subGroup;
    if (kp.allowedMenuGroups) base.allowedMenuGroups = kp.allowedMenuGroups;
  }

  return base;
}

export async function seedFirestore() {
  console.log('[Seed] Starting Firestore seed…');

  // ─── Stores ──────────────────────────────────────────────────────
  await seedDocument('stores', 'lehmuhn', {
    storeId: 'lehmuhn',
    storeName: "Leh'-muhn",
    storeDescription: 'Fresh lemon-based beverages',
    logoURL: '/beyond-jc-group-opc-logo.svg',
  });

  await seedDocument('stores', 'kohfee', {
    storeId: 'kohfee',
    storeName: 'Kohfee',
    storeDescription: 'Premium coffee blends',
    logoURL: '/beyond-jc-group-opc-logo.svg',
  });

  // ─── Branches ────────────────────────────────────────────────────
  for (const b of branches) {
    await seedDocument('branches', b.id, {
      branchId: b.id,
      storeId: b.brand,
      branchName: b.name,
      address: b.address,
      latitude: 0,
      longitude: 0,
      contactNumber: '',
      operatingHours: b.hours,
      isActive: b.available,
    });
  }

  // ─── Products ────────────────────────────────────────────────────
  for (const p of products) {
    await seedDocument('products', p.id, {
      productId: p.id,
      storeId: p.storeId,
      categoryId: getCategoryId(p),
      productName: p.name,
      price: p.basePrice,
      imageUrl: p.image,
      isAvailable: true,
      meta: buildMeta(p),
    });
  }

  // ─── Product Categories ──────────────────────────────────────────
  const categories = [
    { categoryId: 'cold', storeId: 'lehmuhn', name: 'Cold Drinks', description: 'Cold beverages' },
    { categoryId: 'hot', storeId: 'lehmuhn', name: 'Hot Drinks', description: 'Hot beverages' },
    { categoryId: 'blended', storeId: 'lehmuhn', name: 'Blended', description: 'Blended beverages' },
    { categoryId: 'sparkling', storeId: 'lehmuhn', name: 'Sparkling', description: 'Sparkling beverages' },
    { categoryId: 'kf-hot', storeId: 'kohfee', name: 'Hot Coffee', description: 'Hot coffee drinks' },
    { categoryId: 'kf-cold', storeId: 'kohfee', name: 'Cold Coffee', description: 'Cold coffee drinks' },
    { categoryId: 'kf-blended', storeId: 'kohfee', name: 'Blended', description: 'Blended drinks' },
    { categoryId: 'kf-food', storeId: 'kohfee', name: 'Food', description: 'Food items' },
  ];

  for (const c of categories) {
    await seedDocument('productCategories', c.categoryId, c);
  }

  console.log('[Seed] Firestore seed complete ✓');
}
