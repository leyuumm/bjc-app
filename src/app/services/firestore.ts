import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  StoreDoc,
  BranchDoc,
  ProductDoc,
  ProductCategoryDoc,
  OrderDoc,
  OrderItemDoc,
  PaymentDoc,
  NotificationDoc,
  OrderStatusEnum,
} from '../types/firestore';

// ─── Collections ───────────────────────────────────────────────────

const STORES = 'stores';
const BRANCHES = 'branches';
const PRODUCTS = 'products';
const CATEGORIES = 'productCategories';
const ORDERS = 'orders';
const PAYMENTS = 'payments';
const NOTIFICATIONS = 'notifications';
const USERS = 'users';

// ─── Store ─────────────────────────────────────────────────────────

export async function getStoreDetails(storeId: string): Promise<StoreDoc | null> {
  const snap = await getDoc(doc(db, STORES, storeId));
  return snap.exists() ? (snap.data() as StoreDoc) : null;
}

export async function getStoreBranches(storeId: string): Promise<BranchDoc[]> {
  const q = query(collection(db, BRANCHES), where('storeId', '==', storeId));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as BranchDoc);
}

// ─── Branch ────────────────────────────────────────────────────────

export async function getBranchDetails(branchId: string): Promise<BranchDoc | null> {
  const snap = await getDoc(doc(db, BRANCHES, branchId));
  return snap.exists() ? (snap.data() as BranchDoc) : null;
}

export async function getAvailableProducts(branchId: string): Promise<ProductDoc[]> {
  const q = query(
    collection(db, PRODUCTS),
    where('branchId', '==', branchId),
    where('isAvailable', '==', true),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as ProductDoc);
}

// ─── Product ───────────────────────────────────────────────────────

export async function getProductDetails(productId: string): Promise<ProductDoc | null> {
  const snap = await getDoc(doc(db, PRODUCTS, productId));
  return snap.exists() ? (snap.data() as ProductDoc) : null;
}

export async function getProductsByStore(storeId: string): Promise<ProductDoc[]> {
  const q = query(collection(db, PRODUCTS), where('storeId', '==', storeId));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as ProductDoc);
}

// ─── Product Category ──────────────────────────────────────────────

export async function getCategoryProducts(categoryId: string): Promise<ProductDoc[]> {
  const q = query(collection(db, PRODUCTS), where('categoryId', '==', categoryId));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as ProductDoc);
}

export async function getCategories(storeId: string): Promise<ProductCategoryDoc[]> {
  const q = query(collection(db, CATEGORIES), where('storeId', '==', storeId));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as ProductCategoryDoc);
}

// ─── Order ─────────────────────────────────────────────────────────

export async function createOrder(
  userId: string,
  branchId: string,
  orderDetails: OrderItemDoc[],
  total: number,
  paymentMethod: string,
  paymentStatus: string,
  customerName: string,
  orderType: string,
): Promise<OrderDoc> {
  const orderId = `BJC-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

  const order: OrderDoc = {
    orderId,
    userId,
    branchId,
    orderDetails,
    status: 'Pending',
    timestamp: new Date(),
    total,
    paymentMethod,
    paymentStatus,
    customerName,
    orderType,
  };

  await setDoc(doc(db, ORDERS, orderId), {
    ...order,
    timestamp: serverTimestamp(),
  });

  return order;
}

export async function updateOrderStatus(orderId: string, status: OrderStatusEnum): Promise<void> {
  await updateDoc(doc(db, ORDERS, orderId), { status });
}

export async function getOrderDetails(orderId: string): Promise<OrderDoc | null> {
  const snap = await getDoc(doc(db, ORDERS, orderId));
  return snap.exists() ? (snap.data() as OrderDoc) : null;
}

export async function getUserOrders(userId: string): Promise<OrderDoc[]> {
  const q = query(
    collection(db, ORDERS),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as OrderDoc);
}

export function onOrdersSnapshot(
  userId: string,
  callback: (orders: OrderDoc[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, ORDERS),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => d.data() as OrderDoc));
  });
}

// ─── Payment ───────────────────────────────────────────────────────

export async function processPayment(
  orderId: string,
  paymentMethod: PaymentDoc['paymentMethod'],
  amount: number,
): Promise<PaymentDoc> {
  const paymentId = `PAY-${Date.now()}`;
  const payment: PaymentDoc = {
    paymentId,
    orderId,
    amount,
    paymentMethod,
    paymentStatus: 'Pending',
  };
  await setDoc(doc(db, PAYMENTS, paymentId), payment);
  return payment;
}

export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentDoc['paymentStatus'],
): Promise<void> {
  await updateDoc(doc(db, PAYMENTS, paymentId), { paymentStatus: status });
}

// ─── Notification ──────────────────────────────────────────────────

export async function sendNotification(userId: string, message: string): Promise<void> {
  const notificationId = `NOTIF-${Date.now()}`;
  const notification: NotificationDoc = {
    notificationId,
    userId,
    message,
    timestamp: new Date(),
    isRead: false,
  };
  await setDoc(doc(db, NOTIFICATIONS, notificationId), {
    ...notification,
    timestamp: serverTimestamp(),
  });
}

export async function getUserNotifications(userId: string): Promise<NotificationDoc[]> {
  const q = query(
    collection(db, NOTIFICATIONS),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as NotificationDoc);
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, NOTIFICATIONS, notificationId), { isRead: true });
}

// ─── User loyalty ──────────────────────────────────────────────────

export async function getLoyaltyPoints(userId: string): Promise<number> {
  const snap = await getDoc(doc(db, USERS, userId));
  if (snap.exists()) {
    return (snap.data() as { loyaltyPoints?: number }).loyaltyPoints ?? 0;
  }
  return 0;
}

export async function updateLoyaltyPoints(userId: string, points: number): Promise<void> {
  await updateDoc(doc(db, USERS, userId), { loyaltyPoints: points });
}

// ─── Admin Product CRUD ────────────────────────────────────────────

export async function addProduct(product: ProductDoc): Promise<void> {
  await setDoc(doc(db, PRODUCTS, product.productId), product);
}

export async function updateProduct(productId: string, data: Partial<ProductDoc>): Promise<void> {
  await updateDoc(doc(db, PRODUCTS, productId), data);
}

export async function deleteProduct(productId: string): Promise<void> {
  await deleteDoc(doc(db, PRODUCTS, productId));
}

export async function getAllProducts(): Promise<ProductDoc[]> {
  const snap = await getDocs(collection(db, PRODUCTS));
  return snap.docs.map(d => ({ ...d.data(), productId: d.id } as ProductDoc));
}

// ─── Realtime Products ─────────────────────────────────────────────

export function onProductsSnapshot(
  storeId: string,
  callback: (products: ProductDoc[]) => void,
): Unsubscribe {
  const q = query(collection(db, PRODUCTS), where('storeId', '==', storeId));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ ...d.data(), productId: d.id } as ProductDoc)));
  });
}

export function onAllProductsSnapshot(
  callback: (products: ProductDoc[]) => void,
): Unsubscribe {
  return onSnapshot(collection(db, PRODUCTS), snap => {
    callback(snap.docs.map(d => ({ ...d.data(), productId: d.id } as ProductDoc)));
  });
}

// ─── Realtime All Orders (Cashier/Admin) ───────────────────────────

export function onAllOrdersSnapshot(
  callback: (orders: OrderDoc[]) => void,
): Unsubscribe {
  const q = query(collection(db, ORDERS), orderBy('timestamp', 'desc'));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ ...d.data(), orderId: d.id } as OrderDoc)));
  });
}

// ─── Realtime Notifications ────────────────────────────────────────

export function onNotificationsSnapshot(
  userId: string,
  callback: (notifications: NotificationDoc[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, NOTIFICATIONS),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => d.data() as NotificationDoc));
  });
}

// ─── Seed helpers ──────────────────────────────────────────────────

export async function seedDocument(collectionName: string, docId: string, data: Record<string, unknown>): Promise<void> {
  await setDoc(doc(db, collectionName, docId), data, { merge: true });
}
