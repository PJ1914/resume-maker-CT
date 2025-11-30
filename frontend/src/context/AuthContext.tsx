import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
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
  signOut: () => Promise<void>
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
          console.log('[AUTH] Stored Firebase ID token in localStorage')
          
          // Fetch user profile to get admin status
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
          const response = await fetch(`${API_URL}/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const profile = await response.json()
            setIsAdmin(profile.isAdmin || false)
            console.log('[AUTH] User admin status:', profile.isAdmin)
          }
        } catch (error) {
          console.error('[AUTH] Error getting ID token or profile:', error)
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

  const value = {
    user,
    loading,
    isAdmin,
    signIn,
    signInWithGoogle,
    signOut,
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
