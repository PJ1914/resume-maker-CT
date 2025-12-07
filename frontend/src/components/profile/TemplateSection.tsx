import { motion } from 'framer-motion'
import { Layout, Lock, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { templateService } from '@/services/templates.service'

export default function TemplateSection() {
    const navigate = useNavigate()

    const { data: templates, isLoading } = useQuery({
        queryKey: ['templates'],
        queryFn: () => templateService.listTemplates(),
    })

    // Default templates if none from API (or merge them)
    const defaultTemplates = [
        { id: 'modern', name: 'Modern', type: 'Resume', status: 'owned', preview: '/templates/modern.png' },
        { id: 'professional', name: 'Professional', type: 'Resume', status: 'owned', preview: '/templates/professional.png' },
        { id: 'creative', name: 'Creative', type: 'Resume', status: 'owned', preview: '/templates/creative.png' },
    ]

    const displayTemplates = templates && templates.length > 0 ? templates : defaultTemplates

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-sm border border-secondary-100 dark:border-secondary-700"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                    <Layout className="h-5 w-5 text-purple-500" />
                    Template Library
                </h2>
                <button
                    onClick={() => navigate('/templates')}
                    className="text-xs sm:text-sm text-secondary-500 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white transition-colors"
                >
                    Browse Store
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-[3/4] bg-secondary-100 dark:bg-secondary-700/50 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {displayTemplates.map((template: any) => (
                        <div key={template.id} className="group relative rounded-xl overflow-hidden border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900/50 hover:border-purple-200 dark:hover:border-purple-800 transition-all">
                            {/* Thumbnail Placeholder */}
                            <div className="aspect-[3/4] bg-white dark:bg-secondary-800 flex items-center justify-center relative">
                                <span className="text-secondary-400 text-xs">{template.name} Preview</span>

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                    <button className="px-3 py-1.5 bg-white text-black text-xs font-medium rounded-full flex items-center gap-1 hover:bg-secondary-100">
                                        <Eye className="h-3 w-3" /> Preview
                                    </button>
                                    {template.status === 'locked' && (
                                        <button className="px-3 py-1.5 bg-yellow-500 text-white text-xs font-medium rounded-full flex items-center gap-1 hover:bg-yellow-600">
                                            <Lock className="h-3 w-3" /> Unlock
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-medium text-secondary-900 dark:text-white text-sm truncate">{template.name}</h3>
                                    {template.status === 'locked' && (
                                        <Lock className="h-3 w-3 text-secondary-400" />
                                    )}
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-secondary-500 dark:text-secondary-400">{template.type || 'Resume'}</span>
                                    {template.status === 'locked' ? (
                                        <span className="text-yellow-600 dark:text-yellow-500 font-medium">{template.price || 'Premium'}</span>
                                    ) : (
                                        <span className="text-green-600 dark:text-green-400 font-medium">Owned</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    )
}
