import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/admin.service'
import {
    Plus,
    Layout,
    Globe,
    Edit2,
    Trash2,
    Upload,
    FileText,
    Image as ImageIcon,
    AlertCircle,
    CheckCircle,
    Loader2
} from 'lucide-react'
import { Tab, Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import toast from 'react-hot-toast'

interface PortfolioTemplate {
    id: string
    name: string
    description: string
    tier: 'basic' | 'standard' | 'premium'
    price_inr: number
    price_credits: number
    thumbnail_url?: string
    preview_url?: string
    features: string[]
    responsive?: boolean
    javascript?: boolean
    dark_mode?: boolean
    active?: boolean
    created_at?: any
    updated_at?: any
}

export default function TemplatesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<any>(null)
    const [uploadingTemplate, setUploadingTemplate] = useState<any>(null)
    const [selectedType, setSelectedType] = useState<'resume' | 'portfolio'>('portfolio')
    const [uploadFiles, setUploadFiles] = useState<{
        indexHtml?: File
        stylesCss?: File
        scriptJs?: File
        metadataJson?: File
        previewHtml?: File
        readmeMd?: File
    }>({})
    const queryClient = useQueryClient()

    const { data: templates, isLoading, error } = useQuery({
        queryKey: ['admin-templates'],
        queryFn: async () => {
            console.log('Fetching admin templates...')
            try {
                const result = await adminService.getTemplates()
                console.log('Templates received:', result)
                console.log('Portfolio templates:', result?.filter((t: any) => t.type === 'portfolio'))
                return result
            } catch (err: any) {
                console.error('Error fetching templates:', err)
                console.error('Error response:', err.response?.data)
                throw err
            }
        }
    })
    
    console.log('Templates state:', { 
        templates, 
        isLoading, 
        error,
        portfolioCount: templates?.filter((t: any) => t.type === 'portfolio').length 
    })

    const createMutation = useMutation({
        mutationFn: adminService.createTemplate,
        onSuccess: () => {
            toast.success('Template created successfully')
            setIsModalOpen(false)
            queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to create template')
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: any) => adminService.updateTemplate(id, data),
        onSuccess: () => {
            toast.success('Template updated successfully')
            setIsModalOpen(false)
            setEditingTemplate(null)
            queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to update template')
        }
    })

    const deleteMutation = useMutation({
        mutationFn: adminService.deleteTemplate,
        onSuccess: () => {
            toast.success('Template deleted successfully')
            queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to delete template')
        }
    })

    const uploadMutation = useMutation({
        mutationFn: ({ templateId, files }: { templateId: string, files: any }) => 
            adminService.uploadTemplateFiles(templateId, files),
        onSuccess: (data) => {
            toast.success(`Uploaded ${data.uploaded_files?.length || 0} files successfully`)
            setIsUploadModalOpen(false)
            setUploadFiles({})
            setUploadingTemplate(null)
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to upload files')
        }
    })

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const data: any = {
            type: selectedType
        }

        // Build template data based on type
        if (selectedType === 'portfolio') {
            data.id = formData.get('id')
            data.name = formData.get('name')
            data.description = formData.get('description')
            data.tier = formData.get('tier')
            data.price_inr = parseInt(formData.get('price_inr') as string)
            data.price_credits = parseInt(formData.get('price_credits') as string)
            data.thumbnail_url = formData.get('thumbnail_url')
            data.preview_url = formData.get('preview_url')
            
            // Features as array
            const featuresStr = formData.get('features') as string
            data.features = featuresStr ? featuresStr.split(',').map(f => f.trim()) : []
            
            // Boolean fields
            data.responsive = formData.get('responsive') === 'on'
            data.javascript = formData.get('javascript') === 'on'
            data.dark_mode = formData.get('dark_mode') === 'on'
            data.active = formData.get('active') === 'on'
        } else {
            // Resume template fields
            data.id = formData.get('id')
            data.name = formData.get('name')
            data.description = formData.get('description')
            data.price = parseInt(formData.get('price') as string) || 0
            data.is_premium = formData.get('is_premium') === 'on'
            data.active = formData.get('active') === 'on'
            data.thumbnail_url = formData.get('thumbnail_url')
        }

        if (editingTemplate) {
            updateMutation.mutate({ id: editingTemplate.id, data })
        } else {
            createMutation.mutate(data)
        }
    }

    const openModal = (template?: any, type?: 'resume' | 'portfolio') => {
        setEditingTemplate(template || null)
        if (type) setSelectedType(type)
        else if (template) setSelectedType(template.type)
        setIsModalOpen(true)
    }

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this template? This will also delete all associated files from storage.')) {
            deleteMutation.mutate(id)
        }
    }

    const getTierColor = (tier: string) => {
        switch(tier) {
            case 'basic': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            case 'standard': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
            case 'premium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const TemplateCard = ({ template }: any) => {
        const isPortfolio = template.type === 'portfolio'
        
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
                    {template.thumbnail_url || template.preview_url ? (
                        <img
                            src={template.thumbnail_url || template.preview_url}
                            alt={template.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            onError={(e) => { (e.target as any).style.display = 'none' }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            {isPortfolio ? (
                                <Globe className="h-16 w-16 text-gray-400" />
                            ) : (
                                <FileText className="h-16 w-16 text-gray-400" />
                            )}
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                            onClick={() => openModal(template)}
                            className="p-3 bg-white rounded-full text-gray-900 hover:bg-gray-100 transition-colors shadow-lg"
                            title="Edit template"
                        >
                            <Edit2 className="h-5 w-5" />
                        </button>
                        {isPortfolio && (
                            <button
                                onClick={() => {
                                    setUploadingTemplate(template)
                                    setIsUploadModalOpen(true)
                                }}
                                className="p-3 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors shadow-lg"
                                title="Upload files"
                            >
                                <Upload className="h-5 w-5" />
                            </button>
                        )}
                        <button
                            onClick={() => handleDelete(template.id)}
                            className="p-3 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-lg"
                            title="Delete template"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {isPortfolio && template.tier && (
                            <span className={`px-2 py-1 text-xs font-bold rounded shadow-sm uppercase ${getTierColor(template.tier)}`}>
                                {template.tier}
                            </span>
                        )}
                        {template.is_premium && template.type !== 'portfolio' && (
                            <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded shadow-sm">
                                PREMIUM
                            </span>
                        )}
                        {template.responsive && (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded shadow-sm">
                                📱 Responsive
                            </span>
                        )}
                    </div>
                </div>
                <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white truncate flex-1">{template.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${template.active !== false ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800'}`}>
                            {template.active !== false ? '●  Active' : 'Draft'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{template.description}</p>
                    
                    {/* Features */}
                    {isPortfolio && template.features && template.features.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {template.features.slice(0, 3).map((feature: string, idx: number) => (
                                <span key={idx} className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded">
                                    {feature}
                                </span>
                            ))}
                            {template.features.length > 3 && (
                                <span className="text-xs text-gray-500">+{template.features.length - 3}</span>
                            )}
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <span className="font-mono">{template.id}</span>
                        <span className="font-semibold">
                            {isPortfolio ? (
                                <>₹{template.price_inr} / {template.price_credits}cr</>
                            ) : (
                                <>{template.price > 0 ? `${template.price} Credits` : 'Free'}</>
                            )}
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Template Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage resume and portfolio templates</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => openModal(undefined, 'resume')}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                        <Layout className="h-4 w-4" /> Add Resume
                    </button>
                    <button
                        onClick={() => openModal(undefined, 'portfolio')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                        <Globe className="h-4 w-4" /> Add Portfolio
                    </button>
                </div>
            </div>

            <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1 max-w-md">
                    <Tab as={Fragment}>
                        {({ selected }) => (
                            <button className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 flex items-center justify-center gap-2 transition-colors ${selected ? 'bg-white dark:bg-gray-700 shadow text-primary-700 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-white/[0.12]'}`}>
                                <Layout className="h-4 w-4" /> Resume Templates
                                <span className="ml-1 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 rounded-full">
                                    {templates?.filter((t: any) => t.type === 'resume').length || 0}
                                </span>
                            </button>
                        )}
                    </Tab>
                    <Tab as={Fragment}>
                        {({ selected }) => (
                            <button className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 flex items-center justify-center gap-2 transition-colors ${selected ? 'bg-white dark:bg-gray-700 shadow text-primary-700 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-white/[0.12]'}`}>
                                <Globe className="h-4 w-4" /> Portfolio Templates
                                <span className="ml-1 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 rounded-full">
                                    {templates?.filter((t: any) => t.type === 'portfolio').length || 0}
                                </span>
                            </button>
                        )}
                    </Tab>
                </Tab.List>
                <Tab.Panels className="mt-6">
                    <Tab.Panel>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                            </div>
                        ) : templates?.filter((t: any) => t.type === 'resume').length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {templates?.filter((t: any) => t.type === 'resume').map((t: any) => (
                                    <TemplateCard key={t.id} template={t} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                                <Layout className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                                <p className="text-gray-500 dark:text-gray-400 mb-4">No resume templates yet</p>
                                <button
                                    onClick={() => openModal(undefined, 'resume')}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    <Plus className="h-4 w-4" /> Add Resume Template
                                </button>
                            </div>
                        )}
                    </Tab.Panel>
                    <Tab.Panel>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                            </div>
                        ) : templates?.filter((t: any) => t.type === 'portfolio').length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {templates?.filter((t: any) => t.type === 'portfolio').map((t: any) => (
                                    <TemplateCard key={t.id} template={t} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                                <Globe className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                                <p className="text-gray-500 dark:text-gray-400 mb-4">No portfolio templates yet</p>
                                <button
                                    onClick={() => openModal(undefined, 'portfolio')}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    <Plus className="h-4 w-4" /> Add Portfolio Template
                                </button>
                            </div>
                        )}
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
                        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                        {selectedType === 'portfolio' ? <Globe className="h-5 w-5 text-primary-600" /> : <Layout className="h-5 w-5 text-gray-600" />}
                                        {editingTemplate ? `Edit ${selectedType === 'portfolio' ? 'Portfolio' : 'Resume'} Template` : `Add New ${selectedType === 'portfolio' ? 'Portfolio' : 'Resume'} Template`}
                                    </Dialog.Title>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                        {selectedType === 'portfolio' ? 'Configure portfolio template metadata. Upload template files separately via Firebase Storage.' : 'Configure resume template settings and pricing.'}
                                    </p>

                                    <form onSubmit={handleSave} className="space-y-5">
                                        {/* Basic Info */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Basic Information</h4>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                        Template ID <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        name="id"
                                                        defaultValue={editingTemplate?.id}
                                                        readOnly={!!editingTemplate}
                                                        placeholder="e.g., modern-portfolio"
                                                        className={`w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm ${editingTemplate ? 'bg-gray-50 dark:bg-gray-900 cursor-not-allowed' : ''}`}
                                                        required
                                                    />
                                                    {!editingTemplate && (
                                                        <p className="text-xs text-gray-500 mt-1">Lowercase, hyphenated (e.g., modern-portfolio)</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                        Display Name <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        name="name"
                                                        defaultValue={editingTemplate?.name}
                                                        placeholder="e.g., Modern Portfolio"
                                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description <span className="text-red-500">*</span></label>
                                                <textarea
                                                    name="description"
                                                    defaultValue={editingTemplate?.description}
                                                    placeholder="Describe this template's style and features..."
                                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                                    rows={3}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Portfolio-specific fields */}
                                        {selectedType === 'portfolio' && (
                                            <>
                                                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Pricing & Tier</h4>
                                                    
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tier <span className="text-red-500">*</span></label>
                                                            <select
                                                                name="tier"
                                                                defaultValue={editingTemplate?.tier || 'basic'}
                                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                                            >
                                                                <option value="basic">Basic</option>
                                                                <option value="standard">Standard</option>
                                                                <option value="premium">Premium</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Price (₹) <span className="text-red-500">*</span></label>
                                                            <input
                                                                type="number"
                                                                name="price_inr"
                                                                defaultValue={editingTemplate?.price_inr || 0}
                                                                min="0"
                                                                placeholder="e.g., 299"
                                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Credits <span className="text-red-500">*</span></label>
                                                            <input
                                                                type="number"
                                                                name="price_credits"
                                                                defaultValue={editingTemplate?.price_credits || 0}
                                                                min="0"
                                                                placeholder="e.g., 200"
                                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Media & Assets</h4>
                                                    
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Thumbnail URL</label>
                                                            <input
                                                                name="thumbnail_url"
                                                                defaultValue={editingTemplate?.thumbnail_url}
                                                                placeholder="https://..."
                                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Preview URL</label>
                                                            <input
                                                                name="preview_url"
                                                                defaultValue={editingTemplate?.preview_url}
                                                                placeholder="https://..."
                                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Features</h4>
                                                    
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                            Feature List <span className="text-gray-500 text-xs">(comma-separated)</span>
                                                        </label>
                                                        <input
                                                            name="features"
                                                            defaultValue={editingTemplate?.features?.join(', ')}
                                                            placeholder="e.g., Responsive Design, Dark Mode, Animations"
                                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                                        />
                                                    </div>

                                                    <div className="flex flex-wrap gap-4">
                                                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                name="responsive"
                                                                defaultChecked={editingTemplate?.responsive}
                                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                            />
                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                            Responsive Design
                                                        </label>
                                                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                name="javascript"
                                                                defaultChecked={editingTemplate?.javascript}
                                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                            />
                                                            <CheckCircle className="h-4 w-4 text-blue-600" />
                                                            JavaScript Interactions
                                                        </label>
                                                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                name="dark_mode"
                                                                defaultChecked={editingTemplate?.dark_mode}
                                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                            />
                                                            <CheckCircle className="h-4 w-4 text-purple-600" />
                                                            Dark Mode Support
                                                        </label>
                                                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                name="active"
                                                                defaultChecked={editingTemplate?.active ?? true}
                                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                            />
                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                            Active (Visible to Users)
                                                        </label>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Resume-specific fields */}
                                        {selectedType === 'resume' && (
                                            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Resume Settings</h4>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Price (Credits)</label>
                                                        <input
                                                            type="number"
                                                            name="price"
                                                            defaultValue={editingTemplate?.price || 0}
                                                            min="0"
                                                            placeholder="e.g., 50"
                                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Thumbnail URL</label>
                                                        <input
                                                            name="thumbnail_url"
                                                            defaultValue={editingTemplate?.thumbnail_url}
                                                            placeholder="/previews/..."
                                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex gap-6">
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
                                            </div>
                                        )}

                                        {/* Upload Notice for Portfolio */}
                                        {selectedType === 'portfolio' && !editingTemplate && (
                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                                <div className="flex gap-3">
                                                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                                    <div className="text-sm">
                                                        <p className="font-medium text-blue-900 dark:text-blue-200 mb-1">Template Files Upload Required</p>
                                                        <p className="text-blue-700 dark:text-blue-300">
                                                            After creating this template, upload the actual template files (HTML, CSS, JS) to Firebase Storage at:
                                                            <code className="block mt-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/40 rounded text-xs font-mono">
                                                                templates/portfolio/{'{tier}'}/{'{template-id}'}/
                                                            </code>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                type="button"
                                                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                                onClick={() => {
                                                    setIsModalOpen(false)
                                                    setEditingTemplate(null)
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={createMutation.isPending || updateMutation.isPending}
                                                className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
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

            {/* Upload Files Modal */}
            <Transition appear show={isUploadModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsUploadModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                        <Upload className="h-5 w-5 text-blue-600" />
                                        Upload Template Files
                                    </Dialog.Title>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                        Upload template files for <span className="font-semibold text-gray-700 dark:text-gray-300">{uploadingTemplate?.name}</span>
                                        <br />
                                        Files will be uploaded to: <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded">
                                            templates/portfolio/{uploadingTemplate?.tier}/{uploadingTemplate?.id}-portfolio/
                                        </code>
                                    </p>

                                    <form onSubmit={(e) => {
                                        e.preventDefault()
                                        if (uploadingTemplate) {
                                            uploadMutation.mutate({
                                                templateId: uploadingTemplate.id,
                                                files: uploadFiles
                                            })
                                        }
                                    }} className="space-y-4">
                                        {/* File upload fields */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    index.html <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="file"
                                                    accept=".html"
                                                    onChange={(e) => setUploadFiles({ ...uploadFiles, indexHtml: e.target.files?.[0] })}
                                                    className="w-full text-sm text-gray-500 dark:text-gray-400
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-lg file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-blue-50 file:text-blue-700
                                                        hover:file:bg-blue-100
                                                        dark:file:bg-blue-900/30 dark:file:text-blue-400
                                                        cursor-pointer"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    styles.css <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="file"
                                                    accept=".css"
                                                    onChange={(e) => setUploadFiles({ ...uploadFiles, stylesCss: e.target.files?.[0] })}
                                                    className="w-full text-sm text-gray-500 dark:text-gray-400
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-lg file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-blue-50 file:text-blue-700
                                                        hover:file:bg-blue-100
                                                        dark:file:bg-blue-900/30 dark:file:text-blue-400
                                                        cursor-pointer"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    script.js <span className="text-gray-400">(optional)</span>
                                                </label>
                                                <input
                                                    type="file"
                                                    accept=".js"
                                                    onChange={(e) => setUploadFiles({ ...uploadFiles, scriptJs: e.target.files?.[0] })}
                                                    className="w-full text-sm text-gray-500 dark:text-gray-400
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-lg file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-gray-50 file:text-gray-700
                                                        hover:file:bg-gray-100
                                                        dark:file:bg-gray-700 dark:file:text-gray-300
                                                        cursor-pointer"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    metadata.json <span className="text-gray-400">(optional)</span>
                                                </label>
                                                <input
                                                    type="file"
                                                    accept=".json"
                                                    onChange={(e) => setUploadFiles({ ...uploadFiles, metadataJson: e.target.files?.[0] })}
                                                    className="w-full text-sm text-gray-500 dark:text-gray-400
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-lg file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-gray-50 file:text-gray-700
                                                        hover:file:bg-gray-100
                                                        dark:file:bg-gray-700 dark:file:text-gray-300
                                                        cursor-pointer"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    preview.html <span className="text-gray-400">(optional)</span>
                                                </label>
                                                <input
                                                    type="file"
                                                    accept=".html"
                                                    onChange={(e) => setUploadFiles({ ...uploadFiles, previewHtml: e.target.files?.[0] })}
                                                    className="w-full text-sm text-gray-500 dark:text-gray-400
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-lg file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-gray-50 file:text-gray-700
                                                        hover:file:bg-gray-100
                                                        dark:file:bg-gray-700 dark:file:text-gray-300
                                                        cursor-pointer"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    README.md <span className="text-gray-400">(optional)</span>
                                                </label>
                                                <input
                                                    type="file"
                                                    accept=".md"
                                                    onChange={(e) => setUploadFiles({ ...uploadFiles, readmeMd: e.target.files?.[0] })}
                                                    className="w-full text-sm text-gray-500 dark:text-gray-400
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-lg file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-gray-50 file:text-gray-700
                                                        hover:file:bg-gray-100
                                                        dark:file:bg-gray-700 dark:file:text-gray-300
                                                        cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        {/* Info box */}
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                            <div className="flex gap-3">
                                                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                                <div className="text-sm">
                                                    <p className="font-medium text-blue-900 dark:text-blue-200 mb-1">File Requirements</p>
                                                    <ul className="text-blue-700 dark:text-blue-300 list-disc list-inside space-y-1">
                                                        <li><strong>index.html</strong> must be a Jinja2 template with variables like {`{{ personal.name }}`}</li>
                                                        <li><strong>styles.css</strong> should contain all styling for the template</li>
                                                        <li>JavaScript interactions are optional (set <code>javascript: true</code> in metadata)</li>
                                                        <li>Files will overwrite existing files with the same name</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                type="button"
                                                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                                onClick={() => {
                                                    setIsUploadModalOpen(false)
                                                    setUploadFiles({})
                                                    setUploadingTemplate(null)
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={uploadMutation.isPending || (!uploadFiles.indexHtml && !uploadFiles.stylesCss && !uploadFiles.scriptJs)}
                                                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {uploadMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                                <Upload className="h-4 w-4" />
                                                Upload Files
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
