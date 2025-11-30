import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { creditService, type FeatureType } from '../services/credits.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Query keys
export const creditKeys = {
  all: ['credits'] as const,
  balance: () => [...creditKeys.all, 'balance'] as const,
  packages: () => [...creditKeys.all, 'packages'] as const,
  history: (limit?: number) => [...creditKeys.all, 'history', limit] as const,
  check: (feature: FeatureType) => [...creditKeys.all, 'check', feature] as const,
};

// Hook to get credit balance
export function useCreditBalance() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: creditKeys.balance(),
    queryFn: () => creditService.getBalance(),
    staleTime: 30 * 1000, // 30 seconds - balance changes frequently
    enabled: !!user, // Only run when user is authenticated
  });
}

// Hook to get credit packages
export function useCreditPackages() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: creditKeys.packages(),
    queryFn: () => creditService.getPackages(),
    staleTime: 60 * 60 * 1000, // 1 hour - packages don't change often
    enabled: !!user, // Only run when user is authenticated
  });
}

// Hook to get credit history
export function useCreditHistory(limit: number = 50) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: creditKeys.history(limit),
    queryFn: () => creditService.getHistory(limit),
    staleTime: 60 * 1000, // 1 minute
    enabled: !!user, // Only run when user is authenticated
  });
}

// Hook to check feature credits
export function useCheckFeature(feature: FeatureType) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: creditKeys.check(feature),
    queryFn: () => creditService.checkFeature(feature),
    staleTime: 10 * 1000, // 10 seconds
    enabled: !!user, // Only run when user is authenticated
  });
}

// Hook to deduct credits
export function useDeductCredits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ feature, amount }: { feature: FeatureType; amount?: number }) =>
      creditService.deductCredits(feature, amount),
    onSuccess: (data) => {
      // Invalidate balance and history
      queryClient.invalidateQueries({ queryKey: creditKeys.balance() });
      queryClient.invalidateQueries({ queryKey: creditKeys.history() });
      
      toast.success(`Credits deducted. New balance: ${data.new_balance}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to deduct credits');
    },
  });
}

// Hook to purchase credits
export function usePurchaseCredits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (packageId: string) => creditService.purchasePackage(packageId),
    onSuccess: () => {
      // Invalidate balance and history
      queryClient.invalidateQueries({ queryKey: creditKeys.balance() });
      queryClient.invalidateQueries({ queryKey: creditKeys.history() });
      
      toast.success('Purchase initiated! Complete payment to receive credits.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to purchase credits');
    },
  });
}
