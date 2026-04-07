import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import type { Order, OrderStatus } from '../types/order';
import type { CartItem, StoreId } from '../types/menu';
import type { NotificationDoc, OrderDoc, UserDoc } from '../types/firestore';
import { onAuthChange, getUserProfile } from '../services/auth';
import { onOrdersSnapshot, onUserNotificationsSnapshot } from '../services/firestore';

// ─── Status mapping helpers ────────────────────────────────────────

const orderDocStatusToLocal: Record<OrderDoc['status'], OrderStatus> = {
  'Pending': 'waiting_for_arrival',
  'In Progress': 'preparing',
  'Ready': 'ready',
  'Completed': 'completed',
  'Cancelled': 'payment_failed',
};

function mapOrderDocToOrder(d: OrderDoc): Order {
  const status = orderDocStatusToLocal[d.status];
  const statusMessages: Record<OrderStatus, string> = {
    waiting_for_arrival: 'Prepare once you arrived in the store',
    preparing: "We're now processing your order",
    ready: 'Your order is ready for pickup!',
    completed: 'Order completed. Thank you!',
    payment_failed: 'Online payment failed. Please try again or switch to Pay at Store.',
  };

  return {
    id: d.orderId,
    items: d.orderDetails.map(item => ({
      cartItemId: item.orderItemId,
      productId: item.productId,
      storeId: 'lehmuhn' as StoreId,
      name: item.customizations.find(c => c.optionType === 'productName')?.optionValue ?? item.productId,
      description: '',
      image: item.customizations.find(c => c.optionType === 'image')?.optionValue ?? '',
      basePrice: Number(item.customizations.find(c => c.optionType === 'basePrice')?.extraCost ?? 0),
      quantity: item.quantity,
      isPremium: false,
      selectedSizeOz: item.customizations.find(c => c.optionType === 'size')
        ? Number(item.customizations.find(c => c.optionType === 'size')!.optionValue) as CartItem['selectedSizeOz']
        : undefined,
      addOns: item.customizations.filter(c => c.optionType === 'addOn').map(c => ({
        id: c.optionId,
        name: c.name,
        extraCost: c.extraCost,
      })),
      toppingsRemoved: item.customizations.some(c => c.optionType === 'toppingsRemoved' && c.optionValue === 'true'),
    })),
    total: d.total,
    status,
    time: d.timestamp instanceof Date
      ? d.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
      : 'Now',
    customerName: d.customerName,
    orderType: d.orderType,
    paymentMethod: d.paymentMethod as Order['paymentMethod'],
    paymentStatus: d.paymentStatus as Order['paymentStatus'],
    statusMessage: statusMessages[status],
  };
}

interface AppState {
  selectedBrand: StoreId | null;
  setSelectedBrand: (b: StoreId | null) => void;
  selectedBranch: string | null;
  setSelectedBranch: (b: string | null) => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateCartQuantity: (cartItemId: string, qty: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  loyaltyPoints: number;
  setLoyaltyPoints: (p: number) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  firebaseUser: User | null;
  userProfile: UserDoc | null;
  authLoading: boolean;
  notifications: NotificationDoc[];
  unreadNotificationsCount: number;
  resetState: () => void;
}

const AppContext = createContext<AppState>({} as AppState);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedBrand, setSelectedBrand] = useState<StoreId | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserDoc | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthChange(async (user) => {
      setFirebaseUser(user);
      if (user) {
        setIsLoggedIn(true);
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
        if (profile) {
          setLoyaltyPoints(profile.loyaltyPoints);
        }
      } else {
        setIsLoggedIn(false);
        setUserProfile(null);
        setLoyaltyPoints(0);
        setOrders([]);
        setNotifications([]);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Subscribe to realtime orders when user is logged in
  useEffect(() => {
    if (!firebaseUser) return;
    const unsub = onOrdersSnapshot(firebaseUser.uid, (orderDocs) => {
      setOrders(orderDocs.map(mapOrderDocToOrder));
    });
    return unsub;
  }, [firebaseUser]);

  // Subscribe to realtime notifications when user is logged in
  useEffect(() => {
    if (!firebaseUser) return;
    const unsub = onUserNotificationsSnapshot(firebaseUser.uid, (notifs) => {
      setNotifications(notifs);
    });
    return unsub;
  }, [firebaseUser]);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.cartItemId === item.cartItemId);
      if (existing) {
        return prev.map(c => c.cartItemId === item.cartItemId ? { ...c, quantity: c.quantity + item.quantity } : c);
      }
      return [...prev, item];
    });
  };

  const updateCartQuantity = (cartItemId: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(c => c.cartItemId !== cartItemId));
    } else {
      setCart(prev => prev.map(c => c.cartItemId === cartItemId ? { ...c, quantity: qty } : c));
    }
  };

  const removeFromCart = (cartItemId: string) => setCart(prev => prev.filter(c => c.cartItemId !== cartItemId));
  const clearCart = () => setCart([]);

  const resetState = () => {
    setSelectedBrand(null);
    setSelectedBranch(null);
    setCart([]);
    setOrders([]);
    setNotifications([]);
    setLoyaltyPoints(0);
  };

  const addOrder = (order: Order) => setOrders(prev => [order, ...prev]);
  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <AppContext.Provider value={{
      selectedBrand, setSelectedBrand,
      selectedBranch, setSelectedBranch,
      cart, addToCart, updateCartQuantity, removeFromCart, clearCart,
      orders, addOrder, updateOrderStatus,
      loyaltyPoints, setLoyaltyPoints,
      isLoggedIn, setIsLoggedIn,
      firebaseUser, userProfile, authLoading,
      notifications, unreadNotificationsCount,
      resetState,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
