import { apiClient } from './api'
import { auth } from '@/lib/firebase'

export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  emailVerified: boolean
}

export interface VerifyTokenResponse {
  uid: string
  email: string
  email_verified: boolean
}

/**
 * Get current user's Firebase auth token
 */
export async function getAuthToken(): Promise<string> {
  const currentUser = auth.currentUser
  if (!currentUser) {
    throw new Error('Not authenticated')
  }
  return await currentUser.getIdToken()
}

export const authService = {
  // Verify token with backend (useful for debugging)
  async verifyToken(): Promise<VerifyTokenResponse> {
    return apiClient.get<VerifyTokenResponse>('/auth/verify')
  },

  // Get user profile from backend
  async getMe(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/me')
  },
}
