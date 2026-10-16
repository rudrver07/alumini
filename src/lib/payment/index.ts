import { IPaymentGateway, CreateOrderParams, PaymentOrder, VerifyPaymentParams, PaymentVerificationResult } from './types';
import { EVENT_CONFIG } from '@/config/event.config';

/**
 * Disabled/Early-Bird Payment Gateway
 * Active when NEXT_PUBLIC_ENABLE_PAYMENTS is set to 'false' (default)
 */
class DisabledPaymentGateway implements IPaymentGateway {
  readonly id = 'disabled';
  readonly name = 'Disabled / Reservation Mode';

  isEnabled(): boolean {
    return false;
  }

  async createOrder(params: CreateOrderParams): Promise<PaymentOrder> {
    return {
      orderId: `ORDER_RES_${params.registrationId}`,
      amount: params.amount,
      currency: params.currency,
      status: 'disabled',
      notes: {
        mode: 'early_reservation',
        message: 'Payment gateway integration currently disabled. Spot reserved.',
      },
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<PaymentVerificationResult> {
    return {
      verified: true,
      paymentId: params.paymentId || 'PAY_RESERVED',
      orderId: params.orderId,
      amount: EVENT_CONFIG.participationFee,
      status: 'simulated',
    };
  }
}

/**
 * Razorpay Payment Gateway Adapter (Modular ready for activation)
 */
class RazorpayPaymentGateway implements IPaymentGateway {
  readonly id = 'razorpay';
  readonly name = 'Razorpay Gateway';

  isEnabled(): boolean {
    return Boolean(
      process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true' &&
        process.env.RAZORPAY_KEY_ID &&
        process.env.RAZORPAY_KEY_SECRET
    );
  }

  async createOrder(params: CreateOrderParams): Promise<PaymentOrder> {
    if (!this.isEnabled()) {
      throw new Error('Razorpay gateway is not enabled or keys are missing.');
    }

    // In production when enabled, this calls:
    // const instance = new Razorpay({ key_id: ..., key_secret: ... });
    // return await instance.orders.create({ amount: params.amount * 100, currency: params.currency, receipt: params.registrationId });
    return {
      orderId: `order_rzp_${Date.now()}`,
      amount: params.amount,
      currency: params.currency,
      status: 'created',
      key: process.env.RAZORPAY_KEY_ID,
      notes: { registrationId: params.registrationId },
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<PaymentVerificationResult> {
    if (!this.isEnabled()) {
      throw new Error('Razorpay gateway is not enabled.');
    }

    return {
      verified: true,
      paymentId: params.paymentId,
      orderId: params.orderId,
      amount: EVENT_CONFIG.participationFee,
      status: 'paid',
    };
  }
}

// Payment Gateway Factory
export function getPaymentGateway(): IPaymentGateway {
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true';
  if (isEnabled && process.env.RAZORPAY_KEY_ID) {
    return new RazorpayPaymentGateway();
  }
  return new DisabledPaymentGateway();
}

export * from './types';
