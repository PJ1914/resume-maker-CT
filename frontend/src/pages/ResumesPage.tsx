import { useNavigate } from 'react-router-dom'
import { FileText, Trash2, Eye, Upload, AlertCircle, Sparkles } from 'lucide-react'
import { useResumes, useDeleteResume } from '@/hooks/useResumes'
import type { ResumeListItem } from '@/services/resume.service'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useState } from 'react'

export default function ResumesPage() {
  const navigate = useNavigate()
  const { data: resumesData, isLoading: loading } = useResumes()
  const { mutate: deleteResume } = useDeleteResume()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedResume, setSelectedResume] = useState<{ id: string; filename: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const resumes = resumesData || []

  const handleDeleteClick = (resumeId: string, filename: string) => {
    setSelectedResume({ id: resumeId, filename })
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (!selectedResume) return
    setIsDeleting(true)
    deleteResume(selectedResume.id, {
      onSuccess: () => {
        setIsDeleting(false)
        setShowDeleteModal(false)
        setSelectedResume(null)
      },
      onError: () => {
        setIsDeleting(false)
      }
    })
  }

  const handleView = (resumeId: string) => {
    navigate(`/resumes/${resumeId}`)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      UPLOADED: { label: 'Uploaded', className: 'bg-blue-100 text-blue-800' },
      PARSING: { label: 'Parsing', className: 'bg-yellow-100 text-yellow-800' },
      PARSED: { label: 'Parsed', className: 'bg-green-100 text-green-800' },
      SCORING: { label: 'Scoring', className: 'bg-purple-100 text-purple-800' },
      SCORED: { label: 'Scored', className: 'bg-success-100 text-success-800' },
      ERROR: { label: 'Error', className: 'bg-danger-100 text-danger-800' },
    }

    const config = statusConfig[status] || statusConfig.UPLOADED
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return 'Created from Form'
    if (bytes < 0) return 'Created from Form'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-6 sm:mb-8">
          <div className="h-8 w-48 bg-secondary-200 dark:bg-secondary-800 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-32 bg-secondary-200 dark:bg-secondary-800 rounded animate-pulse"></div>
        </div>

        {/* Resume Cards Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-800 p-4 sm:p-6 animate-pulse"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0 w-full">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-secondary-200 dark:bg-secondary-800 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="h-5 bg-secondary-200 dark:bg-secondary-800 rounded w-3/4"></div>
                    <div className="h-4 bg-secondary-200 dark:bg-secondary-800 rounded w-1/2"></div>
                    <div className="h-2 bg-secondary-200 dark:bg-secondary-800 rounded-full w-full"></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 bg-secondary-200 dark:bg-secondary-800 rounded-lg"></div>
                  <div className="h-9 w-9 bg-secondary-200 dark:bg-secondary-800 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Clean Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white mb-1 sm:mb-2">
              My Resumes
            </h1>
            <p className="text-sm sm:text-base text-secondary-600 dark:text-secondary-400">
              {resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/resume/create')}
              className="justify-center px-4 sm:px-5 py-2.5 bg-white dark:bg-secondary-900 border-2 border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg font-medium hover:border-primary-900 dark:hover:border-primary-500 hover:text-primary-900 dark:hover:text-primary-500 transition-colors flex items-center gap-2 text-sm sm:text-base"
            >
              <Sparkles className="h-4 w-4" />
              Create New
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="justify-center px-4 sm:px-5 py-2.5 bg-primary-900 text-white rounded-lg font-medium hover:bg-primary-800 transition-colors flex items-center gap-2 text-sm sm:text-base"
            >
              <Upload className="h-4 w-4" />
              Upload Resume
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {resumes.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white dark:bg-secondary-900 rounded-lg border-2 border-dashed border-secondary-300 dark:border-secondary-700 px-4">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center mx-auto">
            <FileText className="h-7 w-7 sm:h-8 sm:w-8 text-secondary-400 dark:text-secondary-500" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-secondary-900 dark:text-white">
            No resumes yet
          </h3>
          <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400 max-w-md mx-auto">
            Upload your first resume or create one from scratch to get started.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 w-full sm:w-auto">
            <button
              onClick={() => navigate('/resume/create')}
              className="w-full sm:w-auto justify-center px-5 py-2.5 bg-white dark:bg-secondary-900 border-2 border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg font-medium hover:border-primary-900 dark:hover:border-primary-500 hover:text-primary-900 dark:hover:text-primary-500 transition-colors flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Create New
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="w-full sm:w-auto justify-center px-5 py-2.5 bg-primary-900 text-white rounded-lg font-medium hover:bg-primary-800 transition-colors flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Resume
            </button>
          </div>
        </div>
      ) : (
        /* Resume List */
        <div className="space-y-4">
          {resumes.map((resume: ResumeListItem) => (
            <div
              key={resume.resume_id}
              className="bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-800 p-4 sm:p-6 hover:border-secondary-300 dark:hover:border-secondary-600 hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
                {/* Left: File Info */}
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0 w-full">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-secondary-600 dark:text-secondary-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-secondary-900 dark:text-white truncate mb-1">
                      {resume.original_filename}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-secondary-600 dark:text-secondary-400">
                      <span>{formatFileSize(resume.file_size)}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Uploaded {formatDate(resume.created_at)}</span>
                      <span className="hidden sm:inline">•</span>
                      <div className="mt-1 sm:mt-0">{getStatusBadge(resume.status)}</div>
                    </div>

                    {resume.latest_score !== null && resume.latest_score !== undefined && (
                      <div className="mt-3 sm:mt-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs sm:text-sm font-medium text-secondary-700 dark:text-secondary-300">
                            ATS Score
                          </span>
                          <span className={`text-xs sm:text-sm font-bold ${resume.latest_score >= 80
                            ? 'text-success-600'
                            : resume.latest_score >= 60
                              ? 'text-warning-600'
                              : 'text-danger-600'
                            }`}>
                            {resume.latest_score}%
                          </span>
                        </div>
                        <div className="h-1.5 sm:h-2 w-full bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${resume.latest_score >= 80
                              ? 'bg-success-500'
                              : resume.latest_score >= 60
                                ? 'bg-warning-500'
                                : 'bg-danger-500'
                              }`}
                            style={{ width: `${resume.latest_score}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {resume.status === 'ERROR' && (
                      <div className="mt-3 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-danger-600 dark:text-danger-400">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          <span className="font-medium">Processing failed</span>
                        </div>
                        {resume.error_message && (
                          <p className="text-xs text-secondary-600 dark:text-secondary-400 ml-6">
                            {resume.error_message}
                          </p>
                        )}
                        <button
                          onClick={() => {
                            handleDeleteClick(resume.resume_id, resume.original_filename);
                          }}
                          className="text-xs text-primary-600 dark:text-primary-400 hover:underline ml-6 text-left"
                        >
                          Delete and try again
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-secondary-100 dark:border-secondary-800 pt-3 sm:pt-0 mt-2 sm:mt-0">
                  <button
                    onClick={() => handleView(resume.resume_id)}
                    className="flex-1 sm:flex-none justify-center p-2 sm:p-2.5 bg-secondary-50 dark:bg-secondary-800 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors flex items-center gap-2 text-sm text-secondary-700 dark:text-secondary-300 sm:text-current"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-600 dark:text-secondary-400" />
                    <span className="sm:hidden">View</span>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(resume.resume_id, resume.original_filename)}
                    className="flex-1 sm:flex-none justify-center p-2 sm:p-2.5 bg-secondary-50 dark:bg-secondary-800 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors flex items-center gap-2 text-sm text-danger-600 dark:text-danger-400 sm:text-current"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-600 dark:text-secondary-400 hover:text-danger-600 dark:hover:text-danger-400 transition-colors" />
                    <span className="sm:hidden">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedResume(null)
        }}
        onConfirm={confirmDelete}
        title="Delete Resume"
        message={selectedResume ? `Are you sure you want to delete "${selectedResume.filename}"? This action cannot be undone.` : 'Delete this resume?'}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={isDeleting}
      />
    </div>
  )
}
