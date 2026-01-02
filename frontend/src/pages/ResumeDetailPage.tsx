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
  Cpu,
  Sparkles,
  RefreshCw,
  Briefcase,
} from 'lucide-react'
import { useResume, useDeleteResume } from '@/hooks/useResumes'
import { API_URL } from '@/config/firebase'
import { useResumeScore, useScoreResume } from '@/hooks/useScoring'
import { resumeService, type ResumeDetail } from '@/services/resume.service'
import toast from 'react-hot-toast'
import PdfExportModal from '@/components/PdfExportModal'
import ComprehensiveATSScore from '@/components/ComprehensiveATSScore'
import { TemplateRenderer } from '@/components/TemplateRenderer'
import { ScorerToggle } from '@/components/ui/toggle'
import { ConfirmModal } from '@/components/ui/ConfirmModal'



export default function ResumeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: resume, isLoading: loading, refetch } = useResume(id)
  const { data: scoreData, refetch: refetchScore } = useResumeScore(id)
  const { mutate: scoreResume, isPending: scoring } = useScoreResume()
  const { mutate: deleteResumeMutation } = useDeleteResume()
  const [showExportModal, setShowExportModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAICreditModal, setShowAICreditModal] = useState(false)
  const [showCreditsExhaustedModal, setShowCreditsExhaustedModal] = useState(false)
  const [reparsing, setReparsing] = useState(false)
  const [useAIScorer, setUseAIScorer] = useState(true) // Toggle between prativeda AI and Local scorer
  const [jobDescription, setJobDescription] = useState('')
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const initialScorerSet = useRef(false)

  // Set initial toggle state based on cached score's scoring method
  useEffect(() => {
    if (scoreData?.scoring_method && !initialScorerSet.current) {
      const isGemini = scoreData.scoring_method.includes('gemini')
      setUseAIScorer(isGemini)
      initialScorerSet.current = true
    }
  }, [scoreData?.scoring_method])

  useEffect(() => {
    if (!id || !resume) return

    // Poll for status updates if processing
    // We stop polling if status is PARSED, SCORED, or ERROR
    // We also stop if it's just UPLOADED but hasn't changed for a long time (handled by user action usually)
    // But for now, let's keep it simple but less aggressive
    if (resume.status === 'PARSING' || resume.status === 'SCORING') {
      pollingIntervalRef.current = setInterval(async () => {
        refetch()
      }, 3000)
    } else if (resume.status === 'UPLOADED') {
      // If it's uploaded but not parsing, maybe we should poll slower to check if parsing starts?
      // Or maybe we assume it should have started?
      // Let's poll slower
      pollingIntervalRef.current = setInterval(async () => {
        refetch()
      }, 5000)
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [id, resume?.status, refetch])

  const loadResume = async (resumeId: string) => {
    refetch()
  }

  const handleCheckScore = (preferGemini?: boolean, skipCache: boolean = false, skipCreditCheck: boolean = false) => {
    if (!resume || !id) return

    // Use provided value or fall back to current state
    const useGemini = preferGemini !== undefined ? preferGemini : useAIScorer

    // If using AI and not skipping credit check, show confirmation first
    if (useGemini && !skipCreditCheck) {
      setShowAICreditModal(true)
      return
    }

    console.log('Scoring with preferGemini:', useGemini, 'skipCache:', skipCache)

    scoreResume(
      { resumeId: id, preferGemini: useGemini, jobDescription: jobDescription },
      {
        onSuccess: (data) => {
          console.log('Score completed successfully, method:', data?.scoring_method, 'score:', data?.total_score)
          // Don't refetchScore - the mutation already updates the cache with the POST response
          // Only refetch resume data to sync latest_score in the sidebar
          refetch()
        },
        onError: (error: any) => {
          console.error('Scoring failed:', error)

          // Check for specific error codes
          const statusCode = error?.response?.status || error?.status
          const errorDetail = error?.response?.data?.detail || error?.message

          if (statusCode === 402) {
            setShowCreditsExhaustedModal(true)
          } else if (statusCode === 404) {
            toast.error('Resume not found. Please reload the page or select a different resume.')
          } else if (statusCode === 400) {
            toast.error(errorDetail || 'Resume is not ready for scoring yet. Please wait or upload the resume.')
          } else if (statusCode === 500) {
            toast.error(errorDetail || 'Server error occurred while scoring. Please try again later.')
          } else {
            // For other errors, show generic error toast
            toast.error(errorDetail || 'Failed to calculate ATS score')
          }
        }
      }
    )
  }

  // Handle toggle change - automatically re-score with new scorer
  const handleScorerToggle = (checked: boolean) => {
    console.log('Toggle changed to:', checked ? 'prativeda AI' : 'Local')

    // If switching to AI and already have a score, show credit confirmation
    if (checked && scoreData && id && resume) {
      setShowAICreditModal(true)
      return // Don't change toggle yet, wait for confirmation
    }

    setUseAIScorer(checked)
    // Only auto-score if we already have a score (user has scored before)
    if (scoreData && id && resume) {
      // Skip cache to force new scoring with selected scorer (Local is free, no credit check)
      handleCheckScore(checked, true, true)
    }
  }

  // Confirm AI scoring (after credit modal)
  const confirmAIScoring = () => {
    setShowAICreditModal(false)
    setUseAIScorer(true)
    if (id && resume) {
      handleCheckScore(true, true, true) // Skip credit check since already confirmed
    }
  }

  const handleReparse = async () => {
    if (!resume || !id) return

    try {
      setReparsing(true)
      await resumeService.reparseResume(id)
      toast.success('Re-parsing triggered! Extracting data with updated parser...')

      // Refetch resume data after a delay
      setTimeout(() => {
        refetch()
        toast.success('Resume parsing complete! Updated data loaded.')
      }, 3000)
    } catch (error: any) {
      console.error('Reparse error:', error)
      toast.error('Failed to trigger re-parsing')
    } finally {
      setReparsing(false)
    }
  }

  const handleDelete = () => {
    if (!resume || !id) return
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (!id) return
    setShowDeleteModal(false)
    deleteResumeMutation(id, {
      onSuccess: () => {
        navigate('/resumes')
      },
    })
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

      const resp = await fetch(`${API_URL}/api/resumes/${resume.resume_id}/download-original`, {
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

  if (loading || !resume) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 py-6">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header Skeleton */}
          <div className="mb-6 animate-pulse">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-secondary-300 dark:bg-secondary-800 rounded-lg"></div>
              <div className="h-8 w-64 bg-secondary-300 dark:bg-secondary-800 rounded"></div>
            </div>




            {/* Action Buttons Skeleton */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="h-10 w-32 bg-secondary-300 dark:bg-secondary-800 rounded-lg"></div>
              <div className="h-10 w-32 bg-secondary-300 dark:bg-secondary-800 rounded-lg"></div>
              <div className="h-10 w-32 bg-secondary-300 dark:bg-secondary-800 rounded-lg"></div>
            </div>
          </div>

          {/* Content Grid Skeleton */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Info Cards */}
            <div className="lg:col-span-1 space-y-4 animate-pulse">
              <div className="bg-white dark:bg-secondary-900 rounded-xl p-6 space-y-4">
                <div className="h-5 w-24 bg-secondary-300 dark:bg-secondary-800 rounded"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-secondary-200 dark:bg-secondary-800 rounded"></div>
                  <div className="h-4 bg-secondary-200 dark:bg-secondary-800 rounded"></div>
                  <div className="h-4 bg-secondary-200 dark:bg-secondary-800 rounded w-3/4"></div>
                </div>
              </div>

              <div className="bg-white dark:bg-secondary-900 rounded-xl p-6 space-y-4">
                <div className="h-5 w-32 bg-secondary-300 dark:bg-secondary-800 rounded"></div>
                <div className="h-32 bg-secondary-200 dark:bg-secondary-800 rounded-lg"></div>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="lg:col-span-2 animate-pulse">
              <div className="bg-white dark:bg-secondary-900 rounded-xl p-6 space-y-4">
                <div className="h-6 w-40 bg-secondary-300 dark:bg-secondary-800 rounded mb-4"></div>
                <div className="aspect-[8.5/11] bg-secondary-200 dark:bg-secondary-800 rounded-lg"></div>
              </div>
            </div>
          </div>
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
    <div className="p-4 sm:p-8 max-w-7xl mx-auto overflow-x-hidden">
      {/* Header with Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/resumes')}
          className="flex items-center gap-2 text-secondary-600 hover:text-primary-900 font-medium transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Resumes
        </button>

        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
          <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full sm:w-auto min-w-0">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-secondary-600 dark:text-secondary-400" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-secondary-900 dark:text-secondary-50 mb-1.5 sm:mb-2 break-words">
                {resume.original_filename}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1.5 sm:gap-y-2 text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 mb-2 sm:mb-3">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {formatFileSize(resume.file_size)}
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {formatDate(resume.created_at)}
                </div>
              </div>

              {/* Status Badge */}
              <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg ${statusInfo.className}`}>
                <StatusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="font-medium text-xs sm:text-sm">{statusInfo.label}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <button
              onClick={() => navigate(`/editor/${resume.resume_id}`)}
              className="flex-1 sm:flex-none justify-center px-3 py-2 sm:px-4 sm:py-2 bg-primary-900 text-white rounded-lg font-medium text-sm sm:text-base hover:bg-primary-800 transition-colors flex items-center gap-2"
              title="Edit Resume"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>

            <button
              onClick={handleDelete}
              className="p-2 bg-white dark:bg-secondary-900 border border-danger-300 dark:border-danger-900 text-danger-600 dark:text-danger-400 rounded-lg font-medium hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
              title="Delete Resume"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Processing Banner */}
      {isParsing && (
        <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-warning-600 border-t-transparent"></div>
            <div>
              <h3 className="font-semibold text-warning-900 dark:text-warning-100 text-sm">Processing Your Resume</h3>
              <p className="text-sm text-warning-700 dark:text-warning-300 mt-0.5">
                Extracting text and analyzing content. This typically takes 10-30 seconds.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {resume.status === 'ERROR' && (
        <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-danger-600 dark:text-danger-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-danger-900 dark:text-danger-100 text-sm">Processing Error</h3>
              <p className="text-sm text-danger-700 dark:text-danger-300 mt-0.5">
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
            <div className="bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-800 p-6">
              {/* Scorer Type Toggle */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">Scorer:</span>
                  <ScorerToggle
                    checked={useAIScorer}
                    onCheckedChange={handleScorerToggle}
                    leftLabel="Local"
                    leftSubLabel="Free"
                    rightLabel="prativeda AI"
                    rightSubLabel="Detailed"
                  />
                  {scoring && (
                    <span className="flex items-center gap-1.5 text-xs text-secondary-500 dark:text-secondary-400">
                      <RefreshCw className="animate-spin h-3 w-3" />
                      Scoring...
                    </span>
                  )}
                </div>
              </div>

              {/* Check if this is a Local score (simple view) or AI score (detailed view) */}
              {scoreData.scoring_method?.includes('gemini') ? (
                /* AI/Gemini Score - Full Detailed View */
                <>
                  {/* Score Engine Indicator */}
                  <div className="mb-4 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-xs text-primary-700 dark:text-primary-400 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="font-medium">AI-Powered Analysis</span>
                    <span className="text-primary-500 dark:text-primary-400/70">• Detailed breakdown included</span>
                  </div>
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
                </>
              ) : (
                /* Local Score - Simple View (Score Only) */
                <>
                  {/* Score Engine Indicator */}
                  <div className="mb-4 px-3 py-2 bg-secondary-50 dark:bg-secondary-800 rounded-lg text-xs text-secondary-600 dark:text-secondary-400 flex items-center gap-2">
                    <Cpu className="h-3.5 w-3.5" />
                    <span className="font-medium">Local Engine</span>
                    <span className="text-secondary-400">• Free basic score</span>
                  </div>

                  {/* Simple Score Display */}
                  <div className="text-center py-8">
                    <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-50 mb-4">ATS Compatibility Score</h2>
                    <div className="relative inline-flex items-center justify-center">
                      <svg className="w-36 h-36 transform -rotate-90">
                        <circle
                          cx="72"
                          cy="72"
                          r="60"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-secondary-200 dark:text-secondary-700"
                        />
                        <circle
                          cx="72"
                          cy="72"
                          r="60"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${(scoreData.total_score / 100) * 377} 377`}
                          strokeLinecap="round"
                          className={
                            scoreData.total_score >= 80 ? 'text-green-500' :
                              scoreData.total_score >= 60 ? 'text-yellow-500' :
                                'text-red-500'
                          }
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-bold ${scoreData.total_score >= 80 ? 'text-green-600 dark:text-green-400' :
                          scoreData.total_score >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                          {Math.round(scoreData.total_score)}
                        </span>
                        <span className="text-sm text-secondary-500 dark:text-secondary-400">/ 100</span>
                      </div>
                    </div>

                    {/* Rating Badge */}
                    <div className="mt-4">
                      <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${scoreData.total_score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        scoreData.total_score >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        {scoreData.rating || (scoreData.total_score >= 80 ? 'Excellent' : scoreData.total_score >= 60 ? 'Good' : 'Needs Work')}
                      </span>
                    </div>

                    {/* Upgrade CTA */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg">
                      <p className="text-sm text-secondary-700 dark:text-secondary-300 mb-3">
                        Want detailed insights, improvement suggestions, and keyword analysis?
                      </p>
                      <button
                        onClick={() => handleScorerToggle(true)}
                        disabled={scoring}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
                      >
                        <Sparkles className="h-4 w-4" />
                        Get AI-Powered Analysis
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-800 p-6">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-50 mb-3">ATS Score</h2>
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">
                {!canScore
                  ? 'Your resume is being processed. ATS scoring will be available once parsing is complete.'
                  : 'Check how well your resume performs with Applicant Tracking Systems.'
                }
              </p>
              {/* Scorer Type Selection */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">Choose scorer:</span>
                <ScorerToggle
                  checked={useAIScorer}
                  onCheckedChange={setUseAIScorer}
                  leftLabel="Local"
                  leftSubLabel="Free"
                  rightLabel="prativeda AI"
                  rightSubLabel="Detailed"
                />
              </div>

              {/* Info about selected scorer */}
              <div className={`mb-4 p-3 rounded-lg text-sm ${useAIScorer
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                : 'bg-secondary-50 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400'
                }`}>
                {useAIScorer ? (
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>AI-Powered Analysis</strong>
                      <p className="text-xs mt-1 opacity-80">Get detailed breakdown, improvement suggestions, keyword analysis, and actionable recommendations.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <Cpu className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Basic Score (Free)</strong>
                      <p className="text-xs mt-1 opacity-80">Quick ATS compatibility score. Upgrade to AI for detailed insights.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Job Description Input (AI Only) */}
              {useAIScorer && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    Target Job Description (Optional)
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here for tailored ATS scoring..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[100px] resize-y placeholder:text-secondary-400"
                  />
                  <p className="mt-1 text-xs text-secondary-500">
                    Adding a JD helps us check keyword matching and relevance.
                  </p>
                </div>
              )}

              <button
                onClick={() => handleCheckScore()}
                disabled={scoring || isParsing}
                className={`px-5 py-2.5 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${useAIScorer ? 'bg-primary-600 hover:bg-primary-700' : 'bg-success-600 hover:bg-success-700'
                  }`}
                title={isParsing ? 'Resume is being parsed. Try again in a moment.' : ''}
              >
                {scoring ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing with {useAIScorer ? 'prativeda AI' : 'Local Engine'}...
                  </>
                ) : (
                  <>
                    {useAIScorer ? <Sparkles className="h-4 w-4" /> : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {useAIScorer ? 'Get AI Analysis' : 'Check Score (Free)'}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Resume Preview - Original PDF */}
          {resume.storage_url ? (
            <div className="bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-800 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-950">
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-50">Original Resume</h2>
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
              <div className="w-full bg-secondary-100 dark:bg-secondary-800 h-[500px] sm:h-[calc(100vh-250px)] sm:min-h-[800px]">
                <iframe
                  src={`${resume.storage_url}#view=FitH&toolbar=0&navpanes=0`}
                  className="w-full h-full"
                  title="Resume PDF Viewer"
                  style={{ border: 'none' }}
                />
              </div>
            </div>
          ) : resume.parsed_text || resume.contact_info ? (
            <div className="bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-50">Resume Preview</h2>
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

              {/* PDF Preview for all templates */}
              <TemplateRenderer resume={resume} />
            </div>
          ) : resume.status === 'PARSING' || resume.status === 'UPLOADED' ? (
            <div className="bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-800 p-6">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-50 mb-4">Resume Preview</h2>
              <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4 text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-900 dark:border-primary-500 border-t-transparent mx-auto mb-3"></div>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">Extracting and formatting your resume...</p>
              </div>
            </div>
          ) : null}

          {/* Contact Info */}
          {resume.contact_info && Object.keys(resume.contact_info).length > 0 ? (
            <div className="bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-800 p-6">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-50 mb-4">Contact Information</h2>
              <div className="space-y-2">
                {Object.entries(resume.contact_info).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <div key={key} className="flex items-start gap-3">
                      <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400 capitalize min-w-24">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span className="text-sm text-secondary-900 dark:text-secondary-200">{String(value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : resume.status === 'PARSING' || resume.status === 'UPLOADED' ? (
            <div className="bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-800 p-6">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-50 mb-4">Contact Information</h2>
              <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4 text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-900 dark:border-primary-500 border-t-transparent mx-auto mb-3"></div>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">Extracting contact information...</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Right Column - Actions & Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-800 p-6">
            <h3 className="text-sm font-semibold text-secondary-900 dark:text-secondary-50 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={handleDownload}
                disabled={!resume.storage_url}
                className="w-full px-4 py-2.5 bg-white dark:bg-secondary-900 border border-secondary-300 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg font-medium hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                Download Original
              </button>

              <button
                onClick={() => setShowExportModal(true)}
                className="w-full px-4 py-2.5 bg-primary-900 text-white rounded-lg font-medium hover:bg-primary-800 transition-colors flex items-center gap-2 justify-center"
              >
                <FileText className="h-4 w-4" />
                Export as PDF
              </button>

              <button
                onClick={() => navigate(`/editor/${resume.resume_id}`)}
                className="w-full px-4 py-2.5 bg-white dark:bg-secondary-900 border border-secondary-300 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg font-medium hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors flex items-center gap-2 justify-center"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Resume
              </button>
              {resume.status === 'PARSED' || resume.status === 'SCORED' ? (
                <p className="text-xs text-success-600 px-2 py-1 bg-success-50 dark:bg-success-900/20 rounded">
                  ✓ Resume data parsed and ready to edit
                </p>
              ) : isParsing ? (
                <p className="text-xs text-warning-600 px-2 py-1 bg-warning-50 dark:bg-warning-900/20 rounded flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Parsing in progress. Editor will load parsed data soon.
                </p>
              ) : null}

              <button
                onClick={handleDelete}
                className="w-full px-4 py-2.5 bg-white dark:bg-secondary-900 border border-danger-300 dark:border-danger-900 text-danger-600 dark:text-danger-400 rounded-lg font-medium hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors flex items-center gap-2 justify-center"
              >
                <Trash2 className="h-4 w-4" />
                Delete Resume
              </button>
            </div>
          </div>

          {/* Resume Info */}
          <div className="bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-800 p-6">
            <h3 className="text-sm font-semibold text-secondary-900 dark:text-secondary-50 mb-4">Resume Details</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs font-medium text-secondary-500 dark:text-secondary-400 mb-1">Status</div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${statusInfo.className}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusInfo.label}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-secondary-500 dark:text-secondary-400 mb-1">File Size</div>
                <div className="text-sm text-secondary-900 dark:text-secondary-50">{formatFileSize(resume.file_size)}</div>
              </div>

              <div>
                <div className="text-xs font-medium text-secondary-500 dark:text-secondary-400 mb-1">Uploaded</div>
                <div className="text-sm text-secondary-900 dark:text-secondary-50">{formatDate(resume.created_at)}</div>
              </div>

              <div>
                <div className="text-xs font-medium text-secondary-500 dark:text-secondary-400 mb-1">Template</div>
                <div className="text-sm text-secondary-900 dark:text-secondary-50">
                  {resume.template ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium">
                      {resume.template.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ) : (
                    <span className="text-secondary-500 dark:text-secondary-400">Uploaded (No template)</span>
                  )}
                </div>
              </div>

              {(scoreData?.total_score || resume.latest_score) && (
                <div>
                  <div className="text-xs font-medium text-secondary-500 dark:text-secondary-400 mb-1">Latest ATS Score</div>
                  <div className="text-2xl font-bold text-success-600">
                    {scoreData?.total_score ?? resume.latest_score}
                    <span className="text-base font-normal text-secondary-400">/100</span>
                  </div>
                  {scoreData?.scoring_method && (
                    <div className="text-xs text-secondary-500 mt-1 flex items-center gap-1">
                      {scoreData.scoring_method.includes('gemini') ? (
                        <><Sparkles className="h-3 w-3 text-primary-500" /> CodeTapasya AI</>
                      ) : (
                        <><Cpu className="h-3 w-3" /> Local</>
                      )}
                    </div>
                  )}
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
        template={resume.template || 'resume_1'}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Resume"
        message={`Are you sure you want to delete "${resume.original_filename}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* AI Credits Confirmation Modal */}
      <ConfirmModal
        isOpen={showAICreditModal}
        onClose={() => setShowAICreditModal(false)}
        onConfirm={confirmAIScoring}
        title="Use AI-Powered Analysis"
        message="AI scoring provides detailed insights, improvement suggestions, and keyword analysis. This will use credits from your account. Continue?"
        confirmText="Use AI Analysis"
        cancelText="Cancel"
        type="credits"
      />

      {/* Credits Exhausted Modal */}
      <ConfirmModal
        isOpen={showCreditsExhaustedModal}
        onClose={() => setShowCreditsExhaustedModal(false)}
        onConfirm={() => {
          setShowCreditsExhaustedModal(false)
          navigate('/credits/purchase')
        }}
        onCancel={() => {
          // Switch to local scoring and score
          setShowCreditsExhaustedModal(false)
          setUseAIScorer(false)
          if (id && resume) {
            handleCheckScore(false, true, true) // Use local (free) scoring
          }
        }}
        title="Credits Exhausted"
        message="You don't have enough credits for AI scoring. Switch to local (free) scoring or purchase credits to continue using AI features."
        confirmText="Buy Credits"
        cancelText="Use Local Scoring"
        type="danger"
      />
    </div>
  )
}
