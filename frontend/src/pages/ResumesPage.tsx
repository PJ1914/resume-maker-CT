import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Trash2, Eye, Upload, AlertCircle, Sparkles } from 'lucide-react'
import { resumeService, type ResumeListItem } from '@/services/resume.service'
import toast from 'react-hot-toast'

export default function ResumesPage() {
  const [resumes, setResumes] = useState<ResumeListItem[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadResumes()
  }, [])

  const loadResumes = async () => {
    try {
      setLoading(true)
      const data = await resumeService.listResumes()
      setResumes(data.resumes)
    } catch (error: any) {
      console.error('Failed to load resumes:', error)
      toast.error('Failed to load resumes')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (resumeId: string, filename: string) => {
    if (!confirm(`Delete "${filename}"?`)) return

    try {
      await resumeService.deleteResume(resumeId)
      toast.success('Resume deleted successfully')
      // Remove from state
      setResumes((prev) => prev.filter((r) => r.resume_id !== resumeId))
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error('Failed to delete resume')
    }
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
    if (bytes === 0) return '0 Bytes'
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-secondary-600">Loading resumes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Clean Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">
              My Resumes
            </h1>
            <p className="text-secondary-600">
              {resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/create')}
              className="px-5 py-2.5 bg-white border-2 border-secondary-200 text-secondary-700 rounded-lg font-medium hover:border-primary-900 hover:text-primary-900 transition-colors flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Create New
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="px-5 py-2.5 bg-primary-900 text-white rounded-lg font-medium hover:bg-primary-800 transition-colors flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Resume
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {resumes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-secondary-300">
          <div className="h-16 w-16 rounded-lg bg-secondary-100 flex items-center justify-center mx-auto">
            <FileText className="h-8 w-8 text-secondary-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-secondary-900">
            No resumes yet
          </h3>
          <p className="mt-2 text-sm text-secondary-600 max-w-md mx-auto">
            Upload your first resume or create one from scratch to get started.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => navigate('/create')}
              className="px-5 py-2.5 bg-white border-2 border-secondary-200 text-secondary-700 rounded-lg font-medium hover:border-primary-900 hover:text-primary-900 transition-colors flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Create New
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="px-5 py-2.5 bg-primary-900 text-white rounded-lg font-medium hover:bg-primary-800 transition-colors flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Resume
            </button>
          </div>
        </div>
      ) : (
        /* Resume List */
        <div className="space-y-4">
          {resumes.map((resume) => (
            <div
              key={resume.resume_id}
              className="bg-white rounded-lg border border-secondary-200 p-6 hover:border-secondary-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-6">
                {/* Left: File Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="h-12 w-12 rounded-lg bg-secondary-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-secondary-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-secondary-900 truncate mb-1">
                      {resume.original_filename}
                    </h3>

                    <div className="flex items-center gap-3 text-sm text-secondary-600">
                      <span>{formatFileSize(resume.file_size)}</span>
                      <span>•</span>
                      <span>Uploaded {formatDate(resume.uploaded_at)}</span>
                      <span>•</span>
                      {getStatusBadge(resume.status)}
                    </div>

                    {resume.latest_score !== null && resume.latest_score !== undefined && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-secondary-700">
                            ATS Score
                          </span>
                          <span className={`text-sm font-bold ${
                            resume.latest_score >= 80
                              ? 'text-success-600'
                              : resume.latest_score >= 60
                              ? 'text-warning-600'
                              : 'text-danger-600'
                          }`}>
                            {resume.latest_score}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-secondary-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              resume.latest_score >= 80
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
                      <div className="mt-3 flex items-center gap-2 text-sm text-danger-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>Processing failed. Please try uploading again.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleView(resume.resume_id)}
                    className="p-2.5 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-5 w-5 text-secondary-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(resume.resume_id, resume.original_filename)}
                    className="p-2.5 bg-secondary-50 hover:bg-danger-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5 text-secondary-600 hover:text-danger-600 transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
