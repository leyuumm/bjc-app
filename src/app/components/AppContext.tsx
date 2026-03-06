import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Order, sampleOrders } from './data';

interface AppState {
  selectedBrand: 'lehmuhn' | 'kohfee' | null;
  setSelectedBrand: (b: 'lehmuhn' | 'kohfee' | null) => void;
  selectedBranch: string | null;
  setSelectedBranch: (b: string | null) => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateCartQuantity: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
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
  const [selectedBrand, setSelectedBrand] = useState<'lehmuhn' | 'kohfee' | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(sampleOrders);
  const [loyaltyPoints, setLoyaltyPoints] = useState(1250);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id && c.size === item.size);
      if (existing) {
        return prev.map(c => c.id === item.id && c.size === item.size ? { ...c, quantity: c.quantity + item.quantity } : c);
      }
      return [...prev, item];
    });
  };

  const updateCartQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(c => c.id !== id));
    } else {
      setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: qty } : c));
    }
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(c => c.id !== id));
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
