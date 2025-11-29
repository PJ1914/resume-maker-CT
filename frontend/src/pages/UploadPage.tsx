import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileUp, Lock, Zap, CheckCircle } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import PDFViewer from '@/components/PDFViewer'

export default function UploadPage() {
  const navigate = useNavigate()
  const [uploadedResumeId, setUploadedResumeId] = useState<string | null>(null)
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null)

  const handleUploadComplete = (resumeId: string, pdfUrl: string) => {
    setUploadedResumeId(resumeId)
    setUploadedPdfUrl(pdfUrl)
  }

  const handleViewResume = () => {
    if (uploadedResumeId) {
      navigate(`/resumes/${uploadedResumeId}`)
    }
  }

  const handleUploadAnother = () => {
    setUploadedResumeId(null)
    setUploadedPdfUrl(null)
  }

  // Show PDF viewer if upload is complete
  if (uploadedPdfUrl) {
    return (
      <div className="min-h-screen bg-secondary-900 flex flex-col">
        <div className="bg-secondary-800 border-b border-secondary-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">PDF Preview</h1>
            <p className="text-sm text-secondary-400 mt-1">Uploaded resume ready for editing</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleViewResume}
              className="px-4 py-2 bg-primary-900 text-white rounded-lg font-medium hover:bg-primary-800 transition-colors"
            >
              View Resume Details
            </button>
            <button
              onClick={handleUploadAnother}
              className="px-4 py-2 bg-white border border-secondary-300 text-secondary-700 rounded-lg font-medium hover:bg-secondary-50 transition-colors"
            >
              Upload Another
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <PDFViewer pdfUrl={uploadedPdfUrl} fileName={`Resume`} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/resumes')}
          className="flex items-center gap-2 text-secondary-600 hover:text-primary-600 font-medium transition-colors group mb-8"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          Back to Resumes
        </button>

        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-secondary-900 mb-3">Upload Your Resume</h1>
          <p className="text-lg text-secondary-600 max-w-2xl leading-relaxed">
            Upload your resume to unlock instant ATS compatibility analysis, detailed scoring, and AI-powered optimization recommendations.
          </p>
        </div>

        {/* Main Upload Section */}
        <div className="bg-white rounded-2xl border border-secondary-200 p-12 shadow-sm mb-12">
          <FileUpload onUploadComplete={handleUploadComplete} />
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl border border-secondary-200 p-6 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary-50 flex items-center justify-center mb-4">
              <FileUp className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-bold text-secondary-900 mb-2">Supported Formats</h3>
            <p className="text-sm text-secondary-600 leading-relaxed">
              PDF, DOC, and DOCX files. Maximum file size: 10MB
            </p>
          </div>

          <div className="bg-white rounded-xl border border-secondary-200 p-6 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-secondary-900 mb-2">Secure & Private</h3>
            <p className="text-sm text-secondary-600 leading-relaxed">
              Your data is encrypted and stored securely in Firebase
            </p>
          </div>

          <div className="bg-white rounded-xl border border-secondary-200 p-6 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-secondary-900 mb-2">Instant Analysis</h3>
            <p className="text-sm text-secondary-600 leading-relaxed">
              Get comprehensive ATS scores and recommendations in seconds
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl border border-primary-200 p-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">What Happens Next</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-primary-600 mt-0.5" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900 mb-1">Resume Parsing</h3>
                <p className="text-sm text-secondary-600">Your resume is automatically parsed to extract contact information, experience, education, and skills</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-primary-600 mt-0.5" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900 mb-1">ATS Evaluation</h3>
                <p className="text-sm text-secondary-600">Comprehensive analysis across 6 key areas: format, keywords, skills, experience, achievements, and grammar</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-primary-600 mt-0.5" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900 mb-1">Actionable Insights</h3>
                <p className="text-sm text-secondary-600">Receive detailed recommendations, improved bullet points, and strategies to improve your ATS score</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
