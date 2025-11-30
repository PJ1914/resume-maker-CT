import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  HardDrive,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { resumeService, type ResumeDetail } from '@/services/resume.service'
import toast from 'react-hot-toast'
import PdfExportModal from '@/components/PdfExportModal'
import ComprehensiveATSScore from '@/components/ComprehensiveATSScore'
import { TemplateRenderer } from '@/components/TemplateRenderer'

// Helper function to format resume text into HTML
function formatResumeText(text: string): string {
  if (!text) return '';
  
  // Split by common section headers
  const lines = text.split('\n');
  let html = '';
  let inList = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and page breaks
    if (!line || line.includes('Page Break')) continue;
    
    // Section headers (all caps or common keywords)
    if (line.match(/^(PROFESSIONAL SUMMARY|EXPERIENCE|PROJECTS|TECHNICAL SKILLS|EDUCATION|HACKATHONS|COMPETITIONS|CERTIFICATIONS|AWARDS)/i)) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<h2>${line}</h2>`;
    }
    // Job/Project titles with bullet points
    else if (line.startsWith('•')) {
      const content = line.substring(1).trim();
      // Check if it's a main heading (job/project title)
      if (content.match(/^[A-Z]/)) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        // Extract title and dates if present
        const parts = content.split(/\s{2,}/);
        if (parts.length > 1 && parts[parts.length - 1].match(/\d{4}/)) {
          const date = parts.pop();
          const title = parts.join(' ');
          html += `<div class="section"><h3>${title}</h3><p class="job-date">${date}</p>`;
        } else {
          html += `<div class="section"><h3>${content}</h3>`;
        }
      } else {
        // It's a bullet point
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        html += `<li>${content}</li>`;
      }
    }
    // Sub-items with dashes
    else if (line.startsWith('-')) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${line.substring(1).trim()}</li>`;
    }
    // Job title, company, location pattern
    else if (line.match(/^[A-Z][a-zA-Z\s]+\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      const parts = line.split(/\s{2,}/);
      if (parts.length >= 2) {
        html += `<div class="job-header"><span class="job-title">${parts[0]}</span><span class="job-date">${parts[parts.length - 1]}</span></div>`;
      }
    }
    // Company and location
    else if (line.match(/^[A-Z][a-zA-Z\s,]+$/)) {
      html += `<p class="company">${line}</p>`;
    }
    // Regular content
    else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<p>${line}</p>`;
    }
  }
  
  if (inList) {
    html += '</ul>';
  }
  
  return html;
}

export default function ResumeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [resume, setResume] = useState<ResumeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showExportModal, setShowExportModal] = useState(false)
  const [scoreData, setScoreData] = useState<any>(null)
  const [scoring, setScoring] = useState(false)
  const [reparsing, setReparsing] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!id) return
    
    let isMounted = true
    
    const loadAndPoll = async () => {
      try {
        setLoading(true)
        const data = await resumeService.getResume(id)
        
        if (!isMounted) return
        
        // Only update if data actually changed to prevent infinite re-renders
        setResume(prevResume => {
          if (!prevResume || prevResume.resume_id !== data.resume_id || prevResume.status !== data.status) {
            return data;
          }
          return prevResume;
        })
        
        // Auto-load score if it exists
        if (data.latest_score) {
          try {
            const score = await resumeService.getScore(id)
            if (isMounted) setScoreData(score)
          } catch (error) {
            console.error('Failed to load score:', error)
          }
        }
        
        // Only start polling if resume is NOT in a final state
        if (data.status !== 'PARSED' && data.status !== 'SCORED' && data.status !== 'ERROR') {
          pollingIntervalRef.current = setInterval(async () => {
            try {
              const updatedData = await resumeService.getResume(id)
              
              if (!isMounted) return
              
              // Only update if status changed
              setResume(prevResume => {
                if (!prevResume || prevResume.status !== updatedData.status) {
                  return updatedData;
                }
                return prevResume;
              });
              
              // Stop polling if we've reached a final state
              if (updatedData.status === 'PARSED' || updatedData.status === 'SCORED' || updatedData.status === 'ERROR') {
                if (pollingIntervalRef.current) {
                  clearInterval(pollingIntervalRef.current)
                  pollingIntervalRef.current = null
                }
                
                if (updatedData.status === 'PARSED' || updatedData.status === 'SCORED') {
                  toast.success('Resume processing complete!')
                }
              }
            } catch (error: any) {
              if (!isMounted) return
              
              // If 404, the resume was deleted - stop polling
              if (error.response?.status === 404) {
                if (pollingIntervalRef.current) {
                  clearInterval(pollingIntervalRef.current)
                  pollingIntervalRef.current = null
                }
                setResume(null)
              }
            }
          }, 3000)
        }
      } catch (error: any) {
        if (!isMounted) return
        
        console.error('Failed to load resume:', error)
        toast.error('Failed to load resume details')
        navigate('/resumes')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    
    loadAndPoll()
    
    return () => {
      isMounted = false
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [id, navigate])

  const loadResume = async (resumeId: string) => {
    try {
      setLoading(true)
      const data = await resumeService.getResume(resumeId)
      setResume(data)
      
      // Auto-load score if it exists
      if (data.latest_score) {
        try {
          const score = await resumeService.getScore(resumeId)
          setScoreData(score)
        } catch (error) {
          console.error('Failed to load score:', error)
        }
      }
    } catch (error: any) {
      console.error('Failed to load resume:', error)
      toast.error('Failed to load resume details')
      navigate('/resumes')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckScore = async () => {
    if (!resume) return

    try {
      setScoring(true)
      const score = await resumeService.scoreResume(resume.resume_id)
      setScoreData(score)
      toast.success('ATS score generated successfully!')
    } catch (error: any) {
      console.error('Scoring error:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to generate ATS score'
      
      if (errorMessage.includes('parsed') || errorMessage.includes('parsing')) {
        toast.error('Resume is being parsed. Please wait a moment and try again.', {
          duration: 5000
        })
      } else if (errorMessage.includes('Network')) {
        toast.error('Network error. Please ensure the backend is running.')
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setScoring(false)
    }
  }

  const handleReparse = async () => {
    if (!resume) return

    try {
      setReparsing(true)
      await resumeService.reparseResume(resume.resume_id)
      toast.success('Re-parsing triggered! Extracting data with updated parser...')
      
      // Reload resume data after a delay to show the update
      setTimeout(async () => {
        try {
          const data = await resumeService.getResume(resume.resume_id)
          setResume(data)
          toast.success('Resume parsing complete! Updated data loaded.')
        } catch (error) {
          console.error('Error reloading resume:', error)
        }
      }, 3000)
    } catch (error: any) {
      console.error('Reparse error:', error)
      toast.error('Failed to trigger re-parsing')
    } finally {
      setReparsing(false)
    }
  }

  const handleDelete = async () => {
    if (!resume || !confirm(`Delete "${resume.original_filename}"?`)) return

    try {
      await resumeService.deleteResume(resume.resume_id)
      // Clear the resume state immediately to stop polling
      setResume(null)
      toast.success('Resume deleted successfully')
      // Navigate after clearing state to prevent polling from running
      navigate('/resumes')
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error('Failed to delete resume')
    }
  }

  const handleDownload = async () => {
    if (!resume) return

    try {
      // Call backend proxy to stream the original file (avoids CORS)
      // Include Firebase ID token for authentication
      const authModule = await import('@/lib/firebase')
      const user = authModule.auth.currentUser
      let token = ''
      if (user) token = await user.getIdToken()

      const resp = await fetch(`/api/resumes/${resume.resume_id}/download-original`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
      })

      if (!resp.ok) {
        throw new Error('Download failed')
      }

      const blob = await resp.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = resume.original_filename || 'resume.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Direct download failed. Please check the backend or try again.')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusInfo = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; icon: any; className: string; description: string }
    > = {
      UPLOADED: {
        label: 'Uploaded',
        icon: CheckCircle,
        className: 'text-secondary-600 bg-secondary-500',
        description: 'Resume has been uploaded successfully',
      },
      PARSING: {
        label: 'Parsing',
        icon: Clock,
        className: 'text-warning-600 bg-warning-100',
        description: 'Extracting text and information from resume',
      },
      PARSED: {
        label: 'Parsed',
        icon: CheckCircle,
        className: 'text-success-600 bg-success-600',
        description: 'Resume has been parsed successfully',
      },
      SCORING: {
        label: 'Scoring',
        icon: Clock,
        className: 'text-purple-600 bg-purple-100',
        description: 'Analyzing ATS compatibility',
      },
      SCORED: {
        label: 'Scored',
        icon: CheckCircle,
        className: 'text-success-600 bg-success-100',
        description: 'ATS analysis complete',
      },
      ERROR: {
        label: 'Error',
        icon: AlertCircle,
        className: 'text-danger-600 bg-danger-100',
        description: 'Processing failed',
      },
    }

    return statusConfig[status] || statusConfig.UPLOADED
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900 mx-auto"></div>
          <p className="mt-4 text-secondary-600">Loading resume details...</p>
        </div>
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-danger-600 mx-auto" />
        <h2 className="mt-4 text-xl font-semibold text-secondary-900">Resume not found</h2>
        <button onClick={() => navigate('/resumes')} className="btn-primary mt-4">
          Back to Resumes
        </button>
      </div>
    )
  }

  const statusInfo = getStatusInfo(resume.status)
  const StatusIcon = statusInfo.icon
  const isParsing = resume.status === 'PARSING'
  const canScore = resume.status === 'PARSED' || resume.status === 'SCORED' || resume.status === 'UPLOADED'

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header with Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/resumes')}
          className="flex items-center gap-2 text-secondary-600 hover:text-primary-900 font-medium transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Resumes
        </button>

        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="h-14 w-14 rounded-lg bg-secondary-100 flex items-center justify-center flex-shrink-0">
              <FileText className="h-7 w-7 text-secondary-600" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-secondary-900 mb-2 break-words">
                {resume.original_filename}
              </h1>

              <div className="flex items-center gap-4 text-sm text-secondary-600 mb-3">
                <div className="flex items-center gap-1.5">
                  <HardDrive className="h-4 w-4" />
                  {formatFileSize(resume.file_size)}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDate(resume.created_at)}
                </div>
              </div>

              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusInfo.className}`}>
                <StatusIcon className="h-4 w-4" />
                <span className="font-medium text-sm">{statusInfo.label}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-start gap-2 flex-shrink-0">
            <button
              onClick={() => navigate(`/editor/${resume.resume_id}`)}
              className="px-4 py-2 bg-primary-900 text-white rounded-lg font-medium hover:bg-primary-800 transition-colors flex items-center gap-2"
              title="Edit Resume"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>

            <button
              onClick={handleDelete}
              className="p-2 bg-white border border-danger-300 text-danger-600 rounded-lg font-medium hover:bg-danger-50 transition-colors"
              title="Delete Resume"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Processing Banner */}
      {isParsing && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-warning-600 border-t-transparent"></div>
            <div>
              <h3 className="font-semibold text-warning-900 text-sm">Processing Your Resume</h3>
              <p className="text-sm text-warning-700 mt-0.5">
                Extracting text and analyzing content. This typically takes 10-30 seconds.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {resume.status === 'ERROR' && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-danger-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-danger-900 text-sm">Processing Error</h3>
              <p className="text-sm text-danger-700 mt-0.5">
                We encountered an issue processing your resume. Please try uploading it again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Resume Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* ATS Score Card */}
          {scoreData ? (
            <div className="bg-white rounded-lg border border-secondary-200 p-6">
              <ComprehensiveATSScore
                score={scoreData.total_score}
                rating={scoreData.rating}
                breakdown={scoreData.breakdown}
                strengths={scoreData.strengths || []}
                weaknesses={scoreData.weaknesses || []}
                missing_keywords={scoreData.missing_keywords || []}
                section_feedback={scoreData.section_feedback || {}}
                recommendations={scoreData.recommendations || []}
                improved_bullets={scoreData.improved_bullets || []}
                job_description_provided={scoreData.job_description_provided || false}
                loading={scoring}
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-secondary-200 p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-3">ATS Score</h2>
              <p className="text-sm text-secondary-600 mb-4">
                {!canScore 
                  ? 'Your resume is being processed. ATS scoring will be available once parsing is complete.'
                  : 'Check how well your resume performs with Applicant Tracking Systems.'
                }
              </p>
              <button
                onClick={handleCheckScore}
                disabled={scoring || isParsing}
                className="px-5 py-2.5 bg-success-600 text-white rounded-lg font-medium hover:bg-success-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title={isParsing ? 'Resume is being parsed. Try again in a moment.' : ''}
              >
                {scoring ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Check ATS Score
                  </>
                )}
              </button>
            </div>
          )}

          {/* Resume Preview - Original PDF */}
          {resume.storage_url ? (
            <div className="bg-white rounded-lg border border-secondary-200 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-secondary-200 bg-secondary-50">
                <h2 className="text-lg font-semibold text-secondary-900">Original Resume</h2>
                <button
                  onClick={() => navigate(`/editor/${resume.resume_id}`)}
                  className="px-4 py-2 bg-primary-900 text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              </div>
              
              {/* PDF Viewer - Full Size with proper aspect ratio */}
              <div className="w-full bg-secondary-100" style={{ height: 'calc(100vh - 250px)', minHeight: '900px' }}>
                <iframe
                  src={`${resume.storage_url}#view=FitH&toolbar=0&navpanes=0`}
                  className="w-full h-full"
                  title="Resume PDF Viewer"
                  style={{ border: 'none' }}
                />
              </div>
            </div>
          ) : resume.parsed_text || resume.contact_info ? (
            <div className="bg-white rounded-lg border border-secondary-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-secondary-900">Resume Preview</h2>
                <button
                  onClick={() => navigate(`/editor/${resume.resume_id}`)}
                  className="px-4 py-2 bg-primary-900 text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit in Resume Editor
                </button>
              </div>
              
              {/* Professional Resume Template (for wizard-created resumes) */}
              <div className="bg-white border border-secondary-200 rounded-lg max-h-[900px] overflow-y-auto">
                <TemplateRenderer resume={resume} />
              </div>
            </div>
          ) : resume.status === 'PARSING' || resume.status === 'UPLOADED' ? (
            <div className="bg-white rounded-lg border border-secondary-200 p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Resume Preview</h2>
              <div className="bg-secondary-50 rounded-lg p-4 text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-900 border-t-transparent mx-auto mb-3"></div>
                <p className="text-sm text-secondary-600">Extracting and formatting your resume...</p>
              </div>
            </div>
          ) : null}

          {/* Contact Info */}
          {resume.contact_info && Object.keys(resume.contact_info).length > 0 ? (
            <div className="bg-white rounded-lg border border-secondary-200 p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Contact Information</h2>
              <div className="space-y-2">
                {Object.entries(resume.contact_info).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <div key={key} className="flex items-start gap-3">
                      <span className="text-sm font-medium text-secondary-600 capitalize min-w-24">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span className="text-sm text-secondary-900">{String(value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : resume.status === 'PARSING' || resume.status === 'UPLOADED' ? (
            <div className="bg-white rounded-lg border border-secondary-200 p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Contact Information</h2>
              <div className="bg-secondary-50 rounded-lg p-4 text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-900 border-t-transparent mx-auto mb-3"></div>
                <p className="text-sm text-secondary-600">Extracting contact information...</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Right Column - Actions & Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-secondary-200 p-6">
            <h3 className="text-sm font-semibold text-secondary-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={handleDownload}
                disabled={!resume.storage_url}
                className="w-full px-4 py-2.5 bg-primary-900 text-white rounded-lg font-medium hover:bg-primary-800 transition-colors flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>

              <button
                onClick={() => navigate(`/editor/${resume.resume_id}`)}
                className="w-full px-4 py-2.5 bg-white border border-secondary-300 text-secondary-700 rounded-lg font-medium hover:bg-secondary-50 transition-colors flex items-center gap-2 justify-center"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Resume
              </button>
              {resume.status === 'PARSED' || resume.status === 'SCORED' ? (
                <p className="text-xs text-success-600 px-2 py-1 bg-success-50 rounded">
                  ✓ Resume data parsed and ready to edit
                </p>
              ) : isParsing ? (
                <p className="text-xs text-warning-600 px-2 py-1 bg-warning-50 rounded flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Parsing in progress. Editor will load parsed data soon.
                </p>
              ) : null}

              <button
                onClick={handleDelete}
                className="w-full px-4 py-2.5 bg-white border border-danger-300 text-danger-600 rounded-lg font-medium hover:bg-danger-50 transition-colors flex items-center gap-2 justify-center"
              >
                <Trash2 className="h-4 w-4" />
                Delete Resume
              </button>
            </div>
          </div>

          {/* Resume Info */}
          <div className="bg-white rounded-lg border border-secondary-200 p-6">
            <h3 className="text-sm font-semibold text-secondary-900 mb-4">Resume Details</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs font-medium text-secondary-500 mb-1">Status</div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${statusInfo.className}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusInfo.label}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-secondary-500 mb-1">File Size</div>
                <div className="text-sm text-secondary-900">{formatFileSize(resume.file_size)}</div>
              </div>

              <div>
                <div className="text-xs font-medium text-secondary-500 mb-1">Uploaded</div>
                <div className="text-sm text-secondary-900">{formatDate(resume.created_at)}</div>
              </div>

              {resume.latest_score && (
                <div>
                  <div className="text-xs font-medium text-secondary-500 mb-1">Latest ATS Score</div>
                  <div className="text-2xl font-bold text-success-600">{resume.latest_score}%</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PDF Export Modal */}
      <PdfExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        resumeId={resume.resume_id}
        resumeName={resume.original_filename}
      />
    </div>
  )
}
