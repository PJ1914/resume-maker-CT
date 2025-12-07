import { motion } from 'framer-motion'
import { User, Mail, Calendar, Shield, Camera } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { format } from 'date-fns'

export default function ProfileHeader() {
    const { user, isAdmin } = useAuth()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-sm border border-secondary-100 dark:border-secondary-700 mb-8"
        >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="relative group">
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-secondary-800 shadow-sm">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt={user.displayName || 'User'} className="h-full w-full object-cover" />
                        ) : (
                            <User className="h-10 w-10 sm:h-12 sm:w-12 text-secondary-400" />
                        )}
                    </div>
                    <button className="absolute bottom-0 right-0 p-1.5 bg-primary-900 text-white rounded-full shadow-md hover:bg-primary-800 transition-colors" title="Upload Photo">
                        <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                </div>

                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {user?.displayName || 'User'}
                        </h1>
                        {isAdmin && (
                            <span className="px-2 py-0.5 rounded-full bg-primary-900 text-white text-[10px] sm:text-xs font-medium flex items-center gap-1">
                                <Shield className="h-3 w-3" /> Admin
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-secondary-500 dark:text-secondary-400">
                        <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            {user?.email}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            Joined {user?.metadata.creationTime ? format(new Date(user.metadata.creationTime), 'MMM yyyy') : 'Recently'}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        {user?.emailVerified ? (
                            <span className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full font-medium">
                                Verified Account
                            </span>
                        ) : (
                            <button className="text-[10px] sm:text-xs text-warning-600 bg-warning-50 dark:bg-warning-900/20 px-2 py-1 rounded-full font-medium hover:underline">
                                Verify Email
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
