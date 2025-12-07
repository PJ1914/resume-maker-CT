import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/admin.service'
import {
    Search,
    Globe,
    ExternalLink,
    Trash2,
    Power,
    Eye,
    User
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function PortfoliosPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const queryClient = useQueryClient()

    const { data: portfolios, isLoading } = useQuery({
        queryKey: ['admin-portfolios'],
        queryFn: adminService.getPortfolios
    })

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) =>
            adminService.updatePortfolioStatus(id, status),
        onSuccess: () => {
            toast.success('Portfolio status updated')
            queryClient.invalidateQueries({ queryKey: ['admin-portfolios'] })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: adminService.deletePortfolio,
        onSuccess: () => {
            toast.success('Portfolio deleted successfully')
            queryClient.invalidateQueries({ queryKey: ['admin-portfolios'] })
        }
    })

    const handleStatusToggle = (portfolio: any) => {
        const newStatus = portfolio.status === 'published' ? 'offline' : 'published'
        statusMutation.mutate({ id: portfolio.id, status: newStatus })
    }

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this portfolio? This action cannot be undone.')) {
            deleteMutation.mutate(id)
        }
    }

    const filteredPortfolios = portfolios?.filter((p: any) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage user portfolios and deployments</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search portfolios..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none w-full sm:w-64"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="px-6 py-4">Portfolio</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Stats</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading portfolios...</td>
                                </tr>
                            ) : filteredPortfolios?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No portfolios found.</td>
                                </tr>
                            ) : (
                                filteredPortfolios?.map((portfolio: any) => (
                                    <tr key={portfolio.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                                    <Globe className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{portfolio.title}</p>
                                                    <a
                                                        href={`https://${portfolio.slug}.resumemaker.com`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-primary-600 hover:underline flex items-center gap-1"
                                                    >
                                                        {portfolio.slug}.resumemaker.com <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                                                <User className="h-4 w-4 text-gray-400" />
                                                {portfolio.user_email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${portfolio.status === 'published'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {portfolio.status === 'published' ? 'Live' : 'Offline'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-1" title="Total Views">
                                                    <Eye className="h-4 w-4" />
                                                    {portfolio.views}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleStatusToggle(portfolio)}
                                                    className={`p-2 rounded-lg transition-colors ${portfolio.status === 'published'
                                                            ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                        }`}
                                                    title={portfolio.status === 'published' ? 'Take Offline' : 'Publish'}
                                                >
                                                    <Power className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(portfolio.id)}
                                                    className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                                    title="Delete Portfolio"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
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
