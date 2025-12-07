import { useState } from 'react'
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
    Eye
} from 'lucide-react'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

export default function UsersPage() {
    const [searchQuery, setSearchQuery] = useState('')

    const { data: users, isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: adminService.getUsers
    })

    const filteredUsers = users?.filter((user: any) =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.uid.includes(searchQuery)
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">User Management</h1>
                    <p className="text-gray-400">View and manage all registered users</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-[#0a0a0a] text-white focus:ring-2 focus:ring-primary-500 outline-none w-full sm:w-64 placeholder-gray-500"
                    />
                </div>
            </div>

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
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found.</td>
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
            </div>
        </div>
    )
}
