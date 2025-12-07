import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/admin.service'
import {
    ArrowLeft,
    Mail,
    Calendar,
    Shield,
    Ban,
    CheckCircle,
    CreditCard,
    FileText,
    Globe,
    Zap,
    MoreVertical,
    Trash2
} from 'lucide-react'
import { format } from 'date-fns'
import { Tab } from '@headlessui/react'
import { Fragment } from 'react'
import toast from 'react-hot-toast'

export default function UserDetailsPage() {
    const { uid } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: user, isLoading } = useQuery({
        queryKey: ['admin-user', uid],
        queryFn: () => adminService.getUserDetails(uid!)
    })

    const banMutation = useMutation({
        mutationFn: adminService.banUser,
        onSuccess: () => {
            toast.success('User banned successfully')
            queryClient.invalidateQueries({ queryKey: ['admin-user', uid] })
        }
    })

    const unbanMutation = useMutation({
        mutationFn: adminService.unbanUser,
        onSuccess: () => {
            toast.success('User unbanned successfully')
            queryClient.invalidateQueries({ queryKey: ['admin-user', uid] })
        }
    })

    if (isLoading) return <div className="p-8 text-center">Loading user details...</div>
    if (!user) return <div className="p-8 text-center">User not found</div>

    const tabs = [
        { name: 'Overview', icon: FileText },
        { name: 'Credits & Purchases', icon: CreditCard },
        { name: 'Resumes', icon: FileText },
        { name: 'AI Usage', icon: Zap },
        { name: 'Portfolios', icon: Globe },
    ]

    return (
        <div className="space-y-6">
            <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Users
            </button>

            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-2xl">
                            {user.photo_url ? (
                                <img src={user.photo_url} alt="" className="h-16 w-16 rounded-full object-cover" />
                            ) : (
                                user.email[0].toUpperCase()
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                {user.display_name || 'Unknown User'}
                                {user.custom_claims?.admin && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                        <Shield className="h-3 w-3" /> Admin
                                    </span>
                                )}
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <span className="flex items-center gap-1">
                                    <Mail className="h-3.5 w-3.5" /> {user.email}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" /> Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {user.disabled ? (
                            <button
                                onClick={() => unbanMutation.mutate(user.uid)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 font-medium text-sm transition-colors"
                            >
                                <CheckCircle className="h-4 w-4" /> Unban User
                            </button>
                        ) : (
                            <button
                                onClick={() => banMutation.mutate(user.uid)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 font-medium text-sm transition-colors"
                            >
                                <Ban className="h-4 w-4" /> Ban User
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.name}
                            as={Fragment}
                        >
                            {({ selected }) => (
                                <button
                                    className={`
                                        w-full rounded-lg py-2.5 text-sm font-medium leading-5 flex items-center justify-center gap-2
                                        ${selected
                                            ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-white shadow'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-white/[0.12] hover:text-gray-800 dark:hover:text-white'
                                        }
                                    `}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.name}
                                </button>
                            )}
                        </Tab>
                    ))}
                </Tab.List>
                <Tab.Panels className="mt-4">
                    {/* Overview Panel */}
                    <Tab.Panel className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Account Overview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Credits Balance</div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.credits_balance}</div>
                            </div>
                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Resumes</div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.resumes_count}</div>
                            </div>
                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Portfolios</div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.portfolios_count}</div>
                            </div>
                        </div>
                    </Tab.Panel>

                    {/* Credits Panel */}
                    <Tab.Panel className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Transaction History</h3>
                        <div className="space-y-4">
                            {user.credit_history?.map((tx: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white capitalize">{tx.action.replace('_', ' ')}</p>
                                        <p className="text-xs text-gray-500">{format(new Date(tx.timestamp), 'PP p')}</p>
                                    </div>
                                    <span className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                                    </span>
                                </div>
                            ))}
                            {!user.credit_history?.length && <p className="text-gray-500">No transaction history.</p>}
                        </div>
                    </Tab.Panel>

                    {/* Resumes Panel */}
                    <Tab.Panel className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">User Resumes</h3>
                        <div className="space-y-4">
                            {user.resumes?.map((resume: any) => (
                                <div key={resume.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded bg-white dark:bg-gray-600 flex items-center justify-center text-gray-400">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{resume.title}</p>
                                            <p className="text-xs text-gray-500">Last updated: {format(new Date(resume.updated_at), 'PP')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                            Score: {resume.score}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {!user.resumes?.length && <p className="text-gray-500">No resumes created.</p>}
                        </div>
                    </Tab.Panel>

                    {/* Other panels placeholders */}
                    <Tab.Panel className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <p className="text-gray-500">AI Usage logs coming soon.</p>
                    </Tab.Panel>
                    <Tab.Panel className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <p className="text-gray-500">Portfolio deployments coming soon.</p>
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    )
}
