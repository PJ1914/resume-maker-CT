import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  FileText,
  Upload,
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Resumes', href: '/resumes', icon: FileText },
    { name: 'Upload Resume', href: '/upload', icon: Upload },
    { name: 'Create New', href: '/resume/create', icon: Sparkles },
  ]

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Top Navbar */}
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-secondary-200 shadow-soft">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="inline-flex items-center p-2 text-secondary-700 rounded-lg hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-800 transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary-900 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-primary-900">
                  Resume Maker
                </span>
              </Link>
            </div>

            {/* Right side - User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary-100 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-primary-900 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-secondary-900">
                    {user?.displayName || user?.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="text-xs text-secondary-500">{user?.email}</div>
                </div>
                <ChevronDown className="h-4 w-4 text-secondary-600" />
              </button>

              {/* User dropdown */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-medium border border-secondary-200 py-1 z-20">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-danger-600 hover:bg-secondary-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white border-r border-secondary-200`}
      >
        <div className="h-full px-3 pb-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      active
                        ? 'bg-primary-900 text-white shadow-soft'
                        : 'text-secondary-700 hover:bg-secondary-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-secondary-200">
            <h3 className="px-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/resume/create')}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-primary-900 hover:bg-secondary-100 rounded-lg transition-colors font-medium"
              >
                <Sparkles className="h-4 w-4" />
                Create from Scratch
              </button>
              <button
                onClick={() => navigate('/upload')}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-primary-900 hover:bg-secondary-100 rounded-lg transition-colors font-medium"
              >
                <Upload className="h-4 w-4" />
                Upload Existing
              </button>
            </div>
          </div>

          {/* Stats Card */}
          <div className="mt-8 mx-3 p-4 bg-secondary-100 rounded-lg border border-secondary-300">
            <h3 className="text-sm font-semibold text-secondary-900 mb-2">
              💡 Pro Tip
            </h3>
            <p className="text-xs text-secondary-700">
              Use AI features to enhance your resume and get better ATS scores!
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        } pt-16`}
      >
        <main className="min-h-screen">{children}</main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
