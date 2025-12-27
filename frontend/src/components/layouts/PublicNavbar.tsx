import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FileText, User, LogOut, ChevronDown, CheckCircle, Zap, Layout, Mic, Users, MessageSquare, PenTool, BookOpen, HelpCircle, Menu, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

export function PublicNavbar({ onMobileMenuClick }: { onMobileMenuClick?: () => void }) {
    const navigate = useNavigate()
    const { user, signOut } = useAuth()
    const [hoveredProduct, setHoveredProduct] = useState(false)
    const [hoveredResources, setHoveredResources] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleMenuClick = () => {
        if (onMobileMenuClick) {
            onMobileMenuClick()
        } else {
            setMobileMenuOpen(true)
        }
    }

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="fixed top-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-2xl z-50 border-b border-secondary-200 dark:border-white/10 overflow-visible transition-colors"
        >
            <div className="container mx-auto px-5 sm:px-7 py-4 sm:py-3 max-w-7xl flex items-center justify-between relative">
                <div className="flex items-center gap-2 md:gap-12">
                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-1 text-secondary-900 dark:text-white hover:bg-secondary-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                        onClick={handleMenuClick}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        onClick={() => navigate('/')}
                        className="flex items-center gap-1.5 sm:gap-3 cursor-pointer"
                    >
                        <div className="relative h-8 w-8 sm:h-8 sm:w-8 bg-secondary-900 dark:bg-white rounded-lg flex items-center justify-center group text-white dark:text-black">
                            <FileText className="h-5 w-5 sm:h-5 sm:w-5 relative z-10" />
                        </div>
                        <span className="text-base sm:text-xl font-bold tracking-tight text-secondary-900 dark:text-white">
                            prativeda
                        </span>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {/* Products Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setHoveredProduct(true)}
                            onMouseLeave={() => setHoveredProduct(false)}
                        >
                            <button className="flex items-center gap-1.5 text-secondary-600 dark:text-white/80 hover:text-secondary-900 dark:hover:text-white font-medium transition-colors py-2">
                                Products
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${hoveredProduct ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {hoveredProduct && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-secondary-200 dark:border-white/10 rounded-2xl shadow-xl p-4 grid gap-2 z-50"
                                    >
                                        <div className="absolute top-0 left-8 -mt-2 w-4 h-4 bg-white dark:bg-zinc-900 border-t border-l border-secondary-200 dark:border-white/10 transform rotate-45" />

                                        <NavItem
                                            icon={FileText}
                                            title="Resume Builder"
                                            desc="Create ATS-friendly resumes"
                                            onClick={() => navigate('/resume/create')}
                                        />
                                        <NavItem
                                            icon={CheckCircle}
                                            title="ATS Checker"
                                            desc="Score & optimize your resume"
                                            onClick={() => navigate('/ats-checker')}
                                        />
                                        <NavItem
                                            icon={Mic}
                                            title="Interview Prep"
                                            desc="AI voice & text coaching"
                                            onClick={() => navigate('/product/interview-prep')}
                                        />
                                        <NavItem
                                            icon={Layout}
                                            title="Portfolio Builder"
                                            desc="Turn resume into a website"
                                            onClick={() => navigate('/product/portfolio')}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Resources Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setHoveredResources(true)}
                            onMouseLeave={() => setHoveredResources(false)}
                        >
                            <button className="flex items-center gap-1.5 text-secondary-600 dark:text-white/80 hover:text-secondary-900 dark:hover:text-white font-medium transition-colors py-2">
                                Resources
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${hoveredResources ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {hoveredResources && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-secondary-200 dark:border-white/10 rounded-2xl shadow-xl p-4 grid gap-2 z-50"
                                    >
                                        <div className="absolute top-0 left-8 -mt-2 w-4 h-4 bg-white dark:bg-zinc-900 border-t border-l border-secondary-200 dark:border-white/10 transform rotate-45" />

                                        <NavItem
                                            icon={Zap}
                                            title="Platform Features"
                                            desc="Explore our full capabilities"
                                            onClick={() => navigate('/features')}
                                        />
                                        <NavItem
                                            icon={PenTool}
                                            title="Cover Letter Tips"
                                            desc="Write letters that get noticed"
                                            onClick={() => navigate('/cover-letter-tips')}
                                        />
                                        <NavItem
                                            icon={BookOpen}
                                            title="Career Blog"
                                            desc="Expert advice and insights"
                                            onClick={() => navigate('/career-blog')}
                                        />
                                        <NavItem
                                            icon={HelpCircle}
                                            title="Help Center"
                                            desc="Guides and troubleshooting"
                                            onClick={() => navigate('/help')}
                                        />
                                        <NavItem
                                            icon={Users}
                                            title="About Us"
                                            desc="Our mission and story"
                                            onClick={() => navigate('/about')}
                                        />
                                        <NavItem
                                            icon={MessageSquare}
                                            title="Contact Support"
                                            desc="Get help and get in touch"
                                            onClick={() => navigate('/contact')}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={() => navigate('/pricing')}
                            className="text-secondary-600 dark:text-white/80 hover:text-secondary-900 dark:hover:text-white font-medium transition-colors"
                        >
                            Pricing
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-4">
                    {user ? (
                        <div className="flex items-center gap-2 sm:gap-4">
                            {/* Profile Picture + Dropdown */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center gap-2 px-2 py-1.5 sm:px-3 sm:py-1.5 hover:bg-secondary-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                                title={user.email || 'Dashboard'}
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
                                <span className="text-xs sm:text-sm hidden sm:inline text-secondary-700 dark:text-white/80 truncate max-w-[100px]">
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
                                className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 text-secondary-600 dark:text-white/70 hover:text-secondary-900 dark:hover:text-white transition-colors"
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
                                className="px-2 py-1.5 sm:px-4 sm:py-1.5 text-xs sm:text-base text-secondary-600 dark:text-white/70 hover:text-secondary-900 dark:hover:text-white font-medium transition-colors"
                            >
                                Sign In
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255,255,255,0.3)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/login')}
                                className="relative px-3 py-2 sm:px-6 sm:py-2 bg-secondary-900 dark:bg-white text-white dark:text-black rounded-lg font-semibold overflow-hidden group text-xs sm:text-base"
                            >
                                <div className="absolute inset-0 bg-secondary-800 dark:bg-white blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                                <span className="relative z-10">Get Started</span>
                            </motion.button>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && !onMobileMenuClick && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 z-[60] md:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full max-w-xs bg-white dark:bg-black border-l border-secondary-200 dark:border-white/10 shadow-2xl z-[70] p-6 overflow-y-auto md:hidden"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-xl font-bold text-secondary-900 dark:text-white">Menu</span>
                                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-secondary-100 dark:hover:bg-white/10 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-secondary-900 dark:text-white" />
                                </button>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <div className="font-bold text-sm text-secondary-400 dark:text-white/40 uppercase tracking-wider mb-4">Products</div>
                                    <div className="space-y-3">
                                        <button onClick={() => { navigate('/resume/create'); setMobileMenuOpen(false) }} className="flex items-center gap-3 text-secondary-700 dark:text-white/80 font-medium">
                                            <FileText className="w-5 h-5" /> Resume Builder
                                        </button>
                                        <button onClick={() => { navigate('/ats-checker'); setMobileMenuOpen(false) }} className="flex items-center gap-3 text-secondary-700 dark:text-white/80 font-medium">
                                            <CheckCircle className="w-5 h-5" /> ATS Checker
                                        </button>
                                        <button onClick={() => { navigate('/product/interview-prep'); setMobileMenuOpen(false) }} className="flex items-center gap-3 text-secondary-700 dark:text-white/80 font-medium">
                                            <Mic className="w-5 h-5" /> Interview Prep
                                        </button>
                                        <button onClick={() => { navigate('/product/portfolio'); setMobileMenuOpen(false) }} className="flex items-center gap-3 text-secondary-700 dark:text-white/80 font-medium">
                                            <Layout className="w-5 h-5" /> Portfolio Builder
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <div className="font-bold text-sm text-secondary-400 dark:text-white/40 uppercase tracking-wider mb-4">Resources</div>
                                    <div className="space-y-3">
                                        <button onClick={() => { navigate('/features'); setMobileMenuOpen(false) }} className="flex items-center gap-3 text-secondary-700 dark:text-white/80 font-medium">
                                            <Zap className="w-5 h-5" /> Features
                                        </button>
                                        <button onClick={() => { navigate('/career-blog'); setMobileMenuOpen(false) }} className="flex items-center gap-3 text-secondary-700 dark:text-white/80 font-medium">
                                            <BookOpen className="w-5 h-5" /> Blog
                                        </button>
                                        <button onClick={() => { navigate('/help'); setMobileMenuOpen(false) }} className="flex items-center gap-3 text-secondary-700 dark:text-white/80 font-medium">
                                            <HelpCircle className="w-5 h-5" /> Help Center
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-secondary-200 dark:border-white/10">
                                    <button onClick={() => { navigate('/pricing'); setMobileMenuOpen(false) }} className="w-full py-3 bg-secondary-900 dark:bg-white text-white dark:text-black rounded-xl font-bold">
                                        View Pricing
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.nav>
    )
}

function NavItem({ icon: Icon, title, desc, onClick }: { icon: any, title: string, desc: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-start gap-4 p-3 rounded-xl hover:bg-secondary-50 dark:hover:bg-white/5 transition-colors text-left group"
        >
            <div className="p-2 bg-secondary-100 dark:bg-white/10 rounded-lg group-hover:bg-secondary-200 dark:group-hover:bg-white/20 transition-colors">
                <Icon className="w-5 h-5 text-secondary-900 dark:text-white" />
            </div>
            <div>
                <h4 className="font-semibold text-secondary-900 dark:text-white text-sm">{title}</h4>
                <p className="text-xs text-secondary-500 dark:text-white/50">{desc}</p>
            </div>
        </button>
    )
}
