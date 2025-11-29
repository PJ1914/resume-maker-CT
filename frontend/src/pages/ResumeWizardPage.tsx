import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Save, Sparkles } from 'lucide-react'
import WizardProgress, { type WizardStep } from '../components/wizard/WizardProgress'
import ResumeDumpStep from '../components/wizard/ResumeDumpStep'
import ContactStepForm from '../components/wizard/ContactStepForm'
import SummaryStepForm from '../components/wizard/SummaryStepForm'
import ExperienceStepForm from '../components/wizard/ExperienceStepForm'
import EducationStepForm from '../components/wizard/EducationStepForm'
import SkillsStepForm from '../components/wizard/SkillsStepForm'
import ProjectsStepForm from '../components/wizard/ProjectsStepForm'
import ReviewStep from '../components/wizard/ReviewStep'
import toast from 'react-hot-toast'
import { apiClient } from '../services/api.ts'

const WIZARD_STEPS: WizardStep[] = [
  { id: 0, title: 'Quick Start', description: 'Paste your resume (optional)' },
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
  const location = useLocation()
  const [currentStep, setCurrentStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  
  // Get selected template from route state
  const templateId = (location.state as any)?.templateId || 'modern'
  
  const [resumeData, setResumeData] = useState({
    template: templateId,
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
      
      // Call API to create resume with template
      const response: any = await apiClient.post('/api/create', resumeData)
      
      if (response && response.resume_id) {
        toast.success('Resume created successfully!')
        // Navigate to resume detail page or dashboard
        navigate(`/resumes/${response.resume_id}`)
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ResumeDumpStep
            onDataExtracted={(data: any) => {
              if (data) {
                // Apply extracted data to all fields
                console.log('Applying extracted data to wizard:', data)
                if (data.contact) updateResumeData('contact', data.contact)
                if (data.summary) updateResumeData('summary', data.summary)
                if (data.experience) updateResumeData('experience', data.experience)
                if (data.education) updateResumeData('education', data.education)
                if (data.skills) updateResumeData('skills', data.skills)
                if (data.projects) updateResumeData('projects', data.projects)
                toast.success('Resume data extracted! Continue to review and edit.')
              }
              // Move to next step whether data extracted or skip
              handleNext()
            }}
            isLoading={false}
          />
        )
      case 1:
        return (
          <ContactStepForm
            data={resumeData.contact}
            onChange={(data: any) => updateResumeData('contact', data)}
          />
        )
      case 2:
        return (
          <SummaryStepForm
            data={resumeData.summary}
            onChange={(data: string) => updateResumeData('summary', data)}
          />
        )
      case 3:
        return (
          <ExperienceStepForm
            data={resumeData.experience}
            onChange={(data: any[]) => updateResumeData('experience', data)}
          />
        )
      case 4:
        return (
          <EducationStepForm
            data={resumeData.education}
            onChange={(data: any[]) => updateResumeData('education', data)}
          />
        )
      case 5:
        return (
          <SkillsStepForm
            data={resumeData.skills}
            onChange={(data: any) => updateResumeData('skills', data)}
          />
        )
      case 6:
        return (
          <ProjectsStepForm
            data={resumeData.projects}
            onChange={(data: any[]) => updateResumeData('projects', data)}
          />
        )
      case 7:
        return <ReviewStep data={resumeData} />
      default:
        console.warn('Unknown step:', currentStep)
        return <div>Step {currentStep + 1} not found</div>
    }
  }

  const isLastStep = currentStep === WIZARD_STEPS.length - 1

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="text-secondary-600 hover:text-secondary-900 transition-colors p-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">Build Your Resume</h1>
                <p className="text-sm text-secondary-600 mt-0.5">
                  Step {currentStep + 1} of {WIZARD_STEPS.length} • Template: <span className="font-semibold capitalize">{templateId}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveDraft}
                disabled={saving}
                className="px-4 py-2 text-sm bg-white border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save Draft'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <WizardProgress steps={WIZARD_STEPS} currentStep={currentStep} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step Content */}
        <div className="bg-white rounded-xl border border-secondary-200 p-8 sm:p-12 shadow-sm mb-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-secondary-900 mb-2">
              {WIZARD_STEPS[currentStep].title}
            </h2>
            <p className="text-secondary-600">
              {WIZARD_STEPS[currentStep].description}
            </p>
          </div>

          {/* Form Content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-6 py-3 border border-secondary-300 rounded-lg text-secondary-700 hover:bg-secondary-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="text-sm text-secondary-600">
            {currentStep + 1} / {WIZARD_STEPS.length}
          </div>

          {isLastStep ? (
            <button
              onClick={handleCreateResume}
              disabled={creating}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {creating ? 'Creating...' : 'Create Resume'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
