import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGitHub: () => Promise<void>
  signOut: () => Promise<void>
  deleteAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        try {
          const token = await user.getIdToken()
          localStorage.setItem('authToken', token)


          // Fetch user profile to get admin status (non-blocking with timeout)
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

          // Use AbortController for timeout
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

          try {
            const response = await fetch(`${API_URL}/me`, {
              headers: {
                'Authorization': `Bearer ${token}`
              },
              signal: controller.signal
            })
            clearTimeout(timeoutId)

            if (response.ok) {
              const profile = await response.json()
              setIsAdmin(profile.isAdmin || false)
            } else {
              console.warn('[AUTH] /me endpoint returned status:', response.status)
              setIsAdmin(false)
            }
          } catch (fetchError: any) {
            clearTimeout(timeoutId)
            if (fetchError.name === 'AbortError') {
              console.warn('[AUTH] /me request timed out - continuing without admin check')
            } else {
              console.error('[AUTH] Error fetching profile:', fetchError.message)
            }
            setIsAdmin(false)
          }
        } catch (error) {
          console.error('[AUTH] Error getting ID token:', error)
          setIsAdmin(false)
        }
      } else {
        localStorage.removeItem('authToken')
        setIsAdmin(false)
        console.log('[AUTH] Cleared authToken from localStorage')
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const token = await result.user.getIdToken()
      localStorage.setItem('authToken', token)
      console.log('[AUTH] Stored token after sign in')
      toast.success('Successfully signed in!')
    } catch (error: any) {
      console.error('Sign in error:', error)
      toast.error(error.message || 'Failed to sign in')
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({
        prompt: 'select_account'
      })
      const result = await signInWithPopup(auth, provider)
      const token = await result.user.getIdToken()
      localStorage.setItem('authToken', token)
      console.log('[AUTH] Stored token after Google sign in')
      toast.success('Successfully signed in with Google!')
    } catch (error: any) {
      console.error('Google sign in error:', error)
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error(error.message || 'Failed to sign in with Google')
      }
      throw error
    }
  }

  const signInWithGitHub = async () => {
    try {
      const provider = new GithubAuthProvider()
      // Request necessary scopes for repo management and deployment
      provider.addScope('repo')
      provider.addScope('user')
      provider.setCustomParameters({
        allow_signup: 'true'
      })

      const result = await signInWithPopup(auth, provider)
      const token = await result.user.getIdToken()
      localStorage.setItem('authToken', token)

      // Get GitHub OAuth access token from credential
      const credential = GithubAuthProvider.credentialFromResult(result)
      const githubAccessToken = credential?.accessToken

      if (githubAccessToken) {
        // Send GitHub token to backend to store in resume-maker Firestore
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
          const response = await fetch(`${API_URL}/api/auth/github-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              github_token: githubAccessToken,
              username: result.user.displayName,
              email: result.user.email,
              photo_url: result.user.photoURL
            })
          })

          if (response.ok) {
            console.log('[AUTH] GitHub token stored in backend')
          } else {
            console.warn('[AUTH] Failed to store GitHub token:', await response.text())
          }
        } catch (error) {
          console.error('[AUTH] Error storing GitHub token:', error)
          // Don't fail the sign-in if token storage fails
        }
      }

      console.log('[AUTH] Stored token after GitHub sign in')
      toast.success('Successfully signed in with GitHub!')
    } catch (error: any) {
      console.error('GitHub sign in error:', error)
      if (error.code !== 'auth/popup-closed-by-user') {
        if (error.code === 'auth/account-exists-with-different-credential') {
          toast.error('This email is already associated with another account')
        } else {
          toast.error(error.message || 'Failed to sign in with GitHub')
        }
      }
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      toast.success('Successfully signed out')
    } catch (error: any) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
      throw error
    }
  }

  const deleteAccount = async () => {
    try {
      if (auth.currentUser) {
        await auth.currentUser.delete()
        toast.success('Account deleted successfully')
      }
    } catch (error: any) {
      console.error('Delete account error:', error)
      // Re-authentication might be required
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Please sign in again to delete your account')
      } else {
        toast.error('Failed to delete account')
      }
      throw error
    }
  }

  const value = {
    user,
    loading,
    isAdmin,
    signIn,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
    deleteAccount,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
