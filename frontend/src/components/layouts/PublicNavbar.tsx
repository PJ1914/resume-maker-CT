import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FileText, User, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

export function PublicNavbar() {
    const navigate = useNavigate()
    const { user, signOut } = useAuth()

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="fixed top-0 w-full bg-black/50 backdrop-blur-2xl z-50 border-b border-white/10"
        >
            <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl">
                <div className="flex items-center justify-between">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        onClick={() => navigate('/')}
                        className="flex items-center gap-1.5 sm:gap-3 cursor-pointer"
                    >
                        <div className="relative h-7 w-7 sm:h-10 sm:w-10 bg-white rounded-lg flex items-center justify-center group">
                            <div className="absolute inset-0 bg-white blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                            <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-black relative z-10" />
                        </div>
                        <span className="text-base sm:text-xl font-bold tracking-tight text-white">
                            prativeda
                        </span>
                    </motion.div>

                    <div className="flex items-center gap-1.5 sm:gap-4">
                        {user ? (
                            <div className="flex items-center gap-2 sm:gap-4">
                                {/* Profile Picture + Dropdown */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/profile')}
                                    className="flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-2 hover:bg-white/10 rounded-lg transition-colors"
                                    title={user.email || 'Profile'}
                                >
                                    {user.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt={user.displayName || 'User'}
                                            className="h-6 w-6 sm:h-8 sm:w-8 rounded-full object-cover border border-white/30"
                                        />
                                    ) : (
                                        <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                            {user.email?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <span className="text-xs sm:text-sm hidden sm:inline text-white/80 truncate max-w-[100px]">
                                        {user.displayName || user.email?.split('@')[0]}
                                    </span>
                                </motion.button>

                                {/* Logout Button */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={async () => {
                                        try {
                                            await signOut()
                                            toast.success('Signed out successfully')
                                            navigate('/')
                                        } catch (error) {
                                            toast.error('Failed to sign out')
                                        }
                                    }}
                                    className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 text-white/70 hover:text-white transition-colors"
                                    title="Sign out"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="text-xs sm:text-sm hidden sm:inline">Logout</span>
                                </motion.button>
                            </div>
                        ) : (
                            <>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/login')}
                                    className="px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-base text-white/70 hover:text-white font-medium transition-colors"
                                >
                                    Sign In
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255,255,255,0.3)' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/login')}
                                    className="relative px-3 py-1.5 sm:px-6 sm:py-2.5 bg-white text-black rounded-lg font-semibold overflow-hidden group text-xs sm:text-base"
                                >
                                    <div className="absolute inset-0 bg-white blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                                    <span className="relative z-10">Get Started</span>
                                </motion.button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.nav>
    )
}
