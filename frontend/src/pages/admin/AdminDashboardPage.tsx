import { useState, useEffect } from 'react'
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
    PieChart,
    Eye,
    Radio,
    RefreshCw
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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export default function AdminDashboardPage() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null)
    const [isRefreshingAll, setIsRefreshingAll] = useState(false)
    const [isPageVisible, setIsPageVisible] = useState(true)

    // Phase 1: Smart polling - only when page is visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsPageVisible(document.visibilityState === 'visible')
        }
        
        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [])

    const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: () => adminService.getStats(),
        refetchInterval: isPageVisible ? 120000 : false, // 2 minutes when visible, stopped when hidden
        refetchOnWindowFocus: true // Refresh when tab comes back into focus
    })

    const { data: logs, refetch: refetchLogs } = useQuery({
        queryKey: ['admin-logs'],
        queryFn: adminService.getLogs,
        refetchInterval: isPageVisible ? 120000 : false
    })

    const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery({
        queryKey: ['admin-analytics'],
        queryFn: () => adminService.getAnalytics(30), // Last 30 days
        refetchInterval: isPageVisible ? 300000 : false // 5 minutes for analytics (less critical)
    })

    const { data: liveUsersData, refetch: refetchLiveUsers, isFetching: isRefreshingLiveUsers } = useQuery({
        queryKey: ['admin-live-users'],
        queryFn: () => adminService.getLiveUsers(60), // Users active in last 60 mins (1 hour)
        refetchInterval: isPageVisible ? 60000 : false // 1 minute for live users (most real-time)
    })

    // Refresh all data with force refresh for real-time stats
    const handleRefreshAll = async () => {
        setIsRefreshingAll(true)
        // Force refresh stats to get real-time data (bypasses cache and aggregated stats)
        await Promise.all([
            adminService.getStats(true).then(data => {
                // Manually update the query cache with fresh data
                refetchStats()
            }),
            refetchLogs(),
            refetchAnalytics(),
            refetchLiveUsers()
        ])
        setIsRefreshingAll(false)
    }

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-gray-400 mt-1">System performance and analytics</p>
                </div>
                <button
                    onClick={handleRefreshAll}
                    disabled={isRefreshingAll}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/30 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${isRefreshingAll ? 'animate-spin text-blue-400' : ''}`} />
                    {isRefreshingAll ? 'Refreshing...' : 'Refresh All'}
                </button>
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

            {/* Live Users Section */}
            <div className="bg-[#0a0a0a] rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Radio className="h-5 w-5 text-green-400 animate-pulse" />
                        Live Users
                        <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                            {liveUsersData?.count || 0} online
                        </span>
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">
                            Last hour • Manual refresh
                        </span>
                        <button
                            onClick={() => refetchLiveUsers()}
                            disabled={isRefreshingLiveUsers}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-500/30 transition-all disabled:opacity-50"
                            title="Refresh now"
                        >
                            <RefreshCw className={`h-4 w-4 text-gray-400 ${isRefreshingLiveUsers ? 'animate-spin text-green-400' : ''}`} />
                        </button>
                    </div>
                </div>

                {liveUsersData?.live_users?.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {liveUsersData.live_users.slice(0, 12).map((user: any) => (
                            <div
                                key={user.uid}
                                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:border-green-500/30 transition-colors"
                            >
                                <div className="relative">
                                    {user.photo_url ? (
                                        <img
                                            src={user.photo_url}
                                            alt={user.display_name || 'User'}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                            {(user.email || 'U')[0].toUpperCase()}
                                        </div>
                                    )}
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0a0a0a] rounded-full" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {user.display_name || user.email?.split('@')[0] || 'Anonymous'}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-green-400">
                                            {user.minutes_ago === 0 ? 'Just now' : `${user.minutes_ago}m ago`}
                                        </span>
                                        <span className="text-[10px] text-gray-600">•</span>
                                        <span className="text-[10px] text-gray-500 capitalize">
                                            {user.provider?.replace('.com', '')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <Eye className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">No users online right now</p>
                        <p className="text-xs text-gray-600 mt-1">Users active in the last 15 minutes will appear here</p>
                    </div>
                )}

                {(liveUsersData?.count || 0) > 12 && (
                    <p className="text-center text-xs text-gray-500 mt-4">
                        + {(liveUsersData?.count || 0) - 12} more users online
                    </p>
                )}
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
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                    <div className="flex items-center gap-6">
                        {/* Donut Chart */}
                        <div className="w-40 h-40 flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={analytics?.credit_usage || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={35}
                                        outerRadius={60}
                                        paddingAngle={2}
                                        dataKey="credits"
                                        onClick={(data, index) => setActiveIndex(activeIndex === index ? null : index)}
                                    >
                                        {(analytics?.credit_usage || []).map((entry: any, index: number) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                                opacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                                                stroke={activeIndex === index ? '#fff' : 'transparent'}
                                                strokeWidth={activeIndex === index ? 2 : 0}
                                                cursor="pointer"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                        formatter={(value: any, name: any, props: any) => [`${value} credits`, props.payload.feature]}
                                    />
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Legend */}
                        <div className="flex-1 space-y-1 max-h-48 overflow-y-auto">
                            {(analytics?.credit_usage || []).map((item: any, index: number) => {
                                const total = (analytics?.credit_usage || []).reduce((sum: number, i: any) => sum + (i.credits || 0), 0)
                                const percent = total > 0 ? ((item.credits || 0) / total * 100).toFixed(0) : 0
                                const isActive = activeIndex === index
                                return (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${isActive ? 'bg-white/10 ring-1 ring-white/20' :
                                            activeIndex !== null ? 'opacity-40' : 'hover:bg-white/5'
                                            }`}
                                        onClick={() => setActiveIndex(isActive ? null : index)}
                                    >
                                        <div
                                            className={`w-3 h-3 rounded-full flex-shrink-0 transition-transform ${isActive ? 'scale-125' : ''}`}
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <span className={`text-sm flex-1 truncate ${isActive ? 'text-white font-medium' : 'text-gray-300'}`}>
                                            {item.feature}
                                        </span>
                                        <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                                            {percent}%
                                        </span>
                                    </div>
                                )
                            })}
                            {(!analytics?.credit_usage || analytics.credit_usage.length === 0) && (
                                <p className="text-sm text-gray-500">No usage data yet</p>
                            )}
                        </div>
                    </div>
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
