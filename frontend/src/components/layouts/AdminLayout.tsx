import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    Users,
    FileText,
    Layout,
    CreditCard,
    Settings,
    LogOut,
    Menu,
    X,
    Shield,
    BarChart3,
    Megaphone,
    HelpCircle,
    Globe,
    BookOpen
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandLogo } from '../BrandLogo'

export default function AdminLayout() {
    const { signOut, user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768)

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(true)
            } else {
                setIsSidebarOpen(false)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Resumes', href: '/admin/resumes', icon: FileText },
        { name: 'Templates', href: '/admin/templates', icon: Layout },
        { name: 'Portfolios', href: '/admin/portfolios', icon: Globe },
        { name: 'Credits & Payments', href: '/admin/payments', icon: CreditCard },
        { name: 'AI Monitoring', href: '/admin/ai', icon: BarChart3 },
        { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
        { name: 'Documentation', href: '/admin/docs', icon: BookOpen },
        { name: 'Support', href: '/admin/support', icon: HelpCircle },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
    ]

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    return (
        <div className="h-screen overflow-hidden bg-black text-white flex font-sans">
            {/* Sidebar Overlay for Mobile */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    x: isSidebarOpen ? 0 : -280,
                    width: 280
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`bg-black border-r border-white/10 fixed md:static inset-y-0 left-0 z-50 h-full overflow-hidden flex flex-col`}
            >
                <div className="p-6 flex items-center justify-between">
                    <BrandLogo variant="light" iconClassName="h-8 w-auto" />
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-white/10 text-white shadow-sm'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-white/5 rounded-xl border border-white/5">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.displayName || 'Admin'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen bg-black">
                {/* Mobile Header */}
                <header className="bg-black border-b border-white/10 p-4 flex items-center gap-4 md:hidden shrink-0">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="font-bold text-lg text-white">Prativeda Admin</span>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
