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
    Globe,
    DollarSign,
    Clock,
    BarChart3,
    PieChart
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart as RePieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AdminDashboardPage() {
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: adminService.getStats,
        refetchInterval: 30000 // Refetch every 30 seconds
    })

    const { data: logs } = useQuery({
        queryKey: ['admin-logs'],
        queryFn: adminService.getLogs,
        refetchInterval: 10000 // Refetch every 10 seconds
    })

    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ['admin-analytics'],
        queryFn: () => adminService.getAnalytics(30), // Last 30 days
        refetchInterval: 60000 // Refetch every minute
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
                <div className="text-right">
                    <span className="text-3xl font-bold text-white">{value?.toLocaleString() || 0}</span>
                </div>
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">{title}</h3>
            {subtext && <p className="text-xs text-green-400">{subtext}</p>}
        </motion.div>
    )

    if (statsLoading || analyticsLoading) {
        return (
            <div className="p-8 space-y-6">
                <div className="animate-pulse space-y-6">
                    {/* Stats Grid */}
                    <div className="grid md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-[#0a0a0a] rounded-lg p-6 space-y-3 border border-white/10">
                                <div className="h-4 bg-gray-700 rounded w-24"></div>
                                <div className="h-8 bg-gray-600 rounded w-16"></div>
                                <div className="h-3 bg-gray-700 rounded w-32"></div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Charts */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-[#0a0a0a] rounded-lg p-6 space-y-4 border border-white/10">
                                <div className="h-6 bg-gray-700 rounded w-32"></div>
                                <div className="h-64 bg-gray-800 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // Calculate revenue estimate (₹1.5 per credit on average)
    const estimatedRevenue = ((stats?.credits_purchased_today || 0) * 1.5).toFixed(0)

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400 mt-1">Real-time system performance and analytics</p>
            </div>

            {/* Key Stats */}
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
                    subtext={`+${stats?.active_users_today || 0} active today`}
                />
                <StatCard
                    title="Credits Used"
                    value={stats?.total_credits_used}
                    icon={Zap}
                    color="bg-yellow-500"
                    subtext={`${stats?.credits_purchased_today || 0} purchased today`}
                />
                <StatCard
                    title="Resumes Created"
                    value={stats?.resumes_created}
                    icon={FileText}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Revenue (Est)"
                    value={`₹${estimatedRevenue}`}
                    icon={DollarSign}
                    color="bg-green-500"
                    subtext="Today's estimate"
                />
            </motion.div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={item} className="bg-[#0a0a0a] p-6 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">ATS Checks Today</p>
                            <p className="text-2xl font-bold text-white mt-1">{stats?.ats_checks_today || 0}</p>
                        </div>
                        <BarChart3 className="h-10 w-10 text-indigo-400" />
                    </div>
                </motion.div>
                <motion.div variants={item} className="bg-[#0a0a0a] p-6 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">AI Actions Today</p>
                            <p className="text-2xl font-bold text-white mt-1">{stats?.ai_actions_today || 0}</p>
                        </div>
                        <Zap className="h-10 w-10 text-yellow-400" />
                    </div>
                </motion.div>
                <motion.div variants={item} className="bg-[#0a0a0a] p-6 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">Portfolios Deployed</p>
                            <p className="text-2xl font-bold text-white mt-1">{stats?.portfolios_deployed || 0}</p>
                        </div>
                        <Globe className="h-10 w-10 text-teal-400" />
                    </div>
                </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Growth Chart */}
                <div className="bg-[#0a0a0a] rounded-xl border border-white/10 p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-400" />
                        User Growth (Last 30 Days)
                    </h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={analytics?.user_growth || []}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#666" tick={{ fontSize: 12 }} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue Trend Chart */}
                <div className="bg-[#0a0a0a] rounded-xl border border-white/10 p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-400" />
                        Revenue Trend (Last 30 Days)
                    </h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={analytics?.revenue_trend || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#666" tick={{ fontSize: 12 }} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="amount" stroke="#10b981" name="Revenue (₹)" strokeWidth={2} />
                            <Line type="monotone" dataKey="count" stroke="#f59e0b" name="Transactions" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Credit Usage by Feature */}
                <div className="bg-[#0a0a0a] rounded-xl border border-white/10 p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-purple-400" />
                        Credit Usage by Feature
                    </h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <RePieChart>
                            <Pie
                                data={analytics?.credit_usage || []}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry: any) => `${entry.feature}: ${((entry.percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="credits"
                            >
                                {(analytics?.credit_usage || []).map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                            />
                        </RePieChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Templates */}
                <div className="bg-[#0a0a0a] rounded-xl border border-white/10 p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Layout className="h-5 w-5 text-indigo-400" />
                        Top Resume Templates
                    </h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={analytics?.top_templates || []} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis type="number" stroke="#666" tick={{ fontSize: 12 }} />
                            <YAxis dataKey="template" type="category" stroke="#666" tick={{ fontSize: 12 }} width={100} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="count" fill="#8b5cf6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Activity Feed & Platform Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Activity Feed */}
                <div className="bg-[#0a0a0a] rounded-xl border border-white/10 p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-gray-400" />
                        Recent System Activity
                    </h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {logs?.map((log: any, i: number) => (
                            <div key={i} className="flex items-start gap-3 pb-3 border-b border-white/5 last:border-0">
                                <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{log.action}</p>
                                    <p className="text-xs text-gray-500 truncate">{log.details}</p>
                                    <p className="text-[10px] text-gray-600 mt-1">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {!logs?.length && (
                            <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
                        )}
                    </div>
                </div>

                {/* Platform Distribution */}
                <div className="bg-[#0a0a0a] rounded-xl border border-white/10 p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-gray-400" />
                        Platform Usage Distribution
                    </h2>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Resumes</span>
                                <span className="font-bold text-white">{analytics?.platform_stats?.resumes || 0}</span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2">
                                <div 
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                    style={{ 
                                        width: `${((analytics?.platform_stats?.resumes || 0) / (analytics?.platform_stats?.total || 1) * 100)}%` 
                                    }}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Portfolios</span>
                                <span className="font-bold text-white">{analytics?.platform_stats?.portfolios || 0}</span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2">
                                <div 
                                    className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                                    style={{ 
                                        width: `${((analytics?.platform_stats?.portfolios || 0) / (analytics?.platform_stats?.total || 1) * 100)}%` 
                                    }}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Interview Sessions</span>
                                <span className="font-bold text-white">{analytics?.platform_stats?.interviews || 0}</span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2">
                                <div 
                                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                                    style={{ 
                                        width: `${((analytics?.platform_stats?.interviews || 0) / (analytics?.platform_stats?.total || 1) * 100)}%` 
                                    }}
                                />
                            </div>
                        </div>
                        <div className="pt-4 border-t border-white/10">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-300">Total Items</span>
                                <span className="text-2xl font-bold text-white">{analytics?.platform_stats?.total || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Activity Heatmap */}
            {analytics?.user_activity?.hourly && (
                <div className="bg-[#0a0a0a] rounded-xl border border-white/10 p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-orange-400" />
                        User Activity by Hour (UTC)
                    </h2>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={analytics.user_activity.hourly}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="hour" stroke="#666" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#666" tick={{ fontSize: 12 }} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="count" fill="#f59e0b" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    )
}
