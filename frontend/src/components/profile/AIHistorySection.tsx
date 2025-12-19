import { motion } from 'framer-motion'
import { Bot, MessageSquare, Mail, GraduationCap } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { creditService } from '@/services/credits.service'
import { formatDistanceToNow } from 'date-fns'

export default function AIHistorySection() {
    const { data: transactions, isLoading } = useQuery({
        queryKey: ['credit-history'],
        queryFn: () => creditService.getHistory(20),
    })

    // Filter for AI related transactions and show only last 5
    const aiHistory = (transactions?.filter(t =>
        t.feature === 'AI_REWRITE' ||
        t.feature === 'AI_SUGGESTION' ||
        t.description.toLowerCase().includes('ai')
    ) || []).slice(0, 5)

    const getIcon = (type: string) => {
        if (type.includes('interview')) return <MessageSquare className="h-4 w-4 text-blue-500" />
        if (type.includes('email')) return <Mail className="h-4 w-4 text-green-500" />
        if (type.includes('gap') || type.includes('skill')) return <GraduationCap className="h-4 w-4 text-purple-500" />
        return <Bot className="h-4 w-4 text-gray-500" />
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-[#111111] rounded-2xl p-6 border border-secondary-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                    <Bot className="h-5 w-5 text-indigo-400" />
                    AI Tool History
                </h2>
            </div>

            <div className="space-y-3">
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2].map(i => (
                            <div key={i} className="h-16 bg-secondary-100 dark:bg-white/5 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : aiHistory.length > 0 ? (
                    aiHistory.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary-50 dark:bg-[#0a0a0a] border border-secondary-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-white dark:bg-[#1a1a1a] flex items-center justify-center border border-secondary-200 dark:border-white/10">
                                    {getIcon(item.description.toLowerCase())}
                                </div>
                                <div>
                                    <h4 className="text-xs sm:text-sm font-medium text-secondary-900 dark:text-white truncate max-w-[150px] sm:max-w-[180px]">
                                        {item.description}
                                    </h4>
                                    <p className="text-[10px] sm:text-xs text-secondary-500 dark:text-gray-400">
                                        {item.timestamp ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true }) : 'Recently'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-[10px] sm:text-xs font-medium text-red-400 bg-red-500/10 px-2 py-1 rounded">
                                    -{item.amount} credits
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-6 text-secondary-400 dark:text-gray-400">
                        <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No AI usage history yet.</p>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
