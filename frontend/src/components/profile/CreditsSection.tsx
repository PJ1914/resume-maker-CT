import { motion } from 'framer-motion'
import { Coins, CreditCard, Zap, History } from 'lucide-react'
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-sm border border-secondary-100 dark:border-secondary-700"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    Credits & Billing
                </h2>
                <button
                    onClick={() => navigate('/credits/history')}
                    className="text-xs sm:text-sm text-secondary-500 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white flex items-center gap-1 transition-colors"
                >
                    <History className="h-4 w-4" /> History
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-900/50 border border-secondary-100 dark:border-secondary-700 flex items-center justify-between hover:border-yellow-200 dark:hover:border-yellow-800 transition-colors">
                    <div>
                        <div className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400 mb-1">Available Balance</div>
                        <div className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white flex items-baseline gap-1">
                            {isLoading ? (
                                <span className="animate-pulse bg-secondary-200 dark:bg-secondary-700 h-8 w-16 rounded block" />
                            ) : (
                                balance
                            )}
                            <span className="text-xs sm:text-sm font-normal text-secondary-500">credits</span>
                        </div>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                        <Coins className="h-5 w-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 flex flex-col justify-center items-start hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100">Free Plan</span>
                    </div>
                    <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Buy Credits
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
