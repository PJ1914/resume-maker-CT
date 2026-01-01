import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/admin.service'
import { motion } from 'framer-motion'
import {
    Megaphone,
    Plus,
    Trash2,
    AlertCircle,
    Info,
    CheckCircle,
    Bell,
    X,
    Calendar,
    Eye,
    EyeOff,
    RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Announcement {
    id: string
    title: string
    message: string
    type: 'info' | 'warning' | 'success' | 'error'
    active: boolean
    created_at: string
    expires_at?: string
}

const typeIcons = {
    info: Info,
    warning: AlertCircle,
    success: CheckCircle,
    error: AlertCircle
}

const typeColors = {
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30'
}

export default function AnnouncementsPage() {
    const queryClient = useQueryClient()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info' as 'info' | 'warning' | 'success' | 'error',
        active: true,
        expires_at: ''
    })

    const { data: announcements, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['admin-announcements'],
        queryFn: adminService.getAnnouncements
    })

    const createMutation = useMutation({
        mutationFn: adminService.createAnnouncement,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] })
            toast.success('Announcement created successfully')
            setIsModalOpen(false)
            resetForm()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to create announcement')
        }
    })

    const deleteMutation = useMutation({
        mutationFn: adminService.deleteAnnouncement,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] })
            toast.success('Announcement deleted successfully')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to delete announcement')
        }
    })

    const resetForm = () => {
        setFormData({
            title: '',
            message: '',
            type: 'info',
            active: true,
            expires_at: ''
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title.trim() || !formData.message.trim()) {
            toast.error('Please fill in all required fields')
            return
        }
        createMutation.mutate(formData)
    }

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this announcement?')) {
            deleteMutation.mutate(id)
        }
    }

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-700 rounded w-48"></div>
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-[#0a0a0a] rounded-lg p-6 border border-white/10">
                            <div className="h-6 bg-gray-700 rounded w-1/3 mb-2"></div>
                            <div className="h-4 bg-gray-600 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Megaphone className="h-7 w-7 text-purple-400" />
                        Announcements
                    </h1>
                    <p className="text-gray-400 mt-1">Manage system-wide announcements and notifications</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Create Announcement
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#0a0a0a] rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Total</span>
                        <Bell className="h-5 w-5 text-gray-500" />
                    </div>
                    <p className="text-2xl font-bold text-white mt-1">{announcements?.length || 0}</p>
                </div>
                <div className="bg-[#0a0a0a] rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Active</span>
                        <Eye className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-green-400 mt-1">
                        {announcements?.filter((a: Announcement) => a.active).length || 0}
                    </p>
                </div>
                <div className="bg-[#0a0a0a] rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Inactive</span>
                        <EyeOff className="h-5 w-5 text-gray-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-400 mt-1">
                        {announcements?.filter((a: Announcement) => !a.active).length || 0}
                    </p>
                </div>
                <div className="bg-[#0a0a0a] rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Warnings</span>
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                    </div>
                    <p className="text-2xl font-bold text-yellow-400 mt-1">
                        {announcements?.filter((a: Announcement) => a.type === 'warning').length || 0}
                    </p>
                </div>
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
                {announcements?.length === 0 ? (
                    <div className="bg-[#0a0a0a] rounded-xl border border-white/10 p-12 text-center">
                        <Megaphone className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Announcements</h3>
                        <p className="text-gray-400 mb-6">Create your first announcement to notify users</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            Create Announcement
                        </button>
                    </div>
                ) : (
                    announcements?.map((announcement: Announcement) => {
                        const Icon = typeIcons[announcement.type] || Info
                        return (
                            <motion.div
                                key={announcement.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`bg-[#0a0a0a] rounded-xl border p-6 ${typeColors[announcement.type]}`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`p-2 rounded-lg ${typeColors[announcement.type]}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-semibold text-white">
                                                    {announcement.title}
                                                </h3>
                                                <span className={`px-2 py-0.5 text-xs rounded-full ${announcement.active
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    {announcement.active ? 'Active' : 'Inactive'}
                                                </span>
                                                <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${typeColors[announcement.type]}`}>
                                                    {announcement.type}
                                                </span>
                                            </div>
                                            <p className="text-gray-300 mb-3">{announcement.message}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Created: {new Date(announcement.created_at).toLocaleDateString()}
                                                </span>
                                                {announcement.expires_at && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        Expires: {new Date(announcement.expires_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(announcement.id)}
                                        disabled={deleteMutation.isPending}
                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Delete announcement"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </motion.div>
                        )
                    })
                )}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#111111] rounded-xl border border-white/10 p-6 w-full max-w-lg mx-4"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Create Announcement</h2>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false)
                                    resetForm()
                                }}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                    placeholder="Announcement title"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Message *
                                </label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                                    placeholder="Announcement message..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Type
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="info">Info</option>
                                        <option value="warning">Warning</option>
                                        <option value="success">Success</option>
                                        <option value="error">Error</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={formData.active ? 'active' : 'inactive'}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.value === 'active' })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Expiration Date (Optional)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.expires_at}
                                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false)
                                        resetForm()
                                    }}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {createMutation.isPending ? 'Creating...' : 'Create Announcement'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
