import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Sparkles, Star, Award, Upload, Settings } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ResumePreview } from '@/components/previews/ResumePreview'
import { HeroSection } from '@/components/ui/feature-carousel'

interface Template {
  id: string
  name: string
  description: string
  features?: string[]
  icon?: typeof Sparkles
  recommended?: boolean
  color?: string
  type?: 'html' | 'latex'
  isCustom?: boolean
}

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'resume_1',
    name: 'Resume 1',
    description: 'Professional template with clean layout',
    features: ['Professional', 'Clean', 'Modern'],
    icon: Sparkles,
    recommended: true,
    color: 'primary',
    isCustom: false,
  },
  {
    id: 'resume_2',
    name: 'Resume 2',
    description: 'Classic resume style',
    features: ['Classic', 'Traditional', 'Simple'],
    icon: Award,
    recommended: true,
    color: 'secondary',
    isCustom: false,
  },
  {
    id: 'resume_3',
    name: 'Resume 3',
    description: 'Clean and modern design',
    features: ['Modern', 'Clean', 'Minimal'],
    icon: Star,
    recommended: false,
    color: 'success',
    isCustom: false,
  },
  {
    id: 'resume_4',
    name: 'Resume 4',
    description: 'Structured professional layout',
    features: ['Structured', 'Professional', 'Detailed'],
    icon: Settings,
    recommended: false,
    color: 'primary',
    isCustom: false,
  },
  {
    id: 'resume_5',
    name: 'Resume 5',
    description: 'AltaCV style - Modern and colorful',
    features: ['Colorful', 'Modern', 'Creative'],
    icon: Sparkles,
    recommended: false,
    color: 'secondary',
    isCustom: false,
  },
  {
    id: 'resume_6',
    name: 'Resume 6',
    description: 'Professional CV format',
    features: ['CV', 'Professional', 'Academic'],
    icon: Award,
    recommended: false,
    color: 'success',
    isCustom: false,
  },
  {
    id: 'resume_7',
    name: 'Resume 7',
    description: 'Comprehensive resume template',
    features: ['Comprehensive', 'Detailed', 'Professional'],
    icon: Star,
    recommended: false,
    color: 'primary',
    isCustom: false,
  },
]

export default function TemplateSelectionPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern')
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES)

  useEffect(() => {
    // Load custom templates from localStorage (in production, fetch from API)
    const savedTemplates = localStorage.getItem('customTemplates')
    if (savedTemplates) {
      try {
        const customTemplates = JSON.parse(savedTemplates)
        setTemplates([...DEFAULT_TEMPLATES, ...customTemplates])
      } catch (error) {
        console.error('Failed to load custom templates:', error)
      }
    }
  }, [])

  const handleContinue = () => {
    // Store selected template in localStorage or context
    localStorage.setItem('selectedTemplate', selectedTemplate)
    console.log('Navigating to wizard with template:', selectedTemplate)
    navigate('/resume/wizard', { state: { templateId: selectedTemplate } })
  }

  const carouselItems = DEFAULT_TEMPLATES.map(t => {
    const isSelected = selectedTemplate === t.id;
    return {
      id: t.id,
      content: (
        <div className="w-full h-full relative group cursor-pointer" onClick={() => setSelectedTemplate(t.id)}>
          <div className="w-full h-full bg-white">
            <ResumePreview templateId={t.id} width={320} />
          </div>

          {/* Always visible info on mobile, hover on desktop */}
          <div className={`absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4 text-center backdrop-blur-sm transition-opacity duration-300 flex flex-col gap-3
              ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <div>
              <p className="font-bold text-lg">{t.name}</p>
              <p className="text-xs text-gray-300">{t.description}</p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isSelected) {
                  handleContinue();
                } else {
                  setSelectedTemplate(t.id);
                }
              }}
              className={`w-full py-3 rounded-lg text-sm font-bold transition-all transform active:scale-95 shadow-lg
                  ${isSelected
                  ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/30'
                  : 'bg-white text-black hover:bg-gray-100'}`}
            >
              {isSelected ? (
                <span className="flex items-center justify-center gap-2">
                  Build Resume <ArrowRight className="w-4 h-4" />
                </span>
              ) : 'Select Template'}
            </button>
          </div>

          {/* Selected Indicator (Top Right) */}
          {isSelected && (
            <div className="absolute top-4 right-4 z-20 bg-green-500 text-white rounded-full p-2 shadow-lg animate-in fade-in zoom-in duration-300">
              <Check className="w-5 h-5" />
            </div>
          )}
        </div>
      )
    };
  });

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-800 sticky top-0 z-40 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400 hover:text-primary-900 dark:hover:text-primary-400 transition-colors group font-medium text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>
            <h1 className="text-lg sm:text-2xl font-bold text-primary-900 dark:text-white truncate px-2">
              Choose Template
            </h1>
            <div className="w-14 sm:w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content Area - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[100vw] overflow-hidden">
        {/* Hero Carousel */}
        <HeroSection
          title={<>Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">Perfect Template</span></>}
          subtitle="Swipe to explore our professional collection of ATS-friendly resume templates"
          items={carouselItems}
          className="w-full"
        />
      </div>
    </div>
  )
}
