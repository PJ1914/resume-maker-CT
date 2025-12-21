import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Save, Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import WizardProgress, { type WizardStep } from '../components/wizard/WizardProgress'
import ResumeDumpStep from '../components/wizard/ResumeDumpStep'
import ContactStepForm from '../components/wizard/ContactStepForm'
import AISummaryStepForm from '../components/wizard/AISummaryStepForm'
import ExperienceStepForm from '../components/wizard/ExperienceStepForm'
import EducationStepForm from '../components/wizard/EducationStepForm'
import SkillsStepForm from '../components/wizard/SkillsStepForm'
import ProjectsStepForm from '../components/wizard/ProjectsStepForm'
import CertificationsStepForm from '../components/wizard/CertificationsStepForm'
import LanguagesStepForm from '../components/wizard/LanguagesStepForm'
import AchievementsStepForm from '../components/wizard/AchievementsStepForm'
import ReviewStep from '../components/wizard/ReviewStep'
import toast from 'react-hot-toast'
import { creditKeys } from '../hooks/useCredits'
import { apiClient } from '../services/api.ts'
import { Confetti } from '../components/ui/confetti'
import ResumeStrengthMeter from '../components/wizard/ResumeStrengthMeter'

const WIZARD_STEPS: WizardStep[] = [
  { id: 0, title: 'Quick Start', description: 'Paste your resume (optional)' },
  { id: 1, title: 'Contact', description: 'Your details' },
  { id: 2, title: 'Experience', description: 'Work history' },
  { id: 3, title: 'Education', description: 'Academic background' },
  { id: 4, title: 'Skills', description: 'Technologies' },
  { id: 5, title: 'Projects', description: 'Portfolio items' },
  { id: 6, title: 'Certifications', description: 'Credentials' },
  { id: 7, title: 'Languages', description: 'Languages spoken' },
  { id: 8, title: 'Achievements', description: 'Awards & honors' },
  { id: 9, title: 'Summary', description: 'AI-generated summary' },
  { id: 10, title: 'Review', description: 'Finalize resume' },
]

export default function ResumeWizardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [currentStep, setCurrentStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [direction, setDirection] = useState(0) // -1 for prev, 1 for next
  const [showConfetti, setShowConfetti] = useState(false)

  // Get selected template from route state
  const templateId = (location.state as any)?.templateId || 'resume_1'

  const [resumeData, setResumeData] = useState({
    template: templateId,
    theme: {
      primary_color: '00008B',
      secondary_color: '4B4B4B',
    },
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
    certifications: [] as any[],
    languages: [] as any[],
    achievements: [] as any[],
  })

  const updateResumeData = (section: string, data: any) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: data,
    }))
  }

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setDirection(1)
      setCurrentStep((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setDirection(-1)
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
      const response: any = await apiClient.post('/api/resumes/create', resumeData)

      if (response && response.resume_id) {
        setShowConfetti(true)
        toast.success('Resume created successfully!')

        // Invalidate credits to show updated balance
        queryClient.invalidateQueries({ queryKey: creditKeys.balance() })

        // Delay navigation to show confetti
        setTimeout(() => {
          navigate(`/resumes/${response.resume_id}`)
        }, 2000)
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
                if (data.certifications) updateResumeData('certifications', data.certifications)
                if (data.languages) updateResumeData('languages', data.languages)
                if (data.achievements) updateResumeData('achievements', data.achievements)
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
        return (
          <CertificationsStepForm
            data={resumeData.certifications}
            onChange={(data: any[]) => updateResumeData('certifications', data)}
          />
        )
      case 7:
        return (
          <LanguagesStepForm
            data={resumeData.languages}
            onChange={(data: any[]) => updateResumeData('languages', data)}
          />
        )
      case 8:
        return (
          <AchievementsStepForm
            data={resumeData.achievements}
            onChange={(data: any[]) => updateResumeData('achievements', data)}
          />
        )
      case 9:
        return (
          <AISummaryStepForm
            data={resumeData.summary}
            onChange={(data: string) => updateResumeData('summary', data)}
            resumeData={resumeData}
          />
        )
      case 10:
        return (
          <ReviewStep
            data={resumeData}
            onThemeChange={(theme) => updateResumeData('theme', theme)}
            onUpdate={updateResumeData}
            onJumpToStep={(stepId) => {
              setDirection(stepId < currentStep ? -1 : 1)
              setCurrentStep(stepId)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        )
      default:
        console.warn('Unknown step:', currentStep)
        return <div>Step {currentStep + 1} not found</div>
    }
  }

  const isLastStep = currentStep === WIZARD_STEPS.length - 1

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 20 : -20,
      opacity: 0
    })
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950">
      {showConfetti && <Confetti />}
      {/* Header */}
      <div className="bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate(-1)}
                className="text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white transition-colors p-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-secondary-900 dark:text-white">Build Your Resume</h1>
                <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 mt-0.5">
                  Step {currentStep + 1} of {WIZARD_STEPS.length} • <span className="hidden sm:inline">Template: </span><span className="font-semibold capitalize">{templateId}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveDraft}
                disabled={saving}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save Draft'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-800 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 min-w-[600px] sm:min-w-0">
          <WizardProgress
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            onStepClick={(stepIndex) => {
              setDirection(stepIndex < currentStep ? -1 : 1)
              setCurrentStep(stepIndex)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-3">
            {/* Step Content */}
            <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-800 p-5 sm:p-12 shadow-sm mb-6 sm:mb-8 overflow-hidden">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white mb-2">
                  {WIZARD_STEPS[currentStep].title}
                </h2>
                <p className="text-sm sm:text-base text-secondary-600 dark:text-secondary-400">
                  {WIZARD_STEPS[currentStep].description}
                </p>
              </div>

              {/* Form Content */}
              <div className="mb-6 sm:mb-8">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="w-full sm:w-auto justify-center px-6 py-3 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="text-sm text-secondary-600 dark:text-secondary-400 hidden sm:block">
                {currentStep + 1} / {WIZARD_STEPS.length}
              </div>

              {isLastStep ? (
                <button
                  onClick={handleCreateResume}
                  disabled={creating}
                  className="w-full sm:w-auto justify-center px-8 py-3 bg-primary-900 dark:bg-primary-600 text-white rounded-lg hover:bg-primary-800 dark:hover:bg-primary-500 disabled:opacity-50 transition-colors font-medium flex items-center gap-2 shadow-soft"
                >
                  <Sparkles className="w-4 h-4" />
                  {creating ? 'Creating...' : 'Create Resume'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="w-full sm:w-auto justify-center px-8 py-3 bg-primary-900 dark:bg-primary-600 text-white rounded-lg hover:bg-primary-800 dark:hover:bg-primary-500 transition-colors font-medium flex items-center gap-2 shadow-soft"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Strength Meter (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <ResumeStrengthMeter data={resumeData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
