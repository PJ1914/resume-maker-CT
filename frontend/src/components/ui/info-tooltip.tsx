import { Info } from 'lucide-react'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface InfoTooltipProps {
    content: string
}

export function InfoTooltip({ content }: InfoTooltipProps) {
    const [isVisible, setIsVisible] = useState(false)

    return (
        <div className="relative inline-flex items-center ml-1.5">
            <button
                type="button"
                className="text-secondary-400 hover:text-primary-500 transition-colors focus:outline-none"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onClick={() => setIsVisible(!isVisible)}
            >
                <Info className="w-4 h-4" />
            </button>

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-secondary-900 dark:bg-white text-white dark:text-secondary-900 text-xs rounded-lg shadow-xl z-50 pointer-events-none"
                    >
                        {content}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-secondary-900 dark:border-t-white" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
