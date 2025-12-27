import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Book, ChevronRight, Menu, Search, X,
    Lightbulb, Shield, HelpCircle, FileText, Zap, Globe, Target,
    Rocket, CheckCircle, Mic, CreditCard, Wrench, ChevronDown,
    Loader2
} from 'lucide-react'
import PublicLayout from '../components/layouts/PublicLayout'
import { SEO } from '../components/SEO'

// --- Types ---
interface Category {
    id: string
    title: string
    order: number
    icon: string
}

interface ArticleSummary {
    slug: string
    title: string
    order: number
    categoryId: string
}

interface HelpStructure {
    categories: Category[]
    articles: Record<string, ArticleSummary[]>
}

interface ArticleDetail extends ArticleSummary {
    content: string
    updatedAt?: string
}

// --- Icon Mapping ---
const iconMap: Record<string, any> = {
    Book, Rocket, Star: Target, FileText, CheckCircle,
    Mic, Globe, CreditCard, Zap, Lightbulb, Wrench,
    HelpCircle, Shield
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function DocumentationPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const currentSlug = searchParams.get('slug')

    // State
    const [structure, setStructure] = useState<HelpStructure | null>(null)
    const [activeSlug, setActiveSlug] = useState<string | null>(currentSlug)
    const [article, setArticle] = useState<ArticleDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [articleLoading, setArticleLoading] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})

    // Internal Cache for speed
    const [articleCache, setArticleCache] = useState<Record<string, ArticleDetail>>({})

    // Fetch Structure on Mount
    useEffect(() => {
        async function fetchStructure() {
            try {
                const res = await fetch(`${API_URL}/api/help/structure`)
                if (res.ok) {
                    const data = await res.json() as HelpStructure
                    setStructure(data)
                    // Default to first article if no slug
                    if (!currentSlug && data.categories.length > 0) {
                        const firstCatId = data.categories[0].id
                        const firstArticles = data.articles[firstCatId]
                        if (firstArticles && firstArticles.length > 0) {
                            handleSelectArticle(firstArticles[0].slug)
                        }
                    } else if (currentSlug) {
                        // Ensure parent category is open
                        // Logic omitted for brevity, user can click to open
                    }

                    // Expand all categories by default
                    const initialOpen: Record<string, boolean> = {}
                    data.categories.forEach(c => initialOpen[c.id] = true)
                    setOpenCategories(initialOpen)
                }
            } catch (err) {
                console.error("Failed to fetch help structure", err)
            } finally {
                setLoading(false)
            }
        }
        fetchStructure()
    }, [])

    // Fetch Article when activeSlug changes
    useEffect(() => {
        if (!activeSlug) return

        // Check Cache
        if (articleCache[activeSlug]) {
            setArticle(articleCache[activeSlug])
            if (activeSlug) {
                setSearchParams({ slug: activeSlug })
            } else {
                setSearchParams({})
            }
            // don't scroll if cached? or yes?
            // window.scrollTo(0, 0) // Optional, maybe annoying if instant
            return
        }

        async function fetchArticle() {
            setArticleLoading(true)
            try {
                const res = await fetch(`${API_URL}/api/help/article/${activeSlug}`)
                if (res.ok) {
                    const data = await res.json()
                    setArticle(data)
                    if (activeSlug) {
                        setArticleCache(prev => ({ ...prev, [activeSlug]: data }))
                    }

                    if (activeSlug) {
                        setSearchParams({ slug: activeSlug })
                    } else {
                        setSearchParams({})
                    }
                    window.scrollTo(0, 0)
                }
            } catch (err) {
                console.error("Failed to fetch article", err)
            } finally {
                setArticleLoading(false)
            }
        }
        fetchArticle()
    }, [activeSlug])

    const handleSelectArticle = (slug: string) => {
        setActiveSlug(slug)
        setMobileMenuOpen(false)
    }

    const toggleCategory = (catId: string) => {
        setOpenCategories(prev => ({ ...prev, [catId]: !prev[catId] }))
    }

    // --- Renderers ---

    const Sidebar = () => {
        if (!structure) return null
        return (
            <nav className="space-y-6 pb-20">
                {structure.categories.map(cat => {
                    const Icon = iconMap[cat.icon] || Book
                    const isOpen = openCategories[cat.id]
                    const articles = structure.articles[cat.id] || []

                    if (articles.length === 0) return null

                    return (
                        <div key={cat.id} className="select-none">
                            <button
                                onClick={() => toggleCategory(cat.id)}
                                className="flex items-center justify-between w-full text-left px-2 py-1.5 text-sm font-semibold text-gray-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <Icon className="w-4 h-4 text-purple-500" />
                                    {cat.title}
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                            </button>

                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.ul
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mt-1 ml-2 space-y-0.5 border-l border-gray-200 dark:border-white/10 pl-2 overflow-hidden"
                                    >
                                        {articles.map(art => (
                                            <li key={art.slug}>
                                                <button
                                                    onClick={() => handleSelectArticle(art.slug)}
                                                    className={`text-[13px] leading-6 w-full text-left px-3 py-1.5 rounded-md transition-colors border-l-2 -ml-[9px] ${activeSlug === art.slug
                                                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium'
                                                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-700'
                                                        }`}
                                                >
                                                    {art.title}
                                                </button>
                                            </li>
                                        ))}
                                    </motion.ul>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                })}
            </nav>
        )
    }

    return (
        <PublicLayout onMobileMenuClick={() => setMobileMenuOpen(true)}>
            <SEO
                title={article ? `${article.title} - Documentation` : "Prativeda Documentation"}
                description="Comprehensive guides and documentation for Prativeda."
            />

            <div className="flex w-full min-h-screen pt-16 relative">



                {/* Sidebar (Desktop) - Glassmorphism */}
                <aside className="hidden lg:block w-72 flex-shrink-0 border-r border-gray-200 dark:border-white/10 overflow-y-auto h-[calc(100vh-64px)] sticky top-[64px] bg-white/50 dark:bg-black/30 backdrop-blur-md p-6">
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search documentation..."
                                className="w-full pl-9 pr-4 py-2 bg-white/80 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-full ml-4"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Sidebar />
                    )}
                </aside>

                {/* Sidebar (Mobile) */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setMobileMenuOpen(false)}
                                className="fixed inset-0 bg-black/60 z-[55] lg:hidden"
                            />
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-white/10 z-[60] p-6 overflow-y-auto"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Documentation</h2>
                                    <button onClick={() => setMobileMenuOpen(false)}>
                                        <X className="w-6 h-6 text-gray-500" />
                                    </button>
                                </div>
                                <Sidebar />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <main className="flex-1 w-full max-w-5xl mx-auto px-4 lg:px-8 py-8 lg:py-10">
                    {loading || articleLoading ? (
                        <article className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-xl border border-white/20 dark:border-white/5 animate-pulse">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="h-4 w-4 bg-gray-200 dark:bg-white/10 rounded"></div>
                                <div className="h-4 w-12 bg-gray-200 dark:bg-white/10 rounded"></div>
                                <div className="h-4 w-4 bg-gray-200 dark:bg-white/10 rounded"></div>
                                <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded"></div>
                            </div>
                            <div className="h-10 w-3/4 bg-gray-200 dark:bg-white/20 rounded mb-8"></div>
                            <div className="space-y-4 max-w-3xl">
                                <div className="h-4 w-full bg-gray-200 dark:bg-white/10 rounded"></div>
                                <div className="h-4 w-full bg-gray-200 dark:bg-white/10 rounded"></div>
                                <div className="h-4 w-5/6 bg-gray-200 dark:bg-white/10 rounded"></div>
                                <div className="h-4 w-full bg-gray-200 dark:bg-white/10 rounded"></div>
                            </div>
                        </article>
                    ) : article ? (
                        <article className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-xl border border-white/20 dark:border-white/5
                            prose prose-slate dark:prose-invert max-w-none 
                            prose-headings:font-bold prose-headings:tracking-tight 
                            prose-a:text-purple-600 dark:prose-a:text-purple-400 hover:prose-a:text-purple-500
                            prose-img:rounded-xl prose-img:shadow-lg
                            prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:bg-purple-50 dark:prose-blockquote:bg-purple-900/10 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                        ">
                            <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Book className="w-4 h-4" />
                                <span>Docs</span>
                                <ChevronRight className="w-4 h-4" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {structure?.categories.find(c => c.id === article.categoryId)?.title}
                                </span>
                            </div>


                            <ReactMarkdown>{article.content}</ReactMarkdown>

                            <div className="mt-12 pt-6 border-t border-gray-200 dark:border-white/10 text-sm text-gray-500 flex justify-between items-center">
                                <span>Last updated: {article.updatedAt ? new Date(article.updatedAt).toLocaleDateString() : 'Recently'}</span>
                                <div className="flex gap-4">
                                    <button className="hover:text-purple-600 transition-colors">Was this helpful?</button>
                                    <button className="text-purple-600 hover:underline">Edit this page</button>
                                </div>
                            </div>
                        </article>
                    ) : (
                        <div className="text-center py-20 text-gray-500 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl">
                            Select an article to view documentation.
                        </div>
                    )}
                </main>
            </div>
        </PublicLayout>
    )
}
