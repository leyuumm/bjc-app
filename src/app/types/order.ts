import type { CartItem } from './menu';

export type OrderStatus =
  | 'waiting_for_arrival'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'payment_failed';

export type PaymentMethod = 'PAY_AT_STORE' | 'ONLINE_PAYMONGO';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'FAILED' | 'PENDING';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  time: string;
  customerName: string;
  orderType: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  statusMessage: string;
}
