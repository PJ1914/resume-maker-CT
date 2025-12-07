import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/services/admin.service'
import {
    Users,
    CreditCard,
    FileText,
    Activity,
    TrendingUp,
    Zap,
    Layout,
    Globe
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminDashboardPage() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: adminService.getStats
    })

    const { data: logs } = useQuery({
        queryKey: ['admin-logs'],
        queryFn: adminService.getLogs
    })

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
        <motion.div variants={item} className="bg-[#0a0a0a] p-6 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
                    <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
                </div>
                <span className="text-2xl font-bold text-white">{value}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
            {subtext && <p className="text-xs text-green-400 mt-1">{subtext}</p>}
        </motion.div>
    )

    if (isLoading) {
        return <div className="p-8 text-center text-gray-400">Loading dashboard...</div>
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400">Overview of system performance and activity</p>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <StatCard
                    title="Total Users"
                    value={stats?.total_users}
                    icon={Users}
                    color="bg-blue-500"
                    subtext={`+${stats?.active_users_today} active today`}
                />
                <StatCard
                    title="Credits Used"
                    value={stats?.total_credits_used}
                    icon={Zap}
                    color="bg-yellow-500"
                    subtext={`${stats?.credits_purchased_today} purchased today`}
                />
                <StatCard
                    title="Resumes Created"
                    value={stats?.resumes_created}
                    icon={FileText}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Revenue (Est)"
                    value={`$${(stats?.credits_purchased_today || 0) * 0.1}`}
                    icon={CreditCard}
                    color="bg-green-500"
                />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Activity Feed */}
                <div className="bg-[#0a0a0a] rounded-xl border border-white/10 p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-gray-400" />
                        Recent System Activity
                    </h2>
                    <div className="space-y-4">
                        {logs?.map((log: any, i: number) => (
                            <div key={i} className="flex items-start gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                                <div className="h-2 w-2 mt-2 rounded-full bg-blue-500" />
                                <div>
                                    <p className="text-sm font-medium text-white">{log.action}</p>
                                    <p className="text-xs text-gray-500">{log.details}</p>
                                    <p className="text-[10px] text-gray-600 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                        {!logs?.length && <p className="text-sm text-gray-500">No recent logs.</p>}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-[#0a0a0a] rounded-xl border border-white/10 p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-gray-400" />
                        Today's Metrics
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Layout className="h-5 w-5 text-indigo-400" />
                                <span className="text-sm font-medium text-gray-300">ATS Checks</span>
                            </div>
                            <span className="font-bold text-white">{stats?.ats_checks_today}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Zap className="h-5 w-5 text-yellow-500" />
                                <span className="text-sm font-medium text-gray-300">AI Actions</span>
                            </div>
                            <span className="font-bold text-white">{stats?.ai_actions_today}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Globe className="h-5 w-5 text-teal-400" />
                                <span className="text-sm font-medium text-gray-300">Portfolios Deployed</span>
                            </div>
                            <span className="font-bold text-white">{stats?.portfolios_deployed}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
