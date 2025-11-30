import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'
import { Upload, FileText, X, AlertCircle, CheckCircle } from 'lucide-react'
import { resumeService } from '@/services/resume.service'
import toast from 'react-hot-toast'
import { useLoader } from '@/context/LoaderContext'

interface FileUploadProps {
  onUploadComplete?: (resumeId: string, pdfUrl: string) => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null)
  const [uploadedResumeId, setUploadedResumeId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showLoader, hideLoader } = useLoader()

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload a PDF or DOCX file.'
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`
    }

    return null
  }

  const handleFileSelect = (file: File) => {
    const error = validateFile(file)
    if (error) {
      toast.error(error)
      return
    }

    setSelectedFile(file)
    setUploadComplete(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setProgress(0)
    showLoader()

    try {
      // Direct upload through backend (avoids CORS)
      setProgress(20)
      const result = await resumeService.uploadDirect(selectedFile)

      // Complete
      setProgress(100)
      setUploadComplete(true)
      setUploadedResumeId(result.resume_id)
      setUploadedPdfUrl(result.storage_path)
      toast.success('Resume uploaded successfully!')

      // Call callback with both resumeId and pdfUrl
      if (onUploadComplete && result.storage_path) {
        onUploadComplete(result.resume_id, result.storage_path)
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload resume')
      setProgress(0)
    } finally {
      setUploading(false)
      hideLoader()
    }
  }

  // If PDF is uploaded, don't show the upload form
  if (uploadedPdfUrl && uploadedResumeId) {
    return null
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-900 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-secondary-50 dark:hover:bg-secondary-800'
          }
          ${uploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={uploading}
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-secondary-900 dark:text-white">
                Drop your resume here or click to browse
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                Supports PDF, DOC, DOCX up to 10MB
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-10 w-10 text-primary-600 dark:text-primary-400" />
              <div className="text-left">
                <p className="font-medium text-secondary-900 dark:text-white">{selectedFile.name}</p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>

            {!uploading && !uploadComplete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedFile(null)
                }}
                className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
              </button>
            )}

            {uploadComplete && (
              <CheckCircle className="h-6 w-6 text-success-600" />
            )}
          </div>
        )}

        {/* Progress Bar */}
        {uploading && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-secondary-600 dark:text-secondary-400 mb-2">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Upload Button */}
      {selectedFile && !uploading && !uploadComplete && (
        <button
          onClick={handleUpload}
          className="btn-primary w-full mt-4"
        >
          Upload Resume
        </button>
      )}

      {/* Info */}
      <div className="mt-4 flex items-start gap-2 text-sm text-secondary-600 dark:text-secondary-400">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          Your resume will be securely stored and analyzed for ATS compatibility.
          We support PDF and DOCX formats.
        </p>
      </div>
    </div>
  )
}
