import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import type { Order } from '../types/order';
import type { CartItem, StoreId } from '../types/menu';
import type { UserDoc } from '../types/firestore';
import { sampleOrders } from './data';
import { onAuthChange, getUserProfile } from '../services/auth';

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
  resetState: () => void;
}

const AppContext = createContext<AppState>({} as AppState);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedBrand, setSelectedBrand] = useState<StoreId | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(sampleOrders);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserDoc | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

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
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

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
      resetState,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
