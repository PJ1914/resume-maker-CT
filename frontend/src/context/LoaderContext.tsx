import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import Preloader from '@/components/ui/preloader'

interface LoaderContextType {
    showLoader: () => void
    hideLoader: () => void
    isLoading: boolean
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined)

export function LoaderProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false) // The logical state (is something loading?)
    const [isVisible, setIsVisible] = useState(false) // The render state (should preloader be in DOM?)

    const showLoader = useCallback(() => {
        setIsLoading(true)
        setIsVisible(true)
    }, [])

    const hideLoader = useCallback(() => {
        setIsLoading(false)
        // We don't set isVisible(false) here. 
        // We wait for Preloader to call onComplete after its exit animation.
    }, [])

    const onPreloaderComplete = useCallback(() => {
        setIsVisible(false)
    }, [])

    return (
        <LoaderContext.Provider value={{ showLoader, hideLoader, isLoading }}>
            {isVisible && <Preloader isLoading={isLoading} onComplete={onPreloaderComplete} />}
            {children}
        </LoaderContext.Provider>
    )
}

export const useLoader = () => {
    const context = useContext(LoaderContext)
    if (!context) throw new Error('useLoader must be used within LoaderProvider')
    return context
}
