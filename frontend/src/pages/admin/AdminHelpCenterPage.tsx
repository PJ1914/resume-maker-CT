import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Search, Save, X, ChevronDown, ChevronRight, FileText, Folder } from 'lucide-react'
import { toast } from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { adminService } from '@/services/admin.service'

interface Category {
    id: string
    title: string
    order: number
    icon: string
}

interface Article {
    slug: string
    title: string
    order: number
    categoryId: string
    content?: string
    updatedAt?: string // populated on fetch detail
}

interface HelpStructure {
    categories: Category[]
    articles: Record<string, Article[]>
}

export default function AdminHelpCenterPage() {
    const [structure, setStructure] = useState<HelpStructure | null>(null)
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingArticle, setEditingArticle] = useState<Article | null>(null)
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        categoryId: '',
        order: 0,
        content: ''
    })

    const fetchStructure = async () => {
        setLoading(true)
        try {
            const data = await adminService.getHelpStructure()
            setStructure(data)
            // Open all categories by default
            const initialOpen: Record<string, boolean> = {}
            data.categories.forEach((c: Category) => initialOpen[c.id] = true)
            setOpenCategories(prev => ({ ...initialOpen, ...prev }))
        } catch (error) {
            toast.error('Failed to load documentation')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStructure()
    }, [])

    const toggleCategory = (id: string) => {
        setOpenCategories(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const handleEdit = async (slug: string) => {
        try {
            const article = await adminService.getHelpArticle(slug)
            setEditingArticle(article)
            setFormData({
                title: article.title,
                slug: article.slug,
                categoryId: article.categoryId,
                order: article.order,
                content: article.content
            })
            setIsModalOpen(true)
        } catch (error) {
            toast.error('Failed to load article details')
        }
    }

    const handleDelete = async (slug: string) => {
        if (!confirm('Are you sure you want to delete this article?')) return
        try {
            await adminService.deleteHelpArticle(slug)
            toast.success('Article deleted')
            fetchStructure()
        } catch (error) {
            toast.error('Failed to delete article')
        }
    }

    const handleAdd = () => {
        setEditingArticle(null)
        setFormData({
            title: '',
            slug: '',
            categoryId: structure?.categories[0]?.id || 'getting-started',
            order: 0,
            content: '# New Article\n\nStart writing...'
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await adminService.saveHelpArticle({
                ...formData,
                // Ensure slug is not empty, or auto-generate
                slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            })
            toast.success('Article saved')
            setIsModalOpen(false)
            fetchStructure()
        } catch (error) {
            toast.error('Failed to save article')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Documentation Management</h1>
                    <p className="text-gray-400">Create, edit, and organize help articles</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Article
                </button>
            </div>

            <div className="bg-black border border-white/10 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Loading documentation...</div>
                ) : !structure ? (
                    <div className="p-8 text-center text-gray-400">Failed to load data</div>
                ) : (
                    <div className="divide-y divide-white/10">
                        {structure.categories.map(cat => (
                            <div key={cat.id} className="bg-white/5">
                                <div
                                    className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors"
                                    onClick={() => toggleCategory(cat.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Folder className="w-5 h-5 text-purple-400" />
                                        <span className="font-semibold text-white">{cat.title} ({structure.articles[cat.id]?.length || 0})</span>
                                    </div>
                                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openCategories[cat.id] ? 'rotate-180' : ''}`} />
                                </div>
                                <AnimatePresence>
                                    {openCategories[cat.id] && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden bg-black"
                                        >
                                            <div className="px-6 py-2 space-y-1">
                                                {structure.articles[cat.id]?.map(article => (
                                                    <div key={article.slug} className="flex items-center justify-between py-2 pl-8 pr-4 hover:bg-white/5 rounded-lg group">
                                                        <div className="flex items-center gap-3">
                                                            <FileText className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
                                                            <span className="text-gray-300 group-hover:text-white transition-colors">{article.title}</span>
                                                            <span className="text-xs text-gray-600 font-mono bg-white/5 px-2 py-0.5 rounded">{article.slug}</span>
                                                            {/* Show Order */}
                                                            <span className="text-xs text-gray-600">Order: {article.order}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleEdit(article.slug) }}
                                                                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                                                                title="Edit"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDelete(article.slug) }}
                                                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!structure.articles[cat.id] || structure.articles[cat.id].length === 0) && (
                                                    <div className="pl-8 py-2 text-sm text-gray-600 italic">No articles in this category</div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit/Add Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                <h2 className="text-xl font-bold text-white">
                                    {editingArticle ? 'Edit Article' : 'New Article'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Title</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Slug (ID) - Must be unique</label>
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="auto-generated-if-empty"
                                            disabled={!!editingArticle} // Disable slug edit for existing? Or allow change (creates new doc in Firestore if changed)
                                        // Firestore update creates new if ID changes. We usually don't allow changing ID easily. 
                                        // If user changes slug, it creates a copy. Old one remains properly.
                                        // I'll keep it editable but warn or handle deletion of old?
                                        // For simplicity, let's keep it editable but note it creates new if changed.
                                        // Actually line 119 in help.py: db...document(article.slug).set(...)
                                        // If I change slug, it makes new doc. Old doc stays.
                                        // I'll disable it for editing to avoid duplicates/orphans.
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Category</label>
                                        <select
                                            value={formData.categoryId}
                                            onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        >
                                            {structure?.categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Order</label>
                                        <input
                                            type="number"
                                            value={formData.order}
                                            onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 h-[400px] flex flex-col">
                                    <label className="text-sm font-medium text-gray-400">Content (Markdown)</label>
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                                        <textarea
                                            value={formData.content}
                                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full h-full bg-black border border-white/10 rounded-lg p-4 text-white font-mono text-sm resize-none focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="# Article Content..."
                                        />
                                        <div className="hidden md:block h-full bg-zinc-900 border border-white/10 rounded-lg p-4 overflow-y-auto prose prose-invert max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            </form>

                            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Article
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
