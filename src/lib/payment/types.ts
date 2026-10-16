export interface CreateOrderParams {
  registrationId: string;
  amount: number; // in INR
  currency: string;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  status: 'created' | 'bypassed' | 'disabled';
  key?: string;
  notes?: Record<string, string>;
}

export interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
  signature?: string;
}

export interface PaymentVerificationResult {
  verified: boolean;
  paymentId: string;
  orderId: string;
  amount: number;
  status: 'paid' | 'failed' | 'simulated';
  error?: string;
}

export interface IPaymentGateway {
  readonly id: string;
  readonly name: string;
  isEnabled(): boolean;
  createOrder(params: CreateOrderParams): Promise<PaymentOrder>;
  verifyPayment(params: VerifyPaymentParams): Promise<PaymentVerificationResult>;
}
