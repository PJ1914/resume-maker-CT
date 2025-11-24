import { useState } from 'react'
import { Upload, AlertCircle } from 'lucide-react'
import { apiClient } from '@/services/api'
import toast from 'react-hot-toast'

interface ResumeDumpStepProps {
  onDataExtracted: (data: any) => void
  isLoading?: boolean
}

export default function ResumeDumpStep({ onDataExtracted, isLoading = false }: ResumeDumpStepProps) {
  const [resumeText, setResumeText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

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
    try {
      console.log('Sending extraction request...')
      console.log('Resume text length:', resumeText.length)
      
      // Call backend API to extract resume data
      const response = await apiClient.post('/api/ai/extract-resume', {
        resume_text: resumeText,
      })

      console.log('Extraction response:', response)

      if (!response) {
        throw new Error('No response from extraction API')
      }

      // Transform API response to match wizard field names
      const extractedData = {
        contact: (response as any).contact || {},
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
        skills: (response as any).skills || { technical: [], soft: [] },
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
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Quick Start</h1>
        <p className="text-secondary-600 leading-relaxed">
          Optionally paste your existing resume text below. Our AI will extract and populate your information automatically. Or skip to build manually.
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl border border-secondary-200 p-8">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-secondary-900 mb-3">
            Paste Your Resume Text (Optional)
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume content here. Include your name, contact info, experience, education, skills, etc."
            className="w-full h-64 p-4 border border-secondary-300 rounded-lg font-mono text-sm text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            disabled={isLoading || isProcessing}
          />
        </div>

        {/* Character Count */}
        <div className="text-xs text-secondary-500 mb-6">
          {resumeText.length} characters
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Pro Tip:</p>
            <p>You can paste plain text, formatted text, or even copy-paste from your PDF resume. Our AI will do its best to extract and organize your information.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleExtract}
            disabled={isLoading || isProcessing || !resumeText.trim()}
            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            className="flex-1 px-6 py-3 bg-white border border-secondary-300 text-secondary-700 rounded-lg font-medium hover:bg-secondary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip
          </button>
        </div>

        {/* Manual Entry Info */}
        <div className="mt-6 pt-6 border-t border-secondary-200">
          <p className="text-sm text-secondary-600">
            Don't have your resume handy? No problem! You can build it step by step in the next sections.
          </p>
        </div>
      </div>
    </div>
  )
}
