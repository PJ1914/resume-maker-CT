import { useState } from 'react'
import { Sparkles, Loader2, Check, X } from 'lucide-react'
import { apiClient } from '../../services/api'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

interface AIEnhancedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    context: 'summary' | 'experience' | 'project_description'
    onEnhance?: (enhancedText: string) => void
}

export function AIEnhancedTextarea({
    className,
    value,
    onChange,
    label,
    context,
    onEnhance,
    ...props
}: AIEnhancedTextareaProps) {
    const [isEnhancing, setIsEnhancing] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [enhancedText, setEnhancedText] = useState('')
    const [originalText, setOriginalText] = useState('')

    const handleEnhance = async () => {
        const textToEnhance = String(value || '')
        if (!textToEnhance.trim()) {
            toast.error('Please enter some text first')
            return
        }

        if (textToEnhance.length < 10) {
            toast.error('Please enter at least 10 characters')
            return
        }

        try {
            setIsEnhancing(true)
            setOriginalText(textToEnhance)

            const response: any = await apiClient.post('/api/ai/improve', {
                text: textToEnhance,
                context
            })

            if (response && response.improved) {
                setEnhancedText(response.improved)
                setShowPreview(true)
                toast.success('AI suggestions ready!')
            }
        } catch (error) {
            console.error('AI Enhance error:', error)
            toast.error('Failed to enhance text. Please try again.')
        } finally {
            setIsEnhancing(false)
        }
    }

    const acceptEnhancement = () => {
        // Create a synthetic event to trigger onChange
        const event = {
            target: { value: enhancedText }
        } as React.ChangeEvent<HTMLTextAreaElement>

        onChange?.(event)
        if (onEnhance) onEnhance(enhancedText)

        setShowPreview(false)
        setEnhancedText('')
        toast.success('Applied AI enhancement!')
    }

    const rejectEnhancement = () => {
        setShowPreview(false)
        setEnhancedText('')
    }

    return (
        <div className="relative">
            {label && (
                <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                        {label}
                    </label>
                    {!showPreview && (
                        <button
                            type="button"
                            onClick={handleEnhance}
                            disabled={isEnhancing || !value}
                            className="text-xs flex items-center gap-1.5 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isEnhancing ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Sparkles className="w-3.5 h-3.5" />
                            )}
                            {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
                        </button>
                    )}
                </div>
            )}

            <div className="relative">
                <AnimatePresence mode="wait">
                    {showPreview ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute inset-0 z-10 bg-white dark:bg-secondary-800 rounded-lg border-2 border-purple-500 dark:border-purple-400 shadow-lg flex flex-col overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-3 py-2 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800/50">
                                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    AI Suggestion
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={rejectEnhancement}
                                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"
                                        title="Discard"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={acceptEnhancement}
                                        className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 rounded transition-colors"
                                        title="Apply"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-3 text-sm text-secondary-800 dark:text-secondary-200 overflow-y-auto flex-1 whitespace-pre-wrap">
                                {enhancedText}
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                <textarea
                    value={value}
                    onChange={onChange}
                    className={cn(
                        "w-full rounded-lg border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm min-h-[120px] resize-y transition-all",
                        className
                    )}
                    {...props}
                />

                {!label && !showPreview && (
                    <button
                        type="button"
                        onClick={handleEnhance}
                        disabled={isEnhancing || !value}
                        className="absolute bottom-3 right-3 p-1.5 bg-white dark:bg-secondary-700 text-purple-600 dark:text-purple-400 rounded-md shadow-sm border border-secondary-200 dark:border-secondary-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Enhance with AI"
                    >
                        {isEnhancing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Sparkles className="w-4 h-4" />
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}
