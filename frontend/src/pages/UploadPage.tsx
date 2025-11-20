import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import FileUpload from '@/components/FileUpload'

export default function UploadPage() {
  const navigate = useNavigate()

  const handleUploadComplete = (resumeId: string) => {
    // Redirect to resume detail page after successful upload
    setTimeout(() => {
      navigate(`/resumes/${resumeId}`)
    }, 1500)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/resumes')}
        className="flex items-center gap-2 text-secondary-600 hover:text-primary-600 font-medium transition-colors group"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        Back to Resumes
      </button>

      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMTEtMS43ODktNC00LTRzLTQgMS43ODktNCA0IDEuNzg5IDQgNCA0IDQtMS43ODkgNC00em0wIDI4YzAtMi4yMTEtMS43ODktNC00LTRzLTQgMS43ODktNCA0IDEuNzg5IDQgNCA0IDQtMS43ODkgNC00ek00IDI4YzAtMi4yMTEtMS43ODktNC00LTRzLTQgMS43ODktNCA0IDEuNzg5IDQgNCA0IDQtMS43ODkgNC00em0zMiAwYzAtMi4yMTEtMS43ODktNC00LTRzLTQgMS43ODktNCA0IDEuNzg5IDQgNCA0IDQtMS43ODkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm mb-4 shadow-lg">
            <span className="text-4xl">📤</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Upload Resume</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
            Upload your resume to get instant ATS compatibility analysis and AI-powered optimization suggestions.
          </p>
        </div>
      </div>

      {/* Upload Component */}
      <div className="bg-white rounded-2xl border-2 border-secondary-200 p-8 shadow-lg">
        <FileUpload onUploadComplete={handleUploadComplete} />
      </div>

      {/* Info Cards with enhanced styling */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="group bg-white rounded-xl border-2 border-secondary-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
            <span className="text-3xl">📄</span>
          </div>
          <h3 className="text-lg font-bold text-secondary-900 mb-2">Supported Formats</h3>
          <p className="text-sm text-secondary-600 leading-relaxed">
            PDF, DOC, and DOCX files up to 10MB
          </p>
        </div>

        <div className="group bg-white rounded-xl border-2 border-secondary-200 p-6 hover:shadow-xl hover:border-success-300 transition-all duration-300 transform hover:-translate-y-1">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center mb-4 shadow-lg shadow-success-500/30 group-hover:scale-110 transition-transform">
            <span className="text-3xl">🔒</span>
          </div>
          <h3 className="text-lg font-bold text-secondary-900 mb-2">Secure Storage</h3>
          <p className="text-sm text-secondary-600 leading-relaxed">
            Your data is encrypted and stored securely
          </p>
        </div>

        <div className="group bg-white rounded-xl border-2 border-secondary-200 p-6 hover:shadow-xl hover:border-warning-300 transition-all duration-300 transform hover:-translate-y-1">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-warning-400 to-warning-600 flex items-center justify-center mb-4 shadow-lg shadow-warning-500/30 group-hover:scale-110 transition-transform">
            <span className="text-3xl">⚡</span>
          </div>
          <h3 className="text-lg font-bold text-secondary-900 mb-2">Instant Analysis</h3>
          <p className="text-sm text-secondary-600 leading-relaxed">
            Get ATS scores and suggestions in seconds
          </p>
        </div>
      </div>
    </div>
  )
}
