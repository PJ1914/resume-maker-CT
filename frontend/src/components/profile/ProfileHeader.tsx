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
            className="bg-[#111111] rounded-2xl p-6 border border-white/10 mb-8"
        >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="relative group">
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-4 border-[#111111] shadow-sm">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt={user.displayName || 'User'} className="h-full w-full object-cover" />
                        ) : (
                            <User className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                        )}
                    </div>
                    <button className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-500 transition-colors" title="Upload Photo">
                        <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                </div>

                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            {user?.displayName || 'User'}
                        </h1>
                        {isAdmin && (
                            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] sm:text-xs font-medium flex items-center gap-1 border border-white/10">
                                <Shield className="h-3 w-3" /> Admin
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-400">
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
                            <span className="text-[10px] sm:text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full font-medium border border-green-500/20">
                                Verified Account
                            </span>
                        ) : (
                            <button className="text-[10px] sm:text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full font-medium hover:underline border border-yellow-500/20">
                                Verify Email
                            </button>
                        )}
                    </div>
                </div>

                {isAdmin && (
                    <div className="flex items-center">
                        <a
                            href="/admin"
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-medium border border-white/10"
                        >
                            <Shield className="h-4 w-4" />
                            Admin Panel
                        </a>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
