import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/services/admin.service'
import {
    Search,
    MoreVertical,
    Shield,
    Ban,
    CheckCircle,
    Mail,
    Calendar,
    Eye,
    ChevronLeft,
    ChevronRight,
    Filter,
    X,
    Download,
    UserCheck,
    UserX,
    Coins
} from 'lucide-react'
import { format } from 'date-fns'
import { Link, useSearchParams } from 'react-router-dom'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

export default function UsersPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1)
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned'>((searchParams.get('status') as any) || 'all')
    const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>((searchParams.get('role') as any) || 'all')
    const [creditFilter, setcreditFilter] = useState<'all' | 'low' | 'medium' | 'high'>((searchParams.get('credits') as any) || 'all')
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>((searchParams.get('joined') as any) || 'all')
    const [showFilters, setShowFilters] = useState(false)
    const limit = 50

    // Sync state to URL params
    useEffect(() => {
        const params: any = {}
        if (currentPage > 1) params.page = currentPage.toString()
        if (searchQuery) params.search = searchQuery
        if (statusFilter !== 'all') params.status = statusFilter
        if (roleFilter !== 'all') params.role = roleFilter
        if (creditFilter !== 'all') params.credits = creditFilter
        if (dateFilter !== 'all') params.joined = dateFilter
        setSearchParams(params, { replace: true })
    }, [currentPage, searchQuery, statusFilter, roleFilter, creditFilter, dateFilter])

    const { data: usersData, isLoading } = useQuery({
        queryKey: ['admin-users', currentPage, statusFilter, roleFilter, creditFilter, dateFilter, searchQuery],
        queryFn: () => adminService.getUsers(currentPage, limit, {
            status: statusFilter,
            role: roleFilter,
            credits: creditFilter,
            joined: dateFilter,
            search: searchQuery
        }),
        refetchInterval: 30000 // Refetch every 30 seconds
    })

    const users = usersData?.users || []
    const totalPages = usersData?.total_pages || 1
    const total = usersData?.total || 0

    // Check if any filters are active
    const hasActiveFilters = statusFilter !== 'all' || roleFilter !== 'all' || creditFilter !== 'all' || dateFilter !== 'all' || searchQuery !== ''
    
    // Count active filters
    const activeFilterCount = [
        statusFilter !== 'all',
        roleFilter !== 'all',
        creditFilter !== 'all',
        dateFilter !== 'all',
        searchQuery !== ''
    ].filter(Boolean).length

    // No need for client-side filtering anymore - backend handles it
    const filteredUsers = users

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">User Management</h1>
                    <p className="text-gray-400">
                        {total} {hasActiveFilters ? 'matching' : ''} user{total !== 1 ? 's' : ''}
                        {searchQuery && ` for "${searchQuery}"`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                            showFilters
                                ? 'bg-primary-500 border-primary-500 text-white'
                                : 'border-white/10 bg-[#0a0a0a] text-white hover:bg-white/5'
                        }`}
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-[#0a0a0a] text-white focus:ring-2 focus:ring-primary-500 outline-none w-full sm:w-64 placeholder-gray-500"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Active Filters Chips */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-400">Active filters:</span>
                    {statusFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs">
                            Status: {statusFilter}
                            <button onClick={() => setStatusFilter('all')} className="hover:text-blue-300">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {roleFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs">
                            Role: {roleFilter}
                            <button onClick={() => setRoleFilter('all')} className="hover:text-purple-300">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {creditFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">
                            Credits: {creditFilter}
                            <button onClick={() => setcreditFilter('all')} className="hover:text-green-300">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {dateFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs">
                            Joined: {dateFilter}
                            <button onClick={() => setDateFilter('all')} className="hover:text-orange-300">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {searchQuery && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-400 text-xs">
                            Search: "{searchQuery}"
                            <button onClick={() => setSearchQuery('')} className="hover:text-pink-300">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    <button
                        onClick={() => {
                            setStatusFilter('all')
                            setRoleFilter('all')
                            setcreditFilter('all')
                            setDateFilter('all')
                            setSearchQuery('')
                        }}
                        className="text-xs text-gray-400 hover:text-white underline"
                    >
                        Clear all filters
                    </button>
                </div>
            )}

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-[#0a0a0a] rounded-xl border border-white/10 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-white">Filters</h3>
                        <button
                            onClick={() => {
                                setStatusFilter('all')
                                setRoleFilter('all')
                                setcreditFilter('all')
                                setDateFilter('all')
                            }}
                            className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            Clear All
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-2">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[#0a0a0a] text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                            >
                                <option value="all">All Users</option>
                                <option value="active">Active Only</option>
                                <option value="banned">Banned Only</option>
                            </select>
                        </div>

                        {/* Role Filter */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-2">Role</label>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value as any)}
                                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[#0a0a0a] text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admins</option>
                                <option value="user">Users</option>
                            </select>
                        </div>

                        {/* Credit Filter */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-2">Credits</label>
                            <select
                                value={creditFilter}
                                onChange={(e) => setcreditFilter(e.target.value as any)}
                                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[#0a0a0a] text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                            >
                                <option value="all">All Balances</option>
                                <option value="low">Low (&lt;20)</option>
                                <option value="medium">Medium (20-99)</option>
                                <option value="high">High (100+)</option>
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-2">Joined</label>
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value as any)}
                                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[#0a0a0a] text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-[#0a0a0a] rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-xs uppercase text-gray-400 font-medium">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Credits</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading users...</td>
                                </tr>
                            ) : filteredUsers?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12">
                                        <div className="text-center">
                                            <div className="mx-auto h-12 w-12 rounded-full bg-gray-500/10 flex items-center justify-center mb-4">
                                                <Filter className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-white mb-2">
                                                {hasActiveFilters ? 'No users match your filters' : 'No users found'}
                                            </h3>
                                            {hasActiveFilters ? (
                                                <div className="space-y-3">
                                                    <p className="text-sm text-gray-400">
                                                        Try adjusting or clearing your filters to see more results
                                                    </p>
                                                    <button
                                                        onClick={() => {
                                                            setStatusFilter('all')
                                                            setRoleFilter('all')
                                                            setcreditFilter('all')
                                                            setDateFilter('all')
                                                            setSearchQuery('')
                                                        }}
                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                                                    >
                                                        <X className="h-4 w-4" />
                                                        Clear All Filters
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400">No registered users in the system</p>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers?.map((user: any) => (
                                    <tr key={user.uid} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">
                                                    {user.photo_url ? (
                                                        <img src={user.photo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                                                    ) : (
                                                        user.email[0].toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{user.display_name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Mail className="h-3 w-3" /> {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.disabled ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                                                    <Ban className="h-3 w-3" /> Banned
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                                                    <CheckCircle className="h-3 w-3" /> Active
                                                </span>
                                            )}
                                            {user.custom_claims?.admin && (
                                                <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400">
                                                    <Shield className="h-3 w-3" /> Admin
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-white">{user.credits_balance}</span>
                                            <span className="text-xs text-gray-500 ml-1">credits</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(user.created_at), 'MMM d, yyyy')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/admin/users/${user.uid}`}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white hover:bg-white/10 transition-colors"
                                            >
                                                <Eye className="h-3 w-3" /> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                        <div className="text-sm text-gray-400">
                            Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, total)} of {total} users
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-white/10 bg-[#0a0a0a] text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-sm text-gray-400">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-white/10 bg-[#0a0a0a] text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
