import { auth } from '../lib/firebase';
import { API_URL } from '../config/firebase';

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  thumbnail_url: string;
  tier: 'basic' | 'standard' | 'premium' | 'ultra';
  price_inr: number;
  price_credits: number;
  tags: string[];
  features: string[];
}

export interface GeneratePortfolioRequest {
  resume_id: string;
  template_id: string;
  theme: 'light' | 'dark' | 'minimal';
  accent_color?: string;
  font_style?: string;
  enable_animations?: boolean;
}

export interface GeneratePortfolioResponse {
  zip_url: string;
  html_preview: string;
  session_id: string;
}

export interface DeployPortfolioRequest {
  session_id: string;
  repo_name: string;
  zip_url: string;
  platform?: 'github' | 'vercel' | 'netlify';  // Add platform parameter
}

export interface DeployPortfolioResponse {
  success: boolean;
  repo_url: string;
  live_url: string;
  status: string;
  repo_name: string;
  message: string;
}

const getAuthHeaders = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Get all available portfolio templates
 */
export const getPortfolioTemplates = async (): Promise<TemplateMetadata[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/portfolio/templates`, {
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
};

/**
 * Get user's unlocked templates
 */
export const getUnlockedTemplates = async (): Promise<string[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/portfolio/unlocked-templates`, {
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to fetch unlocked templates');
    }

    const data = await response.json();
    // Backend returns array directly, not wrapped in object
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching unlocked templates:', error);
    throw error;
  }
};

/**
 * Unlock a premium template
 */
export const unlockTemplate = async (templateId: string, paymentMethod: 'credits' | 'inr'): Promise<void> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/portfolio/unlock-template`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        template_id: templateId,
        payment_method: paymentMethod
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to unlock template');
    }
  } catch (error) {
    console.error('Error unlocking template:', error);
    throw error;
  }
};

/**
 * Generate portfolio website
 */
export const generatePortfolio = async (request: GeneratePortfolioRequest): Promise<GeneratePortfolioResponse> => {
  try {
    console.log('[portfolio.service] Generating portfolio:', request);
    const headers = await getAuthHeaders();
    console.log('[portfolio.service] Auth headers obtained');

    const response = await fetch(`${API_URL}/api/portfolio/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request)
    });

    console.log('[portfolio.service] Response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('[portfolio.service] Error response:', error);
      throw new Error(error.detail || 'Failed to generate portfolio');
    }

    const result = await response.json();
    console.log('[portfolio.service] Generation successful:', result);
    return result;
  } catch (error) {
    console.error('[portfolio.service] Error generating portfolio:', error);
    throw error;
  }
};

/**
 * Deploy portfolio to GitHub Pages
 */
export const deployPortfolio = async (request: DeployPortfolioRequest): Promise<DeployPortfolioResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/portfolio/deploy`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to deploy portfolio');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deploying portfolio:', error);
    throw error;
  }
};

/**
 * Get user's portfolio history
 */
export const getPortfolioSessions = async (): Promise<any[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/portfolio/sessions`, {
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to fetch portfolio sessions');
    }

    const data = await response.json();
    // Backend returns array directly, not wrapped in { sessions: [...] }
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching portfolio sessions:', error);
    throw error;
  }
};

/**
 * Link Vercel or Netlify account with Personal Access Token
 */
export const linkPlatformToken = async (platform: 'vercel' | 'netlify', token: string): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/portfolio/link-platform`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        platform,
        token
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to link ${platform} account`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error linking ${platform} account:`, error);
    throw error;
  }
};

/**
 * Check if platform (Vercel/Netlify) is linked
 */
export const checkPlatformLinked = async (platform: 'vercel' | 'netlify'): Promise<{ linked: boolean; platform: string; linked_at?: string }> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/portfolio/check-platform/${platform}`, {
      headers
    });

    if (!response.ok) {
      return { linked: false, platform };
    }

    return await response.json();
  } catch (error) {
    console.error(`Error checking ${platform} status:`, error);
    return { linked: false, platform };
  }
};

/**
 * Unlink platform (Vercel/Netlify)
 */
export const unlinkPlatform = async (platform: 'vercel' | 'netlify'): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/portfolio/unlink-platform/${platform}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to unlink ${platform} account`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error unlinking ${platform} account:`, error);
    throw error;
  }
};

/**
 * Get GitHub token status
 */
export const getGitHubTokenStatus = async (): Promise<{ configured: boolean }> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/portfolio/github-token/status`, {
      headers
    });

    if (!response.ok) {
      return { configured: false };
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking GitHub token status:', error);
    return { configured: false };
  }
};

/**
 * Save GitHub token
 */
export const saveGitHubToken = async (token: string): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/portfolio/github-token?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to save GitHub token');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving GitHub token:', error);
    throw error;
  }
};

/**
 * Delete a portfolio session
 */
export const deletePortfolioSession = async (sessionId: string): Promise<void> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/portfolio/sessions/${sessionId}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete session');
    }
  } catch (error) {
    console.error('Error deleting portfolio session:', error);
    throw error;
  }
};
