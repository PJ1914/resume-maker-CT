import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface TourStep {
    id: string
    title: string
    description: string
    path: string
    target?: string // CSS selector for highlighting (future enhancement)
}

interface TourContextType {
    isOpen: boolean
    currentStepIndex: number
    steps: TourStep[]
    startTour: () => void
    endTour: () => void
    nextStep: () => void
    prevStep: () => void
}

const TourContext = createContext<TourContextType | undefined>(undefined)

export const TOUR_STEPS: TourStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to Resume Maker',
        description: 'Let us take you on a quick tour of the platform features.',
        path: '/dashboard'
    },
    {
        id: 'resumes',
        title: 'Manage Your Resumes',
        description: 'Here you can see all your created and uploaded resumes. You can edit, download, or delete them.',
        path: '/resumes'
    },
    {
        id: 'upload',
        title: 'Upload Existing Resume',
        description: 'Already have a resume? Upload it here to get an instant ATS score and AI-powered analysis.',
        path: '/upload'
    },
    {
        id: 'create',
        title: 'Create from Scratch',
        description: 'Start fresh with our professional templates. Our wizard will guide you through every section.',
        path: '/resume/create'
    },
    {
        id: 'templates',
        title: 'Professional Templates',
        description: 'Browse our collection of ATS-friendly templates designed to get you hired.',
        path: '/templates'
    },
    {
        id: 'finish',
        title: 'You are all set!',
        description: 'You now know your way around. Start building your perfect resume today!',
        path: '/dashboard'
    }
]

export function TourProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [currentStepIndex, setCurrentStepIndex] = useState(0)
    const navigate = useNavigate()
    const location = useLocation()

    // Check for first-time user on mount
    useEffect(() => {
        const hasSeenTour = localStorage.getItem('hasSeenTour')
        if (!hasSeenTour) {
            // Small delay to ensure app is fully loaded
            setTimeout(() => {
                startTour()
            }, 1000)
        }
    }, [])

    const startTour = () => {
        setIsOpen(true)
        setCurrentStepIndex(0)
        navigate(TOUR_STEPS[0].path)
    }

    const endTour = () => {
        setIsOpen(false)
        localStorage.setItem('hasSeenTour', 'true')
        navigate('/dashboard')
    }

    const nextStep = () => {
        const nextIndex = currentStepIndex + 1
        if (nextIndex < TOUR_STEPS.length) {
            setCurrentStepIndex(nextIndex)
            navigate(TOUR_STEPS[nextIndex].path)
        } else {
            endTour()
        }
    }

    const prevStep = () => {
        const prevIndex = currentStepIndex - 1
        if (prevIndex >= 0) {
            setCurrentStepIndex(prevIndex)
            navigate(TOUR_STEPS[prevIndex].path)
        }
    }

    return (
        <TourContext.Provider
            value={{
                isOpen,
                currentStepIndex,
                steps: TOUR_STEPS,
                startTour,
                endTour,
                nextStep,
                prevStep
            }}
        >
            {children}
        </TourContext.Provider>
    )
}

export function useTour() {
    const context = useContext(TourContext)
    if (context === undefined) {
        throw new Error('useTour must be used within a TourProvider')
    }
    return context
}
