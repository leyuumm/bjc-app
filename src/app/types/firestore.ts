/** Firestore document types matching the class diagram */

export type UserRole = 'CUSTOMER' | 'CASHIER' | 'ADMIN';

export interface UserDoc {
  userId: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  role: UserRole;
  assignedBranchId?: string;
  createdAt: Date;
}

export interface StoreDoc {
  storeId: string;
  storeName: string;
  storeDescription: string;
  logoURL: string;
}

export interface ProductCategoryDoc {
  categoryId: string;
  storeId: string;
  name: string;
  description: string;
}

export interface BranchDoc {
  branchId: string;
  storeId: string;
  branchName: string;
  address: string;
  latitude: number;
  longitude: number;
  contactNumber: string;
  operatingHours: string;
  isActive: boolean;
}

export interface ProductDoc {
  productId: string;
  storeId: string;
  branchId?: string;
  productName: string;
  price: number;
  categoryId?: string;
  imageUrl: string;
  isAvailable: boolean;
  /** Extra fields specific to the app's product types */
  meta?: Record<string, unknown>;
}

export type OrderStatusEnum = 'Pending' | 'In Progress' | 'Ready' | 'Completed' | 'Cancelled';

export interface OrderItemDoc {
  orderItemId: string;
  productId: string;
  quantity: number;
  customizations: CustomizationDoc[];
}

export interface CustomizationDoc {
  optionId: string;
  productId: string;
  name: string;
  optionType: string;
  optionValue: string;
  extraCost: number;
}

export interface OrderDoc {
  orderId: string;
  userId: string;
  branchId: string;
  orderDetails: OrderItemDoc[];
  status: OrderStatusEnum;
  timestamp: Date;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  customerName: string;
  orderType: string;
}

export type PaymentMethodEnum = 'Gcash' | 'Paymaya' | 'Stripe' | 'Cash';
export type PaymentStatusEnum = 'Pending' | 'Completed' | 'Failed' | 'Refunded';

export interface PaymentDoc {
  paymentId: string;
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethodEnum;
  paymentStatus: PaymentStatusEnum;
}

export interface NotificationDoc {
  notificationId: string;
  userId: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}
