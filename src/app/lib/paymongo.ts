import type { Order } from '../types/order';

export interface PaymongoCheckoutResult {
  status: 'PAID' | 'FAILED' | 'PENDING';
  checkoutUrl?: string;
  paymentIntentId?: string;
}

export async function createPaymongoCheckout(
  _order: Pick<Order, 'id' | 'total' | 'items'>,
): Promise<PaymongoCheckoutResult> {
  await new Promise(resolve => setTimeout(resolve, 400));

  return {
    status: 'PAID',
    checkoutUrl: 'https://paymongo.example/checkout/mock-session',
    paymentIntentId: `pi_mock_${Date.now()}`,
  };
}
