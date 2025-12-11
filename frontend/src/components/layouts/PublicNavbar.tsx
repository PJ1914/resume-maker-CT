import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FileText } from 'lucide-react'

export function PublicNavbar() {
    const navigate = useNavigate()

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
                    </div>
                </div>
            </div>
        </motion.nav>
    )
}
