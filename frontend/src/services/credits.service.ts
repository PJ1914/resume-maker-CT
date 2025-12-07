// Credit service for frontend
import { auth } from '@/lib/firebase';
import { API_URL } from '@/config/firebase';

const API_BASE_URL = `${API_URL}/api/credits`;


export interface CreditBalance {
  balance: number;
  total_earned: number;
  total_spent: number;
  subscription_tier: string;
  is_admin: boolean;
  free_credits_remaining?: number;
  last_reset_date?: string | null;
  last_reset?: string | null;
  next_reset_date?: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  discount_percentage?: number;
  popular?: boolean;
}

export interface CreditTransaction {
  id: string;
  type: 'DEDUCTION' | 'PURCHASE' | 'ADMIN_GRANT' | 'MONTHLY_RESET';
  amount: number;
  balance_after: number;
  description: string;
  timestamp: string;
  feature?: string;
}

export type FeatureType = 'ATS_SCORING' | 'AI_REWRITE' | 'PDF_EXPORT';

const getAuthHeaders = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  const token = await user.getIdToken();
  if (!token) {
    throw new Error('Failed to get authentication token');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const creditService = {
  /**
   * Get current credit balance
   */
  async getBalance(): Promise<CreditBalance> {
    const response = await fetch(`${API_BASE_URL}/balance`, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch credit balance');
    }

    return response.json();
  },

  /**
   * Check if user has sufficient credits for a feature
   */
  async checkFeature(feature: FeatureType): Promise<{ sufficient: boolean; required: number; current: number }> {
    const response = await fetch(`${API_BASE_URL}/check/${feature}`, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to check feature credits');
    }

    return response.json();
  },

  /**
   * Deduct credits for using a feature
   */
  async deductCredits(feature: FeatureType, amount?: number): Promise<{ success: boolean; new_balance: number; transaction_id: string }> {
    const response = await fetch(`${API_BASE_URL}/deduct`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ feature, amount }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to deduct credits');
    }

    return response.json();
  },

  /**
   * Get available credit packages
   */
  async getPackages(): Promise<CreditPackage[]> {
    const response = await fetch(`${API_BASE_URL}/packages`, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch credit packages');
    }

    const data = await response.json();
    return data.packages;
  },

  /**
   * Purchase a credit package
   */
  async purchasePackage(packageId: string): Promise<{ payment_id: string; amount: number; credits: number }> {
    const response = await fetch(`${API_BASE_URL}/purchase`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ package_id: packageId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to purchase credits');
    }

    return response.json();
  },

  /**
   * Get credit transaction history
   */
  async getHistory(limit: number = 50): Promise<CreditTransaction[]> {
    const response = await fetch(`${API_BASE_URL}/history?limit=${limit}`, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch credit history');
    }

    const data = await response.json();
    // Backend returns array directly
    return Array.isArray(data) ? data : [];
  },
};
