import { motion } from 'framer-motion'
import { Coins, CreditCard, Zap, History, Sparkles, TrendingUp, Crown } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { creditService } from '@/services/credits.service'
import { useNavigate } from 'react-router-dom'

export default function CreditsSection() {
    const navigate = useNavigate()
    const { data: creditData, isLoading } = useQuery({
        queryKey: ['credits'],
        queryFn: () => creditService.getBalance(),
    })

    const balance = creditData?.balance || 0
    const isAdmin = creditData?.is_admin || false

    // Calculate usage percentage (assuming max is 25000 for visual purposes)
    const maxCredits = 25000
    const usagePercentage = Math.min((balance / maxCredits) * 100, 100)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#111111] rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                        <Coins className="h-5 w-5" />
                    </div>
                    Credits & Billing
                </h2>
                <button
                    onClick={() => navigate('/credits/history')}
                    className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                >
                    <History className="h-4 w-4" /> History
                </button>
            </div>

            {/* Main Balance Card */}
            <div className="mb-4 p-5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                            Available Balance
                        </div>
                        <div className="flex items-baseline gap-2">
                            {isLoading ? (
                                <span className="animate-pulse bg-gray-200 dark:bg-white/10 h-10 w-24 rounded block" />
                            ) : (
                                <span className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                                    {isAdmin ? 'Unlimited' : balance.toLocaleString()}
                                </span>
                            )}
                            {!isAdmin && <span className="text-sm font-medium text-gray-500 dark:text-gray-500">credits</span>}
                        </div>
                    </div>
                </div>

                {/* Progress bar or Admin Status */}
                {isAdmin ? (
                    <div className="flex items-center gap-2 py-1 text-sm text-yellow-600 dark:text-yellow-500 font-medium bg-yellow-50 dark:bg-yellow-900/10 px-3 rounded-lg w-fit">
                        <Crown className="w-4 h-4" />
                        <span>Admin Privileges Active</span>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                                Usage
                            </span>
                            <span>{Math.round(usagePercentage)}% of {maxCredits.toLocaleString()}</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${usagePercentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full rounded-full bg-yellow-500"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Plan & Buy Section */}
            <div className="grid grid-cols-2 gap-3">
                {/* Current Plan */}
                <div className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] hover:border-gray-300 dark:hover:border-white/20 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-gray-400" />
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Current Plan</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Free Plan</span>
                    </div>
                </div>

                {/* Buy Credits Button */}
                <button
                    onClick={() => navigate('/credits/purchase')}
                    className="p-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-1 opacity-90">
                        <CreditCard className="h-4 w-4" />
                        <span className="text-xs font-medium">Get More</span>
                    </div>
                    <span className="text-sm font-bold flex items-center gap-1">
                        Buy Credits
                    </span>
                </button>
            </div>
        </motion.div>
    )
}
