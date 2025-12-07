import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/admin.service'
import {
    Plus,
    Layout,
    Globe,
    Edit2,
    Trash2,
    Check,
    X,
    Image as ImageIcon
} from 'lucide-react'
import { Tab, Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import toast from 'react-hot-toast'

export default function TemplatesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<any>(null)
    const queryClient = useQueryClient()

    const { data: templates, isLoading } = useQuery({
        queryKey: ['admin-templates'],
        queryFn: () => adminService.getTemplates()
    })

    const createMutation = useMutation({
        mutationFn: adminService.createTemplate,
        onSuccess: () => {
            toast.success('Template created successfully')
            setIsModalOpen(false)
            queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: any) => adminService.updateTemplate(id, data),
        onSuccess: () => {
            toast.success('Template updated successfully')
            setIsModalOpen(false)
            setEditingTemplate(null)
            queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: adminService.deleteTemplate,
        onSuccess: () => {
            toast.success('Template deleted successfully')
            queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
        }
    })

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const data: any = Object.fromEntries(formData.entries())

        // Convert checkbox to boolean
        data.is_premium = formData.get('is_premium') === 'on'
        data.active = formData.get('active') === 'on'

        if (editingTemplate) {
            updateMutation.mutate({ id: editingTemplate.id, data })
        } else {
            createMutation.mutate(data)
        }
    }

    const openModal = (template?: any) => {
        setEditingTemplate(template || null)
        setIsModalOpen(true)
    }

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            deleteMutation.mutate(id)
        }
    }

    const TemplateCard = ({ template }: any) => (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group">
            <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                <img
                    src={template.thumbnail_url}
                    alt={template.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                        onClick={() => openModal(template)}
                        className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(template.id)}
                        className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
                {template.is_premium && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded shadow-sm">
                        PREMIUM
                    </div>
                )}
            </div>
            <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{template.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${template.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {template.active ? 'Active' : 'Draft'}
                    </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{template.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>ID: {template.id}</span>
                    <span>{template.price > 0 ? `${template.price} Credits` : 'Free'}</span>
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Template Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage resume and portfolio templates</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                    <Plus className="h-4 w-4" /> Add Template
                </button>
            </div>

            <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1 max-w-md">
                    <Tab as={Fragment}>
                        {({ selected }) => (
                            <button className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 flex items-center justify-center gap-2 ${selected ? 'bg-white dark:bg-gray-700 shadow text-primary-700 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-white/[0.12]'}`}>
                                <Layout className="h-4 w-4" /> Resume Templates
                            </button>
                        )}
                    </Tab>
                    <Tab as={Fragment}>
                        {({ selected }) => (
                            <button className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 flex items-center justify-center gap-2 ${selected ? 'bg-white dark:bg-gray-700 shadow text-primary-700 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-white/[0.12]'}`}>
                                <Globe className="h-4 w-4" /> Portfolio Templates
                            </button>
                        )}
                    </Tab>
                </Tab.List>
                <Tab.Panels className="mt-6">
                    <Tab.Panel>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {templates?.filter((t: any) => t.type === 'resume').map((t: any) => (
                                <TemplateCard key={t.id} template={t} />
                            ))}
                        </div>
                    </Tab.Panel>
                    <Tab.Panel>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {templates?.filter((t: any) => t.type === 'portfolio').map((t: any) => (
                                <TemplateCard key={t.id} template={t} />
                            ))}
                        </div>
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>

            {/* Edit/Create Modal */}
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
                                        {editingTemplate ? 'Edit Template' : 'Add New Template'}
                                    </Dialog.Title>

                                    <form onSubmit={handleSave} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Template ID</label>
                                            <input
                                                name="id"
                                                defaultValue={editingTemplate?.id}
                                                readOnly={!!editingTemplate}
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                            <input
                                                name="name"
                                                defaultValue={editingTemplate?.name}
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                            <textarea
                                                name="description"
                                                defaultValue={editingTemplate?.description}
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                                rows={3}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                                <select
                                                    name="type"
                                                    defaultValue={editingTemplate?.type || 'resume'}
                                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                                >
                                                    <option value="resume">Resume</option>
                                                    <option value="portfolio">Portfolio</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (Credits)</label>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    defaultValue={editingTemplate?.price || 0}
                                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thumbnail URL</label>
                                            <div className="flex gap-2">
                                                <input
                                                    name="thumbnail_url"
                                                    defaultValue={editingTemplate?.thumbnail_url}
                                                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                                    placeholder="https://..."
                                                />
                                                <button type="button" className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                                                    <ImageIcon className="h-5 w-5 text-gray-500" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 pt-2">
                                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="is_premium"
                                                    defaultChecked={editingTemplate?.is_premium}
                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                                Premium Template
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="active"
                                                    defaultChecked={editingTemplate?.active ?? true}
                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                                Active (Visible)
                                            </label>
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
                                                {editingTemplate ? 'Update Template' : 'Create Template'}
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
