import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/services/admin.service'
import {
    Search,
    Zap,
    Clock,
    AlertCircle,
    CheckCircle,
    BarChart2,
    Cpu
} from 'lucide-react'
import { format } from 'date-fns'

export default function AIMonitoringPage() {
    const [searchQuery, setSearchQuery] = useState('')

    const { data: logs, isLoading } = useQuery({
        queryKey: ['admin-ai-logs'],
        queryFn: adminService.getAILogs
    })

    const filteredLogs = logs?.filter((log: any) =>
        log.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.model.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Calculate stats
    const totalRequests = logs?.length || 0
    const totalTokens = logs?.reduce((acc: number, log: any) => acc + log.tokens_used, 0) || 0
    const totalCost = logs?.reduce((acc: number, log: any) => acc + log.cost, 0) || 0
    const avgLatency = logs?.length ? Math.round(logs.reduce((acc: number, log: any) => acc + log.latency_ms, 0) / logs.length) : 0

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Monitoring</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track AI usage, costs, and performance</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none w-full sm:w-64"
                    />
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                            <Zap className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Requests</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalRequests}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <Cpu className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tokens Used</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalTokens.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                            <BarChart2 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Est. Cost</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">${totalCost.toFixed(4)}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Latency</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{avgLatency}ms</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Model</th>
                                <th className="px-6 py-4">Tokens</th>
                                <th className="px-6 py-4">Latency</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading logs...</td>
                                </tr>
                            ) : filteredLogs?.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No logs found.</td>
                                </tr>
                            ) : (
                                filteredLogs?.map((log: any) => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {format(new Date(log.created_at), 'MMM d, h:mm:ss a')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            {log.user_email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="capitalize text-sm text-gray-700 dark:text-gray-300">{log.action.replace('_', ' ')}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 font-mono">
                                                {log.model}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {log.tokens_used}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {log.latency_ms}ms
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.status === 'success' ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                                                    <CheckCircle className="h-3 w-3" /> Success
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                                                    <AlertCircle className="h-3 w-3" /> Failed
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
