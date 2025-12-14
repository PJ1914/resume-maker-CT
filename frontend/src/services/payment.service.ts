import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface PaymentPlan {
  name?: string;
  price: number;
  quantity: number;
  popular?: boolean;
  savings?: string | null;
}

export interface CreateOrderRequest {
  plan_id: string;
  quantity: number;
}

export interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  quantity: number;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  credits_added: number;
  new_balance: number;
  user_id?: string;
}

export interface PaymentPlansResponse {
  PK: string;
  SK: string;
  plan_name: string;
  plans: PaymentPlan[];
}

class PaymentService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async createOrder(planId: string, quantity: number): Promise<CreateOrderResponse> {
    const response = await axios.post<CreateOrderResponse>(
      `${API_URL}/api/payments/create-order`,
      { plan_id: planId, quantity },
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string,
    quantity: number
  ): Promise<VerifyPaymentResponse> {
    const response = await axios.post<VerifyPaymentResponse>(
      `${API_URL}/api/payments/verify`,
      {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        quantity: quantity,
      },
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async getPaymentPlans(): Promise<PaymentPlansResponse> {
    const response = await axios.get<PaymentPlansResponse>(
      `${API_URL}/api/payments/plans`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Initialize Razorpay checkout
   * This loads the Razorpay SDK if not already loaded
   */
  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  /**
   * Open Razorpay payment modal
   */
  async openRazorpayCheckout(
    order: CreateOrderResponse,
    userEmail: string,
    userName: string,
    onSuccess: (response: any) => void,
    onFailure: (error: any) => void
  ): Promise<void> {
    const isLoaded = await this.loadRazorpayScript();

    if (!isLoaded) {
      onFailure(new Error('Failed to load Razorpay SDK'));
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Resume Maker',
      description: 'Purchase Resume Credits',
      order_id: order.order_id,
      prefill: {
        email: userEmail,
        name: userName,
      },
      theme: {
        color: '#3b82f6',
      },
      handler: function (response: any) {
        onSuccess(response);
      },
      modal: {
        ondismiss: function () {
          onFailure(new Error('Payment cancelled by user'));
        },
      },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  }
}

export const paymentService = new PaymentService();
