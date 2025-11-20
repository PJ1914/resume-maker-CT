import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Save, Sparkles } from 'lucide-react'
import WizardProgress, { type WizardStep } from '../components/wizard/WizardProgress'
import ContactStepForm from '../components/wizard/ContactStepForm'
import SummaryStepForm from '../components/wizard/SummaryStepForm'
import ExperienceStepForm from '../components/wizard/ExperienceStepForm'
import EducationStepForm from '../components/wizard/EducationStepForm'
import SkillsStepForm from '../components/wizard/SkillsStepForm'
import ProjectsStepForm from '../components/wizard/ProjectsStepForm'
import ReviewStep from '../components/wizard/ReviewStep'
import toast from 'react-hot-toast'
import { useRef, useEffect } from 'react'
import { apiClient } from '../services/api.ts'

const WIZARD_STEPS: WizardStep[] = [
  { id: 1, title: 'Contact', description: 'Your details' },
  { id: 2, title: 'Summary', description: 'Professional bio' },
  { id: 3, title: 'Experience', description: 'Work history' },
  { id: 4, title: 'Education', description: 'Academic background' },
  { id: 5, title: 'Skills', description: 'Technologies' },
  { id: 6, title: 'Projects', description: 'Portfolio items' },
  { id: 7, title: 'Review', description: 'Finalize resume' },
]

export default function ResumeWizardPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [zoom, setZoom] = useState(100)
  const previewRef = useRef<HTMLDivElement>(null)
  
  const [resumeData, setResumeData] = useState({
    contact: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: '',
    },
    summary: '',
    experience: [] as any[],
    education: [] as any[],
    skills: {
      technical: [] as string[],
      soft: [] as string[],
    },
    projects: [] as any[],
  })

  const updateResumeData = (section: string, data: any) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: data,
    }))
  }

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSaveDraft = async () => {
    try {
      setSaving(true)
      // TODO: Implement save draft to Firestore
      toast.success('Draft saved successfully')
    } catch (error: any) {
      console.error('Save draft error:', error)
      toast.error('Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateResume = async () => {
    try {
      setCreating(true)
      
      // Validate required fields
      if (!resumeData.contact.name || !resumeData.contact.email) {
        toast.error('Please fill in at least name and email')
        setCreating(false)
        return
      }
      
      // Call API to create resume
      const response: any = await apiClient.post('/api/create', resumeData)
      
      if (response && response.resume_id) {
        toast.success('Resume created successfully!')
        navigate('/resumes')
      } else {
        throw new Error('No resume ID returned')
      }
    } catch (error: any) {
      console.error('Create resume error:', error)
      
      // Better error messaging
      let errorMessage = 'Failed to create resume'
      if (error.response?.status === 404) {
        errorMessage = 'Backend API not found. Make sure the server is running on port 8000.'
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = 'You are not authenticated. Please log in again.'
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setCreating(false)
    }
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50))
  }

  const handleZoomReset = () => {
    setZoom(100)
  }

  const handleZoomFit = () => {
    setZoom(85)
  }

  // Mouse wheel zoom
  useEffect(() => {
    const previewElement = previewRef.current
    if (!previewElement) return

    const handleWheel = (e: WheelEvent) => {
      // Check if Ctrl/Cmd key is pressed for zoom
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        
        const delta = e.deltaY > 0 ? -10 : 10
        setZoom(prev => Math.max(50, Math.min(200, prev + delta)))
      }
    }

    previewElement.addEventListener('wheel', handleWheel, { passive: false })
    return () => previewElement.removeEventListener('wheel', handleWheel)
  }, [])

  // Trackpad pinch-to-zoom
  useEffect(() => {
    const previewElement = previewRef.current
    if (!previewElement) return

    let lastScale = 1

    const handleGestureStart = (e: Event) => {
      e.preventDefault()
      lastScale = 1
    }

    const handleGestureChange = (e: any) => {
      e.preventDefault()
      
      const delta = (e.scale - lastScale) * 100
      setZoom(prev => Math.max(50, Math.min(200, prev + delta)))
      lastScale = e.scale
    }

    const handleGestureEnd = (e: Event) => {
      e.preventDefault()
    }

    previewElement.addEventListener('gesturestart', handleGestureStart)
    previewElement.addEventListener('gesturechange', handleGestureChange)
    previewElement.addEventListener('gestureend', handleGestureEnd)

    return () => {
      previewElement.removeEventListener('gesturestart', handleGestureStart)
      previewElement.removeEventListener('gesturechange', handleGestureChange)
      previewElement.removeEventListener('gestureend', handleGestureEnd)
    }
  }, [])

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ContactStepForm
            data={resumeData.contact}
            onChange={(data: any) => updateResumeData('contact', data)}
          />
        )
      case 1:
        return (
          <SummaryStepForm
            data={resumeData.summary}
            onChange={(data: string) => updateResumeData('summary', data)}
          />
        )
      case 2:
        return (
          <ExperienceStepForm
            data={resumeData.experience}
            onChange={(data: any[]) => updateResumeData('experience', data)}
          />
        )
      case 3:
        return (
          <EducationStepForm
            data={resumeData.education}
            onChange={(data: any[]) => updateResumeData('education', data)}
          />
        )
      case 4:
        return (
          <SkillsStepForm
            data={resumeData.skills}
            onChange={(data: any) => updateResumeData('skills', data)}
          />
        )
      case 5:
        return (
          <ProjectsStepForm
            data={resumeData.projects}
            onChange={(data: any[]) => updateResumeData('projects', data)}
          />
        )
      case 6:
        return <ReviewStep data={resumeData} />
      default:
        return null
    }
  }

  const isLastStep = currentStep === WIZARD_STEPS.length - 1

  return (
    <div className="h-screen flex flex-col bg-secondary-900">
      {/* Top Header Bar - Overleaf Style */}
      <div className="bg-secondary-900 text-white border-b border-secondary-700 flex-shrink-0">
        <div className="flex items-center justify-between px-2 sm:px-4 py-1.5 sm:py-2">
          {/* Left Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-secondary-400 hover:text-white transition-all p-1 hover:bg-secondary-800 rounded"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <div className="border-l border-secondary-700 pl-2 sm:pl-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500" />
                <span className="font-semibold text-xs sm:text-sm hidden sm:inline">New Resume</span>
              </div>
            </div>
          </div>

          {/* Center Section - Step Info */}
          <div className="hidden md:flex items-center gap-2 text-xs text-secondary-400">
            <span>Step {currentStep + 1}/{WIZARD_STEPS.length}</span>
            <span>•</span>
            <span>{WIZARD_STEPS[currentStep].title}</span>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-secondary-800 hover:bg-secondary-700 border border-secondary-700 rounded text-white transition-all flex items-center gap-1 sm:gap-1.5 disabled:opacity-50"
            >
              <Save className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-secondary-800 hover:bg-secondary-700 border border-secondary-700 rounded text-white transition-all"
            >
              <span className="hidden sm:inline">{showPreview ? 'Hide' : 'Show'}</span>
              <span className="sm:hidden">{showPreview ? '◀' : '▶'}</span>
            </button>
          </div>
        </div>

        {/* Progress Steps Bar */}
        <div className="bg-secondary-800/50 border-t border-secondary-700">
          <WizardProgress steps={WIZARD_STEPS} currentStep={currentStep} />
        </div>
      </div>

      {/* Main Split Panel - Overleaf Style */}
      <div className="flex-1 flex overflow-hidden flex-col sm:flex-row">
        {/* Left Panel - Form Editor */}
        <div className={`${showPreview ? 'hidden sm:flex sm:w-1/2' : 'w-full'} flex flex-col border-r border-secondary-700 bg-white`}>
          {/* Editor Toolbar */}
          <div className="bg-secondary-100 border-b border-secondary-200 px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-semibold text-secondary-700">Editor</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs text-secondary-500 hidden md:inline">
                {WIZARD_STEPS[currentStep].description}
              </span>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-secondary-50 via-white to-primary-50/10">
            <div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6">
              <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4 sm:p-6 lg:p-8">
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-secondary-900">
                    {WIZARD_STEPS[currentStep].title}
                  </h2>
                  <p className="text-xs sm:text-sm text-secondary-600 mt-1">
                    {WIZARD_STEPS[currentStep].description}
                  </p>
                </div>
                {renderStepContent()}
              </div>
            </div>
          </div>

          {/* Bottom Navigation Bar */}
          <div className="bg-white border-t border-secondary-200 px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between flex-shrink-0">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="group px-3 sm:px-4 py-1.5 sm:py-2 border border-secondary-300 rounded-lg text-secondary-700 hover:bg-secondary-50 hover:border-secondary-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {isLastStep ? (
              <button
                onClick={handleCreateResume}
                disabled={creating}
                className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{creating ? 'Creating...' : 'Create Resume'}</span>
                <span className="sm:hidden">Create</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="group px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium"
              >
                <span className="hidden sm:inline">Next Step</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* Right Panel - PDF Preview (Overleaf Style) */}
        {showPreview && (
          <div className="w-full sm:w-1/2 flex flex-col bg-secondary-100">
            {/* Preview Toolbar */}
            <div className="bg-secondary-100 border-b border-secondary-200 px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs font-semibold text-secondary-700">Preview</span>
                <span className="text-[9px] sm:text-[10px] text-secondary-500 hidden sm:inline">(PDF)</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Zoom Controls */}
                <div className="flex items-center gap-0.5 sm:gap-1 bg-white border border-secondary-300 rounded px-0.5 sm:px-1">
                  <button
                    onClick={handleZoomOut}
                    disabled={zoom <= 50}
                    className="p-0.5 sm:p-1 hover:bg-secondary-100 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Zoom out"
                  >
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-secondary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <button
                    onClick={handleZoomReset}
                    className="px-1 sm:px-2 py-0.5 hover:bg-secondary-100 rounded text-[9px] sm:text-[11px] font-medium text-secondary-700 min-w-[35px] sm:min-w-[45px] transition-colors"
                    title="Reset zoom"
                  >
                    {zoom}%
                  </button>
                  <button
                    onClick={handleZoomIn}
                    disabled={zoom >= 200}
                    className="p-0.5 sm:p-1 hover:bg-secondary-100 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Zoom in"
                  >
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-secondary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <div className="h-3 sm:h-4 w-px bg-secondary-300 mx-0.5"></div>
                  <button
                    onClick={handleZoomFit}
                    className="px-1.5 sm:px-2 py-0.5 hover:bg-secondary-100 rounded text-[9px] sm:text-[11px] font-medium text-secondary-700 transition-colors"
                    title="Fit to page"
                  >
                    Fit
                  </button>
                </div>
                <span className="text-[10px] sm:text-xs text-secondary-500 hidden sm:inline">1/1</span>
              </div>
            </div>

            {/* PDF Preview Area */}
            <div 
              ref={previewRef}
              className="flex-1 overflow-auto p-2 sm:p-4 lg:p-8 bg-secondary-200"
              style={{ touchAction: 'pan-y pinch-zoom' }}
            >
              <div 
                className="mx-auto bg-white shadow-2xl transition-all duration-200" 
                style={{ 
                  width: `${8.5 * (zoom / 100)}in`, 
                  minHeight: `${11 * (zoom / 100)}in`,
                  transformOrigin: 'top center'
                }}
              >
                <div className="p-4 sm:p-8 lg:p-12" style={{ fontSize: `${zoom / 100}rem` }}>
                  {/* Resume Preview with LaTeX-style formatting */}
                  <div className="space-y-4 font-serif text-sm">
                    {/* Contact Header */}
                    {resumeData.contact.name && (
                      <div className="text-center border-b-2 border-secondary-900 pb-3">
                        <h1 className="text-3xl font-bold text-secondary-900 mb-2">{resumeData.contact.name}</h1>
                        <div className="flex justify-center gap-2 text-xs text-secondary-700 flex-wrap">
                          {resumeData.contact.email && <span className="break-all">{resumeData.contact.email}</span>}
                          {resumeData.contact.phone && <span>|</span>}
                          {resumeData.contact.phone && <span className="break-all">{resumeData.contact.phone}</span>}
                          {resumeData.contact.location && <span>|</span>}
                          {resumeData.contact.location && <span className="break-all">{resumeData.contact.location}</span>}
                        </div>
                        {(resumeData.contact.linkedin || resumeData.contact.website) && (
                          <div className="flex justify-center gap-2 mt-2 text-xs text-primary-700 flex-wrap">
                            {resumeData.contact.linkedin && <span className="break-all">{resumeData.contact.linkedin}</span>}
                            {resumeData.contact.linkedin && resumeData.contact.website && <span>|</span>}
                            {resumeData.contact.website && <span className="break-all">{resumeData.contact.website}</span>}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Summary */}
                    {resumeData.summary && (
                      <div>
                        <h2 className="text-xs font-bold text-secondary-900 uppercase tracking-wider mb-2 border-b border-secondary-800 pb-1">Professional Summary</h2>
                        <p className="text-xs text-secondary-800 leading-relaxed whitespace-pre-wrap">{resumeData.summary}</p>
                      </div>
                    )}

                    {/* Experience */}
                    {resumeData.experience.length > 0 && (
                      <div>
                        <h2 className="text-xs font-bold text-secondary-900 uppercase tracking-wider mb-2 border-b border-secondary-800 pb-1">Experience</h2>
                        <div className="space-y-2">
                          {resumeData.experience.map((exp, idx) => (
                            <div key={idx}>
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                  <h3 className="font-bold text-xs text-secondary-900">{exp.position || exp.title}</h3>
                                  <p className="text-xs text-secondary-700 italic">{exp.company}</p>
                                  {exp.location && <p className="text-[10px] text-secondary-600">{exp.location}</p>}
                                </div>
                                <span className="text-[10px] text-secondary-600 whitespace-nowrap">
                                  {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : '- Present'}
                                </span>
                              </div>
                              {exp.description && (
                                <p className="text-xs text-secondary-700 mt-1 leading-relaxed ml-2 border-l-2 border-primary-400 pl-2 whitespace-pre-wrap">
                                  {exp.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {resumeData.education.length > 0 && (
                      <div>
                        <h2 className="text-xs font-bold text-secondary-900 uppercase tracking-wider mb-2 border-b border-secondary-800 pb-1">Education</h2>
                        <div className="space-y-1.5">
                          {resumeData.education.map((edu, idx) => (
                            <div key={idx}>
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                  <h3 className="font-bold text-xs text-secondary-900">{edu.degree || edu.school || edu.institution}</h3>
                                  <p className="text-xs text-secondary-700 italic">{edu.institution || edu.school}</p>
                                  {edu.field && <p className="text-[10px] text-secondary-600">Field: {edu.field}</p>}
                                  {edu.gpa && <p className="text-[10px] text-secondary-600">GPA: {edu.gpa}</p>}
                                  {edu.location && <p className="text-[10px] text-secondary-600">{edu.location}</p>}
                                  {edu.description && <p className="text-[10px] text-secondary-700 mt-1 whitespace-pre-wrap">{edu.description}</p>}
                                </div>
                                <span className="text-[10px] text-secondary-600 whitespace-nowrap">
                                  {edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : edu.endDate ? edu.endDate : ''}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {(resumeData.skills.technical.length > 0 || resumeData.skills.soft.length > 0) && (
                      <div>
                        <h2 className="text-xs font-bold text-secondary-900 uppercase tracking-wider mb-2 border-b border-secondary-800 pb-1">Skills</h2>
                        <div className="space-y-1">
                          {resumeData.skills.technical.length > 0 && (
                            <div>
                              <span className="font-semibold text-xs text-secondary-900">Technical: </span>
                              <span className="text-xs text-secondary-700">{Array.isArray(resumeData.skills.technical) ? resumeData.skills.technical.join(', ') : ''}</span>
                            </div>
                          )}
                          {resumeData.skills.soft.length > 0 && (
                            <div>
                              <span className="font-semibold text-xs text-secondary-900">Soft Skills: </span>
                              <span className="text-xs text-secondary-700">{Array.isArray(resumeData.skills.soft) ? resumeData.skills.soft.join(', ') : ''}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {resumeData.projects.length > 0 && (
                      <div>
                        <h2 className="text-xs font-bold text-secondary-900 uppercase tracking-wider mb-2 border-b border-secondary-800 pb-1">Projects</h2>
                        <div className="space-y-2">
                          {resumeData.projects.map((proj, idx) => (
                            <div key={idx}>
                              <h3 className="font-bold text-xs text-secondary-900">{proj.name || proj.projectName}</h3>
                              {(proj.startDate || proj.endDate) && (
                                <p className="text-[10px] text-secondary-600">
                                  {proj.startDate} {proj.endDate ? `- ${proj.endDate}` : '- Present'}
                                </p>
                              )}
                              {proj.description && (
                                <p className="text-xs text-secondary-700 mt-0.5 leading-relaxed whitespace-pre-wrap">{proj.description}</p>
                              )}
                              {proj.technologies && (
                                <p className="text-[10px] text-secondary-600 mt-0.5">
                                  <span className="font-semibold">Tech:</span> {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                                </p>
                              )}
                              {proj.url && (
                                <p className="text-[10px] text-primary-700 mt-0.5 break-all">
                                  <span className="font-semibold">URL:</span> {proj.url}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {!resumeData.contact.name && !resumeData.summary && resumeData.experience.length === 0 && (
                      <div className="text-center py-20 text-secondary-400">
                        <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Start filling in your information</p>
                        <p className="text-xs mt-1">Preview will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
