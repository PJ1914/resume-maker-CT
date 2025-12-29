import { useState } from 'react'
import { Upload, AlertCircle } from 'lucide-react'
import { apiClient } from '@/services/api'
import toast from 'react-hot-toast'
import { useLoader } from '@/context/LoaderContext'

interface ResumeDumpStepProps {
  onDataExtracted: (data: any) => void
  isLoading?: boolean
}

export default function ResumeDumpStep({ onDataExtracted, isLoading = false }: ResumeDumpStepProps) {
  const [resumeText, setResumeText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { showLoader, hideLoader } = useLoader()

  const handleSkip = () => {
    // Skip to next step without extracting
    onDataExtracted(null)
  }

  const handleExtract = async () => {
    if (!resumeText.trim()) {
      toast.error('Please paste your resume text or click Skip')
      return
    }

    if (resumeText.trim().length < 20) {
      toast.error('Resume text too short. Please paste more content.')
      return
    }

    setIsProcessing(true)
    showLoader()
    try {
      console.log('Sending extraction request...')
      console.log('Resume text length:', resumeText.length)

      // Call backend API to extract resume data
      const response = await apiClient.post('/api/ai/extract-resume', {
        resume_text: resumeText,
      }, {
        timeout: 60000 // 60 second timeout
      })

      console.log('Extraction response:', response)

      if (!response) {
        throw new Error('No response from extraction API')
      }

      // Transform API response to match wizard field names
      const responseContact = (response as any).contact || {}
      const extractedData = {
        contact: {
          name: responseContact.name || '',
          email: responseContact.email || '',
          phone: responseContact.phone || '',
          location: responseContact.location || '',
          linkedin: responseContact.linkedin || '',
          github: responseContact.github || '',
          leetcode: responseContact.leetcode || '',
          codechef: responseContact.codechef || '',
          hackerrank: responseContact.hackerrank || '',
          website: responseContact.website || '',
        },
        summary: (response as any).summary || '',
        experience: ((response as any).experience || []).map((exp: any, idx: number) => ({
          id: `exp-${idx}-${Date.now()}`,
          company: exp.company || '',
          position: exp.position || '',
          title: exp.position || exp.title || '',
          location: exp.location || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          current: false,
          description: exp.description || '',
          highlights: [],
        })),
        education: ((response as any).education || []).map((edu: any, idx: number) => ({
          id: `edu-${idx}-${Date.now()}`,
          school: edu.school || '',
          degree: edu.degree || '',
          field: edu.field || '',
          location: edu.location || '',
          startDate: edu.year ? `${edu.year}-01` : '',
          endDate: edu.year ? `${edu.year}-12` : '',
          gpa: edu.gpa || '',
          description: edu.description || '',
        })),
        skills: Array.isArray((response as any).skills) ? (response as any).skills : [],
        projects: ((response as any).projects || []).map((proj: any, idx: number) => ({
          id: `proj-${idx}-${Date.now()}`,
          name: proj.name || '',
          description: proj.description || '',
          technologies: typeof proj.technologies === 'string' ? proj.technologies : (Array.isArray(proj.technologies) ? proj.technologies.join(', ') : ''),
          link: proj.link || '',
          url: proj.link || proj.url || '',
          highlights: [],
          startDate: proj.startDate || '',
          endDate: proj.endDate || '',
        })),
        certifications: ((response as any).certifications || []).map((cert: any, idx: number) => ({
          id: `cert-${idx}-${Date.now()}`,
          name: cert.name || '',
          issuer: cert.issuer || '',
          date: cert.date || '',
          credentialId: cert.credentialId || '',
          url: cert.url || '',
        })),
        achievements: ((response as any).achievements || []).map((ach: any, idx: number) => ({
          id: `ach-${idx}-${Date.now()}`,
          title: ach.title || '',
          description: ach.description || '',
          date: ach.date || '',
        })),
      }

      console.log('Extracted data:', extractedData)
      toast.success('Resume data extracted successfully!')
      onDataExtracted(extractedData)
    } catch (error: any) {
      console.error('Error extracting resume data:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })

      let errorMsg = 'Failed to extract resume data'

      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMsg = 'Authentication failed. Please log in again.'
      } else if (error.response?.status === 404) {
        errorMsg = 'Extraction service not available. Please check the backend server.'
      } else if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail
      } else if (error.message) {
        errorMsg = error.message
      }

      toast.error(errorMsg)
    } finally {
      setIsProcessing(false)
      hideLoader()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Description */}
      <div className="mb-6 sm:mb-8">
        <p className="text-sm sm:text-base text-secondary-600 dark:text-secondary-400 leading-relaxed">
          Optionally paste your existing resume text below. Our AI will extract and populate your information automatically. Or skip to build manually.
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-800 p-5 sm:p-8">
        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-semibold text-secondary-900 dark:text-white mb-2 sm:mb-3">
            Paste Your Resume Text (Optional)
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume content here. Include your name, contact info, experience, education, skills, etc."
            className="w-full h-48 sm:h-64 p-3 sm:p-4 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg font-mono text-sm text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            disabled={isLoading || isProcessing}
          />
        </div>

        {/* Character Count */}
        <div className="text-xs text-secondary-500 dark:text-secondary-400 mb-4 sm:mb-6">
          {resumeText.length} characters
        </div>

        {/* Info Box */}
        <div className="bg-secondary-50 dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex gap-3">
          <AlertCircle className="h-5 w-5 text-secondary-600 dark:text-secondary-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-300">
            <p className="font-medium mb-1">Pro Tip:</p>
            <p>You can paste plain text, formatted text, or even copy-paste from your PDF resume. Our AI will do its best to extract and organize your information.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExtract}
            disabled={isLoading || isProcessing || !resumeText.trim()}
            className="w-full sm:flex-1 px-6 py-3 bg-primary-900 dark:bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-800 dark:hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-soft"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Extracting...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Extract & Continue
              </>
            )}
          </button>

          <button
            onClick={handleSkip}
            disabled={isLoading || isProcessing}
            className="w-full sm:flex-1 px-6 py-3 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg font-medium hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip
          </button>
        </div>

        {/* Manual Entry Info */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-secondary-200 dark:border-secondary-800">
          <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400">
            Don't have your resume handy? No problem! You can build it step by step in the next sections.
          </p>
        </div>
      </div>
    </div>
  )
}
