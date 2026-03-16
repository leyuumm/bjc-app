import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Order } from '../types/order';
import type { CartItem, StoreId } from '../types/menu';
import { sampleOrders } from './data';

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
}

const AppContext = createContext<AppState>({} as AppState);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedBrand, setSelectedBrand] = useState<StoreId | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(sampleOrders);
  const [loyaltyPoints, setLoyaltyPoints] = useState(1250);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
