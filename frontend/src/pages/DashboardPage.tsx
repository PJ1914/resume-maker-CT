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
  const [lastRefresh, setLastRefresh] = useState<number>(0)

  const loadStats = async () => {
    if (!user) return
    
    try {
      // Load resume stats
      try {
        const data = await resumeService.listResumes()
        const resumes = data.resumes || []
        
        const scoredResumes = resumes.filter(r => r.latest_score && r.latest_score > 0)
        
        setStats({
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
        })
      } catch (statsError: any) {
        // Stats loading failed, but don't block the page
        console.warn('Failed to load stats (this is okay):', statsError)
        // Keep default stats
      }
    } catch (error: any) {
      console.error('Init error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [user])

  // Refresh stats every 10 seconds to catch score updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadStats()
    }, 10000)

    return () => clearInterval(interval)
  }, [user])

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
            Welcome back, {user?.displayName?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-lg text-secondary-600 max-w-2xl leading-relaxed">
            Create professional, ATS-optimized resumes powered by AI. Upload, create, and optimize your resume to land your dream job.
          </p>
        </div>

        {/* Stats Cards */}
        {!loading && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 border border-secondary-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary-50 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-secondary-900 mb-1">{stats.totalResumes}</div>
              <div className="text-sm text-secondary-600 font-medium">Total Resumes</div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-secondary-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-secondary-900 mb-1">{stats.averageScore}%</div>
              <div className="text-sm text-secondary-600 font-medium">Average ATS Score</div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-secondary-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-secondary-900 mb-1">{stats.recentUploads}</div>
              <div className="text-sm text-secondary-600 font-medium">Recent Uploads</div>
              <div className="text-xs text-secondary-500 mt-1">Last 7 days</div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Upload Resume */}
            <button 
              onClick={() => navigate('/upload')}
              className="group bg-white rounded-xl p-6 border border-secondary-200 hover:border-primary-500 hover:shadow-lg transition-all text-left"
            >
              <div className="h-12 w-12 rounded-lg bg-primary-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                <Upload className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-bold text-secondary-900 mb-2">
                Upload Resume
              </h3>
              <p className="text-sm text-secondary-600 leading-relaxed mb-4">
                Upload your existing resume for AI-powered ATS analysis and scoring
              </p>
              <div className="flex items-center text-primary-600 font-medium text-sm">
                Get started
                <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Create from Scratch */}
            <button 
              onClick={() => {
                console.log('Create New Resume clicked')
                navigate('/resume/create')
              }}
              className="group bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-6 hover:shadow-lg transition-all text-left"
            >
              <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Create from Scratch
              </h3>
              <p className="text-sm text-white/90 leading-relaxed mb-4">
                Build a professional resume step-by-step with our guided wizard
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-lg text-white font-medium text-sm">
                Start creating
                <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* My Resumes */}
            <button 
              onClick={() => navigate('/resumes')}
              className="group bg-white rounded-xl p-6 border border-secondary-200 hover:border-secondary-400 hover:shadow-lg transition-all text-left"
            >
              <div className="h-12 w-12 rounded-lg bg-secondary-50 flex items-center justify-center mb-4 group-hover:bg-secondary-100 transition-colors">
                <List className="h-6 w-6 text-secondary-700" />
              </div>
              <h3 className="text-lg font-bold text-secondary-900 mb-2">
                My Resumes
              </h3>
              <p className="text-sm text-secondary-600 leading-relaxed mb-4">
                View, manage, and export all your saved resumes in one place
              </p>
              <div className="flex items-center text-secondary-700 font-medium text-sm">
                View all
                <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Features Overview */}
        <div className="bg-white border border-secondary-200 rounded-xl p-8 md:p-10">
          <h2 className="text-2xl font-bold text-secondary-900 mb-3">Why Choose Resume Maker</h2>
          <p className="text-secondary-600 mb-8 leading-relaxed">
            Our AI-powered platform helps you create resumes that pass ATS systems and impress recruiters.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900 mb-1">ATS Optimization</h3>
                <p className="text-sm text-secondary-600 leading-relaxed">Get detailed scores and suggestions to beat applicant tracking systems</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900 mb-1">AI-Powered Analysis</h3>
                <p className="text-sm text-secondary-600 leading-relaxed">Leverage Gemini AI for intelligent resume analysis and recommendations</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900 mb-1">Professional Templates</h3>
                <p className="text-sm text-secondary-600 leading-relaxed">Export your resume in beautiful LaTeX-generated PDF formats</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Award className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900 mb-1">Step-by-Step Guidance</h3>
                <p className="text-sm text-secondary-600 leading-relaxed">Build your resume with our intuitive wizard and expert tips</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
