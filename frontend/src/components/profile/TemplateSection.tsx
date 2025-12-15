import { motion } from 'framer-motion'
import { Layout, Lock, Eye, ChevronLeft, ChevronRight, Sparkles, Award, Star, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import { ResumePreview } from '@/components/previews/ResumePreview'

// All 7 resume templates
const ALL_TEMPLATES = [
    {
        id: 'resume_1',
        name: 'Resume 1',
        description: 'Professional template with clean layout',
        features: ['Professional', 'Clean', 'Modern'],
        icon: Sparkles,
        status: 'owned',
        color: 'from-blue-500 to-purple-500',
    },
    {
        id: 'resume_2',
        name: 'Resume 2',
        description: 'Classic resume style',
        features: ['Classic', 'Traditional', 'Simple'],
        icon: Award,
        status: 'owned',
        color: 'from-green-500 to-teal-500',
    },
    {
        id: 'resume_3',
        name: 'Resume 3',
        description: 'Clean and modern design',
        features: ['Modern', 'Clean', 'Minimal'],
        icon: Star,
        status: 'owned',
        color: 'from-orange-500 to-red-500',
    },
    {
        id: 'resume_4',
        name: 'Resume 4',
        description: 'Structured professional layout',
        features: ['Structured', 'Professional', 'Detailed'],
        icon: Settings,
        status: 'owned',
        color: 'from-indigo-500 to-blue-500',
    },
    {
        id: 'resume_5',
        name: 'Resume 5',
        description: 'AltaCV style - Modern and colorful',
        features: ['Colorful', 'Modern', 'Creative'],
        icon: Sparkles,
        status: 'owned',
        color: 'from-pink-500 to-rose-500',
    },
    {
        id: 'resume_6',
        name: 'Resume 6',
        description: 'Professional CV format',
        features: ['CV', 'Professional', 'Academic'],
        icon: Award,
        status: 'owned',
        color: 'from-cyan-500 to-blue-500',
    },
    {
        id: 'resume_7',
        name: 'Resume 7',
        description: 'Comprehensive resume template',
        features: ['Comprehensive', 'Detailed', 'Professional'],
        icon: Star,
        status: 'owned',
        color: 'from-violet-500 to-purple-500',
    },
]

export default function TemplateSection() {
    const navigate = useNavigate()
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    const updateScrollButtons = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
            setCanScrollLeft(scrollLeft > 0)
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
        }
    }

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' })
            setTimeout(updateScrollButtons, 300)
        }
    }

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' })
            setTimeout(updateScrollButtons, 300)
        }
    }

    const handleUseTemplate = (templateId: string) => {
        localStorage.setItem('selectedTemplate', templateId)
        navigate('/resume/wizard', { state: { templateId } })
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-[#111111] rounded-2xl p-6 border border-secondary-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                    <Layout className="h-5 w-5 text-purple-400" />
                    Template Library
                    <span className="text-xs font-normal text-secondary-500 dark:text-gray-500 ml-2">
                        ({ALL_TEMPLATES.length} templates)
                    </span>
                </h2>
                <div className="flex items-center gap-2">
                    {/* Scroll buttons */}
                    <button
                        onClick={scrollLeft}
                        disabled={!canScrollLeft}
                        className={`p-1.5 rounded-lg border transition-all ${canScrollLeft
                                ? 'border-secondary-200 dark:border-white/10 hover:bg-secondary-100 dark:hover:bg-white/5 text-secondary-600 dark:text-gray-400'
                                : 'border-transparent text-secondary-300 dark:text-gray-600 cursor-not-allowed'
                            }`}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={scrollRight}
                        disabled={!canScrollRight}
                        className={`p-1.5 rounded-lg border transition-all ${canScrollRight
                                ? 'border-secondary-200 dark:border-white/10 hover:bg-secondary-100 dark:hover:bg-white/5 text-secondary-600 dark:text-gray-400'
                                : 'border-transparent text-secondary-300 dark:text-gray-600 cursor-not-allowed'
                            }`}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => navigate('/templates')}
                        className="text-xs sm:text-sm text-secondary-500 dark:text-gray-400 hover:text-secondary-900 dark:hover:text-white transition-colors ml-2"
                    >
                        Browse All
                    </button>
                </div>
            </div>

            {/* Horizontal scrolling templates */}
            <div
                ref={scrollContainerRef}
                onScroll={updateScrollButtons}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-secondary-300 dark:scrollbar-thumb-white/20 scrollbar-track-transparent"
                style={{ scrollbarWidth: 'thin' }}
            >
                {ALL_TEMPLATES.map((template) => {
                    const IconComponent = template.icon
                    return (
                        <div
                            key={template.id}
                            className="group relative flex-shrink-0 w-[200px] sm:w-[220px] rounded-xl overflow-hidden border border-secondary-200 dark:border-white/10 bg-secondary-50 dark:bg-[#0a0a0a] hover:border-purple-400 dark:hover:border-purple-500/30 transition-all hover:shadow-lg dark:hover:shadow-purple-500/5"
                        >
                            {/* Template Preview */}
                            <div className="aspect-[3/4] bg-white dark:bg-[#1a1a1a] flex items-center justify-center relative overflow-hidden">
                                {/* Gradient background with icon */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-5`} />

                                {/* Resume Preview */}
                                <div className="w-full h-full flex items-center justify-center p-2">
                                    <ResumePreview templateId={template.id} width={180} />
                                </div>

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                                    <button
                                        onClick={() => handleUseTemplate(template.id)}
                                        className="px-4 py-2 bg-white text-black text-xs font-medium rounded-full flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-lg"
                                    >
                                        <Eye className="h-3.5 w-3.5" /> Use Template
                                    </button>
                                    {template.status === 'locked' && (
                                        <button className="px-4 py-2 bg-yellow-500 text-white text-xs font-medium rounded-full flex items-center gap-2 hover:bg-yellow-600 transition-colors shadow-lg">
                                            <Lock className="h-3.5 w-3.5" /> Unlock
                                        </button>
                                    )}
                                </div>

                                {/* Template Icon Badge */}
                                <div className={`absolute top-3 left-3 p-2 rounded-lg bg-gradient-to-br ${template.color} shadow-lg`}>
                                    <IconComponent className="h-3.5 w-3.5 text-white" />
                                </div>
                            </div>

                            {/* Template Info */}
                            <div className="p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-medium text-secondary-900 dark:text-white text-sm truncate">
                                        {template.name}
                                    </h3>
                                    {template.status === 'locked' ? (
                                        <Lock className="h-3 w-3 text-secondary-400 dark:text-gray-400 flex-shrink-0" />
                                    ) : (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 font-medium">
                                            Free
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-secondary-500 dark:text-gray-400 line-clamp-1 mb-2">
                                    {template.description}
                                </p>
                                {/* Feature tags */}
                                <div className="flex flex-wrap gap-1">
                                    {template.features.slice(0, 2).map((feature, idx) => (
                                        <span
                                            key={idx}
                                            className="text-[10px] px-1.5 py-0.5 rounded bg-secondary-100 dark:bg-white/5 text-secondary-600 dark:text-gray-400"
                                        >
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Scroll hint for mobile */}
            <div className="flex justify-center mt-2 sm:hidden">
                <span className="text-xs text-secondary-400 dark:text-gray-500">
                    ← Swipe to see more →
                </span>
            </div>
        </motion.div>
    )
}
