import type { OrderDoc, OrderStatusEnum } from '../types/firestore';
import type { Order, OrderStatus } from '../types/order';
import type { CartItem, StoreId } from '../types/menu';

const orderDocStatusToLocal: Record<OrderStatusEnum, OrderStatus> = {
  'Pending': 'waiting_for_arrival',
  'Preparing': 'preparing',
  'In Progress': 'preparing',
  'Ready': 'ready',
  'Completed': 'completed',
  'Cancelled': 'payment_failed',
};

export function mapOrderDocToOrder(d: OrderDoc): Order {
  const status = orderDocStatusToLocal[d.status];
  const statusMessages: Record<OrderStatus, string> = {
    waiting_for_arrival: 'Prepare once you arrived in the store',
    preparing: "We're now processing your order",
    ready: 'Your order is ready for pickup!',
    completed: 'Order completed. Thank you!',
    payment_failed: 'Online payment failed. Please try again or switch to Pay at Store.',
  };

  const storeId = (d.storeId ?? 'lehmuhn') as StoreId;

  return {
    id: d.orderId,
    items: d.orderDetails.map(item => ({
      cartItemId: item.orderItemId,
      productId: item.productId,
      storeId,
      name: item.customizations.find(c => c.optionType === 'productName')?.optionValue ?? item.productId,
      description: '',
      image: item.customizations.find(c => c.optionType === 'image')?.optionValue ?? '',
      basePrice: Number(item.customizations.find(c => c.optionType === 'basePrice')?.extraCost ?? 0),
      quantity: item.quantity,
      isPremium: false,
      selectedSizeOz: item.customizations.find(c => c.optionType === 'size')
        ? Number(item.customizations.find(c => c.optionType === 'size')!.optionValue) as CartItem['selectedSizeOz']
        : undefined,
      selectedFoodPortion: item.customizations.find(c => c.optionType === 'portion')
        ? item.customizations.find(c => c.optionType === 'portion')!.optionValue as CartItem['selectedFoodPortion']
        : undefined,
      selectedDrinkType: storeId === 'lehmuhn'
        ? (item.customizations.find(c => c.optionType === 'drinkType')?.optionValue
          ?? item.customizations.find(c => c.optionType === 'temperature')?.optionValue) as CartItem['selectedDrinkType']
        : undefined,
      selectedMenuGroup: storeId === 'kohfee'
        ? (item.customizations.find(c => c.optionType === 'menuGroup')?.optionValue
          ?? item.customizations.find(c => c.optionType === 'temperature')?.optionValue) as CartItem['selectedMenuGroup']
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
