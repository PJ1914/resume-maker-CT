import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileUp, Lock, Zap, CheckCircle } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import { useLoader } from '@/context/LoaderContext'
import { resumeService } from '@/services/resume.service'
import { getResume } from '@/services/resume-editor.service'
import { useAuth } from '@/context/AuthContext'

export default function UploadPage() {
  const navigate = useNavigate()
  const { showLoader, hideLoader } = useLoader()

  const { user } = useAuth();

  const handleUploadComplete = async (resumeId: string) => {
    // Show loader during transition to detail page
    showLoader()

    // Create initial version
    try {
      if (user) {
        // Need to fetch data first or just rely on backend? 
        // The upload creates the resume document. 
        // We can create a baseline version here.
        // Since we might not have the JSON yet (parsing happens async), 
        // we'll just create a placeholder version or fetch what we have.
        // Actually, best to do this after parsing is done, but "Upload" is a good checkpoint.
        // Let's try to fetch what exists (metadata).
        const data = await getResume(user.uid, resumeId);
        if (data) {
          await resumeService.createVersion(resumeId, {
            resume_json: data,
            job_role: "Original File",
            company: "Upload"
          });
        }
      }
    } catch (e) {
      console.error("Failed to create upload version", e);
    }

    // Redirect to resume detail page after successful upload
    setTimeout(() => {
      navigate(`/resumes/${resumeId}`)
      setTimeout(() => hideLoader(), 2000)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/resumes')}
          className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400 hover:text-primary-900 dark:hover:text-primary-400 font-medium transition-colors group mb-6 sm:mb-8 text-sm sm:text-base"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 group-hover:-translate-x-1 transition-transform" />
          Back to Resumes
        </button>

        {/* Header Section */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-bold text-secondary-900 dark:text-white mb-2 sm:mb-3">Upload Your Resume</h1>
          <p className="text-base sm:text-lg text-secondary-600 dark:text-secondary-400 max-w-2xl leading-relaxed">
            Upload your resume to unlock instant ATS compatibility analysis, detailed scoring, and AI-powered optimization recommendations.
          </p>
        </div>

        {/* Main Upload Section */}
        <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-6 sm:p-12 shadow-sm mb-8 sm:mb-12">
          <FileUpload onUploadComplete={handleUploadComplete} />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-800 p-5 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center mb-3 sm:mb-4">
              <FileUp className="h-5 w-5 sm:h-6 sm:w-6 text-secondary-700 dark:text-secondary-300" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-secondary-900 dark:text-white mb-1 sm:mb-2">Supported Formats</h3>
            <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed">
              PDF, DOC, and DOCX files. Maximum file size: 10MB
            </p>
          </div>

          <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-800 p-5 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center mb-3 sm:mb-4">
              <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-secondary-700 dark:text-secondary-300" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-secondary-900 dark:text-white mb-1 sm:mb-2">Secure & Private</h3>
            <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed">
              Your data is encrypted and stored securely in Firebase
            </p>
          </div>

          <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-800 p-5 sm:p-6 hover:shadow-lg transition-shadow sm:col-span-2 md:col-span-1">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center mb-3 sm:mb-4">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-secondary-700 dark:text-secondary-300" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-secondary-900 dark:text-white mb-1 sm:mb-2">Instant Analysis</h3>
            <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed">
              Get comprehensive ATS scores and recommendations in seconds
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-secondary-100 dark:bg-secondary-800 rounded-2xl border border-secondary-300 dark:border-secondary-700 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 dark:text-white mb-4 sm:mb-6">What Happens Next</h2>
          <div className="space-y-4">
            <div className="flex gap-3 sm:gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary-900 dark:text-primary-400 mt-0.5" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900 dark:text-white mb-1 text-sm sm:text-base">Resume Parsing</h3>
                <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400">Your resume is automatically parsed to extract contact information, experience, education, and skills</p>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary-900 dark:text-primary-400 mt-0.5" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900 dark:text-white mb-1 text-sm sm:text-base">ATS Evaluation</h3>
                <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400">Comprehensive analysis across 6 key areas: format, keywords, skills, experience, achievements, and grammar</p>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary-900 dark:text-primary-400 mt-0.5" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900 dark:text-white mb-1 text-sm sm:text-base">Actionable Insights</h3>
                <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400">Receive detailed recommendations, improved bullet points, and strategies to improve your ATS score</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
