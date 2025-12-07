import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAvatar } from './ui/avatars'
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
  History,
} from 'lucide-react'
import CreditBalance from './CreditBalance'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  // Initialize sidebar based on screen width
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  )
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
    <div className="min-h-screen bg-black text-white">
      {/* Top Navbar */}
      <nav className="fixed top-0 z-50 w-full bg-black border-b border-white/10">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="inline-flex items-center p-2 text-gray-400 rounded-lg hover:bg-white/10 focus:outline-none transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
                  <FileText className="h-5 w-5 text-black" />
                </div>
                <span className="text-xl font-bold text-white hidden sm:inline-block">
                  Prativeda
                </span>
              </Link>
            </div>

            {/* Right side - Credits & User menu */}
            <div className="flex items-center gap-3">
              <CreditBalance />

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center bg-white/10 border border-white/10">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      (() => {
                        const AvatarComponent = getAvatar(user?.email || 'default');
                        return <AvatarComponent className="h-full w-full" />;
                      })()
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-white">
                      {user?.displayName || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className="text-xs text-gray-400">{user?.email}</div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {/* User dropdown */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-[#0a0a0a] rounded-lg shadow-xl border border-white/10 py-1 z-20">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        to="/credits/history"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <History className="h-4 w-4" />
                        Credit History
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
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
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } bg-black border-r border-white/10`}
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
                    onClick={() => {
                      // Close sidebar on mobile when a link is clicked
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false)
                      }
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
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
          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/resume/create')}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors font-medium"
              >
                <Sparkles className="h-4 w-4" />
                Create from Scratch
              </button>
              <button
                onClick={() => navigate('/upload')}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors font-medium"
              >
                <Upload className="h-4 w-4" />
                Upload Existing
              </button>
            </div>
          </div>

          {/* Stats Card */}
          <div className="mt-8 mx-3 p-4 bg-[#0a0a0a] rounded-lg border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              💡 Pro Tip
            </h3>
            <p className="text-xs text-gray-400">
              Use AI features to enhance your resume and get better ATS scores!
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'
          } pt-16`}
      >
        <main className="min-h-screen">{children}</main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
