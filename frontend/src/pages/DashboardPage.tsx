import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/services/auth.service'
import { resumeService } from '@/services/resume.service'
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
  const [stats, setStats] = useState({
    totalResumes: 0,
    averageScore: 0,
    recentUploads: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      if (!user) return
      
      try {
        // Verify backend connection
        await authService.getMe()
        
        // Load resume stats
        const data = await resumeService.listResumes()
        const resumes = data.resumes || []
        
        setStats({
          totalResumes: resumes.length,
          averageScore: resumes.length > 0 
            ? Math.round(resumes.reduce((sum, r) => sum + (r.latest_score || 0), 0) / resumes.length)
            : 0,
          recentUploads: resumes.filter(r => {
            if (!r.uploaded_at) return false
            const uploadDate = new Date(r.uploaded_at)
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)
            return uploadDate > weekAgo
          }).length
        })
      } catch (error: any) {
        console.error('Init error:', error)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [user])

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4 flex items-center justify-center gap-3">
            Welcome back, {user?.displayName?.split(' ')[0] || 'there'}! 
            <span className="animate-wave inline-block">👋</span>
          </h1>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto leading-relaxed">
            Create professional, ATS-optimized resumes powered by AI. Upload, create, and optimize your resume to land your dream job.
          </p>
        </div>

        {/* Stats Cards */}
        {!loading && stats.totalResumes > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 border border-secondary-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-secondary-900 mb-1">{stats.totalResumes}</div>
              <div className="text-sm text-secondary-600">Total Resumes</div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-secondary-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-secondary-900 mb-1">{stats.averageScore}%</div>
              <div className="text-sm text-secondary-600">Average ATS Score</div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-secondary-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">This week</span>
              </div>
              <div className="text-3xl font-bold text-secondary-900 mb-1">{stats.recentUploads}</div>
              <div className="text-sm text-secondary-600">Recent Uploads</div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Upload Resume */}
            <button 
              onClick={() => navigate('/upload')}
              className="group relative bg-white rounded-2xl p-8 border border-secondary-200 hover:border-primary-300 shadow-sm hover:shadow-xl transition-all duration-300 text-left overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-transparent rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-2">
                  Upload Resume
                </h3>
                <p className="text-sm text-secondary-600 leading-relaxed">
                  Upload your existing resume for AI-powered ATS analysis and scoring
                </p>
                <div className="mt-4 flex items-center text-primary-600 font-medium text-sm">
                  Get started
                  <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Create from Scratch */}
            <button 
              onClick={() => navigate('/create')}
              className="group relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 text-left overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="relative">
                <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Create from Scratch
                </h3>
                <p className="text-sm text-white/90 leading-relaxed">
                  Build a professional resume step-by-step with our guided wizard
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white font-medium text-sm">
                  <Sparkles className="h-4 w-4" />
                  Start creating
                </div>
              </div>
            </button>

            {/* My Resumes */}
            <button 
              onClick={() => navigate('/resumes')}
              className="group relative bg-white rounded-2xl p-8 border border-secondary-200 hover:border-purple-300 shadow-sm hover:shadow-xl transition-all duration-300 text-left overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-transparent rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <List className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-2">
                  My Resumes
                </h3>
                <p className="text-sm text-secondary-600 leading-relaxed">
                  View, manage, and export all your saved resumes in one place
                </p>
                <div className="mt-4 flex items-center text-purple-600 font-medium text-sm">
                  View all
                  <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Features Overview */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-4">Why Resume Maker?</h2>
            <p className="text-white/90 mb-8 text-lg">
              Our AI-powered platform helps you create resumes that pass ATS systems and impress recruiters.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">ATS Optimization</h3>
                  <p className="text-sm text-white/80">Get detailed scores and suggestions to beat applicant tracking systems</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">AI-Powered Analysis</h3>
                  <p className="text-sm text-white/80">Leverage Gemini AI for intelligent resume analysis and recommendations</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Professional Templates</h3>
                  <p className="text-sm text-white/80">Export your resume in beautiful LaTeX-generated PDF formats</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Step-by-Step Guidance</h3>
                  <p className="text-sm text-white/80">Build your resume with our intuitive wizard and expert tips</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
