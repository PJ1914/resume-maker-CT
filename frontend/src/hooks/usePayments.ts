import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../services/payment.service';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export const paymentKeys = {
  all: ['payments'] as const,
  plans: () => [...paymentKeys.all, 'plans'] as const,
};

/**
 * Hook to fetch payment plans
 */
export function usePaymentPlans() {
  return useQuery({
    queryKey: paymentKeys.plans(),
    queryFn: () => paymentService.getPaymentPlans(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to create a payment order
 */
export function useCreateOrder() {
  return useMutation({
    mutationFn: ({ planId, quantity }: { planId: string; quantity: number }) =>
      paymentService.createOrder(planId, quantity),
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create order');
    },
  });
}

/**
 * Hook to verify payment
 */
export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      paymentId,
      signature,
    }: {
      orderId: string;
      paymentId: string;
      signature: string;
    }) => paymentService.verifyPayment(orderId, paymentId, signature),
    onSuccess: (data) => {
      // Invalidate credits query to refresh balance
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      
      toast.success(
        `Payment successful! ${data.credits_added} credits added to your account.`,
        { duration: 5000 }
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Payment verification failed');
    },
  });
}

/**
 * Hook for complete payment flow
 */
export function usePaymentFlow() {
  const { user } = useAuth();
  const createOrder = useCreateOrder();
  const verifyPayment = useVerifyPayment();

  const initiatePayment = async (planId: string, quantity: number) => {
    try {
      // Step 1: Create order
      const order = await createOrder.mutateAsync({ planId, quantity });

      // Step 2: Open Razorpay checkout
      await paymentService.openRazorpayCheckout(
        order,
        user?.email || '',
        user?.displayName || 'User',
        // On success callback
        async (response: any) => {
          // Step 3: Verify payment
          await verifyPayment.mutateAsync({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
        },
        // On failure callback
        (error: Error) => {
          toast.error(error.message || 'Payment failed');
        }
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate payment');
    }
  };

  return {
    initiatePayment,
    isCreatingOrder: createOrder.isPending,
    isVerifying: verifyPayment.isPending,
    isProcessing: createOrder.isPending || verifyPayment.isPending,
  };
}
