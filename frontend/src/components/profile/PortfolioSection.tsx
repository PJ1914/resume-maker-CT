import { motion } from 'framer-motion'
import { Globe, ExternalLink, Github, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PortfolioSection() {
    // No backend for portfolios yet, so we show empty state
    const portfolios: any[] = []

    const handleCreate = () => {
        toast.success('Portfolio builder coming soon!')
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#111111] rounded-2xl p-6 border border-white/10"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
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
                {portfolios.length > 0 ? portfolios.map((portfolio) => (
                    <div key={portfolio.id} className="p-4 rounded-xl bg-[#0a0a0a] border border-white/10 hover:border-teal-500/30 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400">
                                    <Globe className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{portfolio.name}</h3>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="flex items-center gap-1 text-green-400 font-medium">
                                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                            Live
                                        </span>
                                        <span className="text-gray-500">•</span>
                                        <span className="text-gray-400">Deployed {portfolio.last_deployed}</span>
                                    </div>
                                </div>
                            </div>
                            <a
                                href={portfolio.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-teal-400 transition-colors"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[#1a1a1a] border border-white/10 text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors">
                                <RefreshCw className="h-4 w-4" />
                                Re-deploy
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[#1a1a1a] border border-white/10 text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors">
                                <Github className="h-4 w-4" />
                                Push to Git
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-6 text-gray-400">
                        <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No portfolios created yet.</p>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
