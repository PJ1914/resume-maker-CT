import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { FileText, LogIn } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { signIn, signInWithGoogle } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
    } catch (error) {
      // Error is handled in AuthContext with toast
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (error) {
      // Error is handled in AuthContext with toast
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Minimal branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary-900 p-12 flex-col justify-between text-white">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <span className="text-xl font-semibold">Resume Maker</span>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-5xl font-bold leading-tight">
            Build Your<br />Perfect Resume
          </h1>
          <p className="text-lg text-secondary-300 max-w-md">
            AI-powered resume builder with ATS optimization and professional templates
          </p>
        </div>

        <div className="text-sm text-secondary-400">
          © 2025 CodeTapasya
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-12 lg:hidden">
            <FileText className="h-6 w-6 text-secondary-900" />
            <span className="text-xl font-semibold text-secondary-900">Resume Maker</span>
          </div>
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-secondary-900 mb-2">
              Welcome back
            </h2>
            <p className="text-secondary-600">
              Sign in to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-secondary-900 focus:border-transparent transition-all"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-secondary-900 focus:border-transparent transition-all"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-secondary-900 text-white rounded-lg font-medium hover:bg-secondary-800 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign in
                </>
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-secondary-500">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full py-2.5 bg-white border border-secondary-300 text-secondary-900 rounded-lg font-medium hover:bg-secondary-50 transition-colors flex items-center justify-center gap-2"
            >
              {googleLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-secondary-600 border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-secondary-600">
            Don&apos;t have an account?{' '}
            <a 
              href="https://codetapasya.com/signup" 
              className="font-medium text-secondary-900 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
