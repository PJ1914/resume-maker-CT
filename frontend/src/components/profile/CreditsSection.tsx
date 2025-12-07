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
            className="bg-[#111111] rounded-2xl p-6 border border-white/10"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <Coins className="h-5 w-5 text-yellow-400" />
                    Credits & Billing
                </h2>
                <button
                    onClick={() => navigate('/credits/history')}
                    className="text-xs sm:text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                    <History className="h-4 w-4" /> History
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-between hover:border-white/20 transition-colors">
                    <div>
                        <div className="text-xs sm:text-sm text-gray-400 mb-1">Available Balance</div>
                        <div className="text-2xl sm:text-3xl font-bold text-white flex items-baseline gap-1">
                            {isLoading ? (
                                <span className="animate-pulse bg-white/10 h-8 w-16 rounded block" />
                            ) : (
                                balance
                            )}
                            <span className="text-xs sm:text-sm font-normal text-gray-500">credits</span>
                        </div>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                        <Coins className="h-5 w-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col justify-center items-start hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-blue-400" />
                        <span className="text-xs sm:text-sm font-medium text-blue-100">Free Plan</span>
                    </div>
                    <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Buy Credits
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
