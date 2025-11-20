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
    <div className="flex min-h-screen">
      {/* Left side - Branding with enhanced gradient and animations */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-purple-800 p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 group">
            <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <FileText className="h-8 w-8" />
            </div>
            <span className="text-3xl font-display font-bold">Resume Maker</span>
          </div>
        </div>
        
        <div className="space-y-8 relative z-10">
          <h1 className="text-6xl font-display font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-100">
            Build Your Perfect Resume
          </h1>
          <p className="text-2xl text-primary-100 leading-relaxed">
            AI-powered ATS scoring • Professional LaTeX templates • Instant feedback
          </p>
          
          <div className="grid grid-cols-2 gap-6 pt-8">
            <div className="space-y-3 p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105">
              <div className="text-5xl font-bold">98%</div>
              <div className="text-base text-primary-200">ATS Pass Rate</div>
            </div>
            <div className="space-y-3 p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105">
              <div className="text-5xl font-bold">50K+</div>
              <div className="text-base text-primary-200">Resumes Created</div>
            </div>
          </div>
          
          {/* Features list */}
          <div className="space-y-4 pt-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-lg">✨</span>
              </div>
              <span className="text-lg">AI-powered resume optimization</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-lg">🎯</span>
              </div>
              <span className="text-lg">Beat ATS systems with confidence</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
              <span className="text-lg">Real-time scoring and feedback</span>
            </div>
          </div>
        </div>

        <div className="text-sm text-primary-200 relative z-10">
          © 2025 CodeTapasya. All rights reserved.
        </div>
      </div>

      {/* Right side - Login form with enhanced styling */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-secondary-50 via-white to-primary-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-8 lg:hidden group">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">Resume Maker</span>
            </div>
            
            <h2 className="text-4xl font-display font-bold text-secondary-900 mb-3">
              Welcome back
            </h2>
            <p className="text-lg text-secondary-600">
              Sign in with your CodeTapasya account
            </p>
          </div>

          {/* Form with enhanced card */}
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-secondary-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="label text-base font-semibold">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input mt-2 h-12"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="label text-base font-semibold">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input mt-2 h-12"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-bold hover:from-primary-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Sign in
                  </>
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-secondary-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-secondary-600 font-medium">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full h-12 bg-white border-2 border-secondary-300 text-secondary-900 rounded-xl font-semibold hover:bg-secondary-50 hover:border-secondary-400 transition-all flex items-center justify-center gap-3 shadow-lg transform hover:scale-105"
              >
                {googleLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-secondary-600 border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="h-6 w-6" viewBox="0 0 24 24">
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
                    Sign in with Google
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-base text-secondary-600">
              Don't have a CodeTapasya account?{' '}
              <a 
                href="https://codetapasya.com/signup" 
                className="font-semibold text-primary-600 hover:text-primary-500 underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
