import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/admin.service'
import {
    Megaphone,
    Plus,
    Trash2,
    Info,
    AlertTriangle,
    CheckCircle,
    XCircle
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

export default function AnnouncementsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const queryClient = useQueryClient()

    const { data: announcements, isLoading } = useQuery({
        queryKey: ['admin-announcements'],
        queryFn: adminService.getAnnouncements
    })

    const createMutation = useMutation({
        mutationFn: adminService.createAnnouncement,
        onSuccess: () => {
            toast.success('Announcement created')
            setIsModalOpen(false)
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: adminService.deleteAnnouncement,
        onSuccess: () => {
            toast.success('Announcement deleted')
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] })
        }
    })

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const data = Object.fromEntries(formData.entries())
        createMutation.mutate(data)
    }

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this announcement?')) {
            deleteMutation.mutate(id)
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
            case 'error': return <XCircle className="h-5 w-5 text-red-500" />
            default: return <Info className="h-5 w-5 text-blue-500" />
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage global system announcements</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                    <Plus className="h-4 w-4" /> New Announcement
                </button>
            </div>

            <div className="grid gap-4">
                {isLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading announcements...</div>
                ) : announcements?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No active announcements.</div>
                ) : (
                    announcements?.map((ann: any) => (
                        <div key={ann.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="mt-1">{getTypeIcon(ann.type)}</div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{ann.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-300 mt-1">{ann.content}</p>
                                    <p className="text-xs text-gray-400 mt-2">Posted on {format(new Date(ann.created_at), 'MMM d, yyyy')}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(ann.id)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                                        New Announcement
                                    </Dialog.Title>

                                    <form onSubmit={handleCreate} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                            <input
                                                name="title"
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
                                            <textarea
                                                name="content"
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                                rows={3}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                            <select
                                                name="type"
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                            >
                                                <option value="info">Info</option>
                                                <option value="success">Success</option>
                                                <option value="warning">Warning</option>
                                                <option value="error">Error</option>
                                            </select>
                                        </div>

                                        <div className="mt-6 flex justify-end gap-3">
                                            <button
                                                type="button"
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                                onClick={() => setIsModalOpen(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                                            >
                                                Post Announcement
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    )
}
