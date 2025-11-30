import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Sparkles, Star, Award, Upload, Settings } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

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
    id: 'modern',
    name: 'Modern Professional',
    description: 'Clean and contemporary design with bold section headers',
    features: ['Color accents', 'Professional header', 'Visual hierarchy', 'ATS-friendly'],
    icon: Sparkles,
    recommended: true,
    color: 'primary',
    isCustom: false,
  },
  {
    id: 'classic',
    name: 'Classic Traditional',
    description: 'Timeless format preferred by traditional industries',
    features: ['Conservative styling', 'Business formal', 'Traditional layout', 'Black & white'],
    icon: Award,
    recommended: true,
    color: 'secondary',
    isCustom: false,
  },
  {
    id: 'minimalist',
    name: 'Minimalist Clean',
    description: 'Simple and elegant with focus on content',
    features: ['Extra whitespace', 'Subtle accents', 'Clean typography', 'Modern look'],
    icon: Star,
    recommended: true,
    color: 'success',
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

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950">
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <h2 className="text-2xl sm:text-4xl font-bold text-secondary-900 dark:text-white mb-2 sm:mb-4">
              Choose Your Resume Template
            </h2>
            <p className="text-secondary-600 dark:text-secondary-400 text-sm sm:text-lg">
              Select a default template or use your custom one. You can always change it later.
            </p>
          </div>
          <button
            onClick={() => navigate('/templates')}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            Manage Templates
          </button>
        </div>

        {/* Default Templates Section */}
        <div className="mb-8 sm:mb-12">
          <h3 className="text-lg sm:text-xl font-semibold text-secondary-800 dark:text-secondary-200 mb-4 sm:mb-6">Recommended Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {DEFAULT_TEMPLATES.map((template) => {
              const Icon = template.icon
              const isSelected = selectedTemplate === template.id

              return (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`group relative bg-white dark:bg-secondary-900 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-medium hover:-translate-y-1 ${isSelected
                    ? 'border-primary-900 dark:border-primary-500 shadow-medium ring-2 ring-primary-900/20 dark:ring-primary-500/20'
                    : 'border-secondary-200 dark:border-secondary-800 hover:border-secondary-400 dark:hover:border-secondary-600'
                    }`}
                >
                  {/* Recommended Badge */}
                  {template.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <span className="bg-primary-900 dark:bg-primary-600 text-white text-[10px] sm:text-xs font-semibold px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-soft whitespace-nowrap">
                        ✨ Recommended
                      </span>
                    </div>
                  )}

                  {/* Selected Checkmark */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 z-10 bg-primary-900 dark:bg-primary-600 text-white rounded-full p-1.5 shadow-soft">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  )}

                  {/* Template Preview */}
                  <div className="p-5 sm:p-6">
                    {/* Icon with gradient background */}
                    <div className="mb-5 sm:mb-6 flex justify-center">
                      <div className={`
                      w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center
                      ${template.color === 'primary' ? 'bg-primary-900' : ''}
                      ${template.color === 'secondary' ? 'bg-secondary-700' : ''}
                      ${template.color === 'success' ? 'bg-success-600' : ''}
                      shadow-soft transform group-hover:scale-110 transition-transform
                    `}>
                        {Icon && <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />}
                      </div>
                    </div>

                    {/* Resume Preview Mockup */}
                    <div className="bg-secondary-50 dark:bg-secondary-800 rounded-xl overflow-hidden mb-5 sm:mb-6 aspect-[8.5/11] shadow-inner border border-secondary-200 dark:border-secondary-700">
                      <div className="w-full h-full bg-white dark:bg-secondary-900 p-4 sm:p-6 relative">
                        {/* Modern Template Preview */}
                        {template.id === 'modern' && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-900 dark:bg-primary-600"></div>
                              <div className="flex-1">
                                <div className="h-2.5 sm:h-3 bg-secondary-900 dark:bg-secondary-200 rounded w-2/3 mb-1"></div>
                                <div className="h-1.5 sm:h-2 bg-secondary-400 dark:bg-secondary-600 rounded w-1/2"></div>
                              </div>
                            </div>
                            <div className="h-0.5 bg-primary-900 dark:bg-primary-600"></div>
                            <div className="space-y-2">
                              <div className="h-2 sm:h-2.5 bg-secondary-400 dark:bg-secondary-500 rounded w-1/3"></div>
                              <div className="h-1.5 sm:h-2 bg-secondary-300 dark:bg-secondary-700 rounded"></div>
                              <div className="h-1.5 sm:h-2 bg-secondary-300 dark:bg-secondary-700 rounded w-5/6"></div>
                              <div className="h-1.5 sm:h-2 bg-secondary-300 dark:bg-secondary-700 rounded w-4/6"></div>
                            </div>
                            <div className="space-y-2 mt-4">
                              <div className="h-2 sm:h-2.5 bg-secondary-400 dark:bg-secondary-500 rounded w-2/5"></div>
                              <div className="flex gap-2">
                                <div className="h-1.5 bg-secondary-200 dark:bg-secondary-800 rounded w-1/4"></div>
                                <div className="h-1.5 bg-secondary-200 dark:bg-secondary-800 rounded w-1/4"></div>
                              </div>
                              <div className="h-1.5 sm:h-2 bg-secondary-300 dark:bg-secondary-700 rounded"></div>
                              <div className="h-1.5 sm:h-2 bg-secondary-300 dark:bg-secondary-700 rounded w-5/6"></div>
                            </div>
                          </div>
                        )}

                        {/* Classic Template Preview */}
                        {template.id === 'classic' && (
                          <div className="space-y-3">
                            <div className="text-center mb-4">
                              <div className="h-3 sm:h-4 bg-secondary-900 dark:bg-secondary-200 rounded w-2/3 mx-auto mb-2"></div>
                              <div className="h-1.5 sm:h-2 bg-secondary-400 dark:bg-secondary-500 rounded w-1/2 mx-auto mb-1"></div>
                              <div className="h-1.5 sm:h-2 bg-secondary-400 dark:bg-secondary-500 rounded w-2/5 mx-auto"></div>
                            </div>
                            <div className="h-px bg-secondary-900 dark:bg-secondary-200"></div>
                            <div className="space-y-2 mt-4">
                              <div className="h-2 sm:h-2.5 bg-secondary-900 dark:bg-secondary-200 rounded w-1/3 text-center"></div>
                              <div className="h-1.5 sm:h-2 bg-secondary-300 dark:bg-secondary-700 rounded"></div>
                              <div className="h-1.5 sm:h-2 bg-secondary-300 dark:bg-secondary-700 rounded w-5/6"></div>
                            </div>
                            <div className="space-y-2 mt-4">
                              <div className="h-2 sm:h-2.5 bg-secondary-900 dark:bg-secondary-200 rounded w-2/5"></div>
                              <div className="h-1.5 sm:h-2 bg-secondary-300 dark:bg-secondary-700 rounded"></div>
                              <div className="h-1.5 sm:h-2 bg-secondary-300 dark:bg-secondary-700 rounded w-4/5"></div>
                              <div className="h-1.5 sm:h-2 bg-secondary-300 dark:bg-secondary-700 rounded w-3/5"></div>
                            </div>
                          </div>
                        )}

                        {/* Minimalist Template Preview */}
                        {template.id === 'minimalist' && (
                          <div className="space-y-4">
                            <div className="mb-6">
                              <div className="h-3 sm:h-4 bg-secondary-900 dark:bg-secondary-200 rounded w-1/2 mb-3"></div>
                              <div className="h-1.5 bg-secondary-300 dark:bg-secondary-600 rounded w-2/5"></div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-success-500 rounded"></div>
                                <div className="h-1.5 sm:h-2 bg-secondary-700 dark:bg-secondary-300 rounded w-1/4"></div>
                              </div>
                              <div className="pl-3 space-y-1.5">
                                <div className="h-1.5 bg-secondary-200 dark:bg-secondary-800 rounded"></div>
                                <div className="h-1.5 bg-secondary-200 dark:bg-secondary-800 rounded w-5/6"></div>
                              </div>
                            </div>
                            <div className="space-y-3 mt-4">
                              <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-success-500 rounded"></div>
                                <div className="h-1.5 sm:h-2 bg-secondary-700 dark:bg-secondary-300 rounded w-1/3"></div>
                              </div>
                              <div className="pl-3 space-y-1.5">
                                <div className="h-1.5 bg-secondary-200 dark:bg-secondary-800 rounded"></div>
                                <div className="h-1.5 bg-secondary-200 dark:bg-secondary-800 rounded w-4/5"></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Template Info */}
                    <div className="text-center mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-secondary-900 dark:text-white mb-2">
                        {template.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed mb-4">
                        {template.description}
                      </p>

                      {/* Features List */}
                      {template.features && (
                        <div className="space-y-1.5">
                          {template.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center text-xs text-secondary-600 dark:text-secondary-400">
                              <Check className={`w-3 h-3 sm:w-3.5 sm:h-3.5 mr-2 flex-shrink-0 ${template.color === 'primary' ? 'text-primary-900 dark:text-primary-400' : ''
                                }${template.color === 'secondary' ? 'text-secondary-700 dark:text-secondary-300' : ''}${template.color === 'success' ? 'text-success-600 dark:text-success-400' : ''
                                }`} />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Select Button */}
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                    <button
                      className={`w-full py-2.5 sm:py-3 rounded-xl font-semibold transition-all transform text-sm sm:text-base ${isSelected
                        ? 'bg-primary-900 dark:bg-primary-600 text-white shadow-soft'
                        : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-700 group-hover:shadow-soft'
                        }`}
                    >
                      {isSelected ? '✓ Selected' : 'Choose Template'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Custom Templates Section */}
        {templates.length > DEFAULT_TEMPLATES.length && (
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-secondary-800 dark:text-secondary-200">Your Custom Templates</h3>
              <button
                onClick={() => navigate('/templates')}
                className="text-primary-900 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium text-sm"
              >
                Manage All →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {templates.filter(t => t.isCustom).map((template) => {
                const isSelected = selectedTemplate === template.id

                return (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`group relative bg-white dark:bg-secondary-900 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-medium hover:-translate-y-1 ${isSelected
                      ? 'border-primary-900 dark:border-primary-500 shadow-medium ring-2 ring-primary-900/20 dark:ring-primary-500/20'
                      : 'border-secondary-200 dark:border-secondary-800 hover:border-secondary-400 dark:hover:border-secondary-600'
                      }`}
                  >
                    {/* Selected Checkmark */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 z-10 bg-primary-900 dark:bg-primary-600 text-white rounded-full p-1.5 shadow-soft">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    )}

                    {/* Template Preview */}
                    <div className="p-5 sm:p-6">
                      {/* Icon */}
                      <div className="mb-5 sm:mb-6 flex justify-center">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center bg-secondary-700 dark:bg-secondary-600 shadow-soft">
                          <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                      </div>

                      {/* Template Info */}
                      <div className="text-center mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-secondary-900 dark:text-white mb-2">
                          {template.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed mb-4">
                          {template.description || `Custom ${template.type?.toUpperCase()} template`}
                        </p>
                        <div className="inline-block px-3 py-1 bg-secondary-200 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 text-[10px] sm:text-xs font-semibold rounded-full">
                          {template.type?.toUpperCase()} · Custom
                        </div>
                      </div>
                    </div>

                    {/* Select Button */}
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                      <button
                        className={`w-full py-2.5 sm:py-3 rounded-xl font-semibold transition-all transform text-sm sm:text-base ${isSelected
                          ? 'bg-primary-900 dark:bg-primary-600 text-white shadow-soft'
                          : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-700 group-hover:shadow-soft'
                          }`}
                      >
                        {isSelected ? '✓ Selected' : 'Choose Template'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {/* No Custom Templates - Upload CTA (Admin only) */}
        {isAdmin && templates.length === DEFAULT_TEMPLATES.length && (
          <div className="mb-8 sm:mb-12 p-6 sm:p-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200 text-center">
            <Upload className="mx-auto text-purple-600 mb-4 w-10 h-10 sm:w-12 sm:h-12" />
            <h3 className="text-lg sm:text-xl font-bold text-secondary-700 mb-2">Create Your Custom Templates</h3>
            <p className="text-sm sm:text-base text-secondary-700 mb-6 max-w-lg mx-auto">
              Upload your own HTML or LaTeX templates to personalize your resumes even more
            </p>
            <button
              onClick={() => navigate('/templates')}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors font-medium text-sm sm:text-base"
            >
              <Upload className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              Upload Custom Template
            </button>
          </div>
        )}

        {/* Continue Button */}
        <div className="flex justify-center pb-8 sm:pb-0">
          <button
            onClick={handleContinue}
            disabled={!selectedTemplate}
            className="w-full sm:w-auto group bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 disabled:hover:translate-y-0"
          >
            Continue to Build Resume
            <ArrowLeft className="inline-block ml-2 w-4 h-4 sm:w-5 sm:h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}
