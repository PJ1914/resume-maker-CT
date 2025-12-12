import { motion } from 'framer-motion'
import { Globe, ExternalLink, Github, RefreshCw, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { usePortfolioSessions } from '@/hooks/usePortfolio'

export default function PortfolioSection() {
    const navigate = useNavigate()
    const { data: sessions = [], isLoading } = usePortfolioSessions()

    const handleCreate = () => {
        navigate('/portfolio')
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-[#111111] rounded-2xl p-6 border border-secondary-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                    <Globe className="h-5 w-5 text-teal-400" />
                    Portfolios
                </h2>
                <button
                    onClick={handleCreate}
                    className="text-xs sm:text-sm bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                    Create New
                </button>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-6">
                        <Loader className="h-5 w-5 text-teal-400 animate-spin" />
                        <span className="ml-2 text-sm text-secondary-500 dark:text-gray-400">Loading portfolios...</span>
                    </div>
                ) : sessions.length > 0 ? sessions.map((session) => (
                    <div key={session.id} className="p-4 rounded-xl bg-secondary-50 dark:bg-[#0a0a0a] border border-secondary-200 dark:border-white/10 hover:border-teal-400 dark:hover:border-teal-500/30 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400">
                                    <Globe className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-secondary-900 dark:text-white">{session.template_name || 'Portfolio'}</h3>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="flex items-center gap-1 text-green-400 font-medium">
                                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                            Generated
                                        </span>
                                        <span className="text-secondary-500 dark:text-gray-500">•</span>
                                        <span className="text-secondary-400 dark:text-gray-400">
                                            {session.created_at ? new Date(session.created_at).toLocaleDateString() : 'Recently'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <a
                                href={session.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-secondary-400 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white dark:bg-[#1a1a1a] border border-secondary-200 dark:border-white/10 text-sm font-medium text-secondary-600 dark:text-gray-300 hover:bg-secondary-50 dark:hover:bg-white/5 transition-colors">
                                <RefreshCw className="h-4 w-4" />
                                Re-deploy
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white dark:bg-[#1a1a1a] border border-secondary-200 dark:border-white/10 text-sm font-medium text-secondary-600 dark:text-gray-300 hover:bg-secondary-50 dark:hover:bg-white/5 transition-colors">
                                <Github className="h-4 w-4" />
                                Push to Git
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-6 text-secondary-400 dark:text-gray-400">
                        <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No portfolios created yet.</p>
                        <button
                            onClick={handleCreate}
                            className="mt-3 text-xs text-teal-400 hover:text-teal-300 transition-colors"
                        >
                            Create your first portfolio
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
