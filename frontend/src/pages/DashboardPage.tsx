import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useResumes } from '@/hooks/useResumes'
import { 
  FileText, 
  Upload, 
  Sparkles, 
  List,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: resumesData, isLoading: loading } = useResumes()

  const resumes = resumesData || []

  const stats = useMemo(() => {
    const scoredResumes = resumes.filter(r => r.latest_score && r.latest_score > 0)
    
    return {
      totalResumes: resumes.length,
      averageScore: scoredResumes.length > 0 
        ? Math.round(scoredResumes.reduce((sum, r) => sum + (r.latest_score || 0), 0) / scoredResumes.length)
        : 0,
      recentUploads: resumes.filter(r => {
        if (!r.created_at) return false
        const uploadDate = new Date(r.created_at)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return uploadDate > weekAgo
      }).length
    }
  }, [resumes])

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Welcome back, {user?.displayName?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-lg text-gray-600">
            Create professional, ATS-optimized resumes with AI
          </p>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-3">
                <div className="h-14 w-14 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FileText className="h-7 w-7 text-blue-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalResumes}</div>
                  <div className="text-sm text-gray-600 font-medium">Total Resumes</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-3">
                <div className="h-14 w-14 rounded-xl bg-green-50 flex items-center justify-center">
                  <Award className="h-7 w-7 text-green-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{stats.averageScore}%</div>
                  <div className="text-sm text-gray-600 font-medium">Average ATS Score</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-3">
                <div className="h-14 w-14 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Clock className="h-7 w-7 text-purple-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{stats.recentUploads}</div>
                  <div className="text-sm text-gray-600 font-medium">Recent (7 days)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={() => navigate('/upload')}
              className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all text-left"
            >
              <div className="h-14 w-14 rounded-xl bg-blue-50 flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors">
                <Upload className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Upload Resume
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Upload existing resume for AI analysis and ATS scoring
              </p>
              <div className="flex items-center text-blue-600 font-semibold text-sm">
                Get started
                <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            <button 
              onClick={() => navigate('/resume/create')}
              className="group bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all text-left"
            >
              <div className="h-14 w-14 rounded-xl bg-white/10 flex items-center justify-center mb-5 group-hover:bg-white/20 transition-colors">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Create New Resume
              </h3>
              <p className="text-sm text-gray-200 leading-relaxed mb-4">
                Build professional resume step-by-step with guided wizard
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg text-white font-semibold text-sm hover:bg-white/30 transition-colors">
                Start creating
                <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            <button 
              onClick={() => navigate('/resumes')}
              className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-green-200 transition-all text-left"
            >
              <div className="h-14 w-14 rounded-xl bg-green-50 flex items-center justify-center mb-5 group-hover:bg-green-100 transition-colors">
                <List className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                My Resumes
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                View, manage, and export all your saved resumes
              </p>
              <div className="flex items-center text-green-600 font-semibold text-sm">
                View all
                <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">ATS Optimization</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Get detailed scores and beat applicant tracking systems</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">AI-Powered Analysis</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Intelligent resume analysis with actionable recommendations</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Professional Templates</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Export in beautiful LaTeX-generated PDF formats</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Real-time Feedback</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Instant suggestions to improve your resume quality</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
