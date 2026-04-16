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
  limit,
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
  AnnouncementDoc,
  OrderStatusEnum,
} from '../types/firestore';

// ─── Collections ───────────────────────────────────────────────────

const STORES = 'stores';
const BRANCHES = 'branches';
const PRODUCTS = 'products';
const CATEGORIES = 'productCategories';
const ORDERS = 'orders';
const ANNOUNCEMENTS = 'announcements';
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

export async function getAllBranches(): Promise<BranchDoc[]> {
  const snap = await getDocs(collection(db, BRANCHES));
  return snap.docs
    .map(d => d.data() as BranchDoc)
    .sort((a, b) => a.branchName.localeCompare(b.branchName));
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

// ─── Seed helpers ──────────────────────────────────────────────────

export async function seedDocument(collectionName: string, docId: string, data: Record<string, unknown>): Promise<void> {
  await setDoc(doc(db, collectionName, docId), data, { merge: true });
}

// ─── Realtime listeners ────────────────────────────────────────────

export function onBranchOrdersSnapshot(
  branchId: string,
  callback: (orders: OrderDoc[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, ORDERS),
    where('branchId', '==', branchId),
    orderBy('timestamp', 'desc'),
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => d.data() as OrderDoc));
  });
}

export function onUserNotificationsSnapshot(
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

export function onOrderSnapshot(
  orderId: string,
  callback: (order: OrderDoc | null) => void,
): Unsubscribe {
  return onSnapshot(doc(db, ORDERS, orderId), snap => {
    callback(snap.exists() ? (snap.data() as OrderDoc) : null);
  });
}

export async function deleteProduct(productId: string): Promise<void> {
  await deleteDoc(doc(db, PRODUCTS, productId));
}

export function onProductsSnapshot(
  storeId: string,
  callback: (products: ProductDoc[]) => void,
): Unsubscribe {
  const q = query(collection(db, PRODUCTS), where('storeId', '==', storeId));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => d.data() as ProductDoc));
  });
}

// ─── Product CRUD ──────────────────────────────────────────────────

export async function addProduct(data: Omit<ProductDoc, 'productId'>): Promise<ProductDoc> {
  const productId = `prod-${Date.now()}`;
  const product: ProductDoc = { productId, ...data };
  await setDoc(doc(db, PRODUCTS, productId), product);
  return product;
}

export async function updateProduct(productId: string, data: Partial<ProductDoc>): Promise<void> {
  await updateDoc(doc(db, PRODUCTS, productId), data);
}

// ─── Announcements ─────────────────────────────────────────────────

export async function createAnnouncement(
  data: Omit<AnnouncementDoc, 'announcementId' | 'timestamp'>,
): Promise<AnnouncementDoc> {
  const announcementId = `ANN-${Date.now()}`;
  const announcement: AnnouncementDoc = { announcementId, ...data, timestamp: new Date() };
  await setDoc(doc(db, ANNOUNCEMENTS, announcementId), {
    ...announcement,
    timestamp: serverTimestamp(),
  });
  return announcement;
}

export function onAnnouncementsSnapshot(
  callback: (announcements: AnnouncementDoc[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, ANNOUNCEMENTS),
    orderBy('timestamp', 'desc'),
    limit(20),
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => d.data() as AnnouncementDoc));
  });
}
