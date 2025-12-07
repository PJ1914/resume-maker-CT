import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useResumes } from '@/hooks/useResumes'
import { motion } from 'framer-motion'
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
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: resumesData, isLoading: loading } = useResumes()

  const resumes = resumesData || []

  const stats = useMemo(() => {
    interface Resume {
      latest_score?: number | null
      created_at?: string
    }
    
    const scoredResumes = resumes.filter((r: Resume) => r.latest_score && r.latest_score > 0)

    return {
      totalResumes: resumes.length,
      averageScore: scoredResumes.length > 0
        ? Math.round(scoredResumes.reduce((sum: number, r: Resume) => sum + (r.latest_score || 0), 0) / scoredResumes.length)
        : 0,
      recentUploads: resumes.filter((r: Resume) => {
        if (!r.created_at) return false
        const uploadDate = new Date(r.created_at)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return uploadDate > weekAgo
      }).length
    }
  }, [resumes])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-secondary-900 dark:text-white mb-2 sm:mb-3 tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{user?.displayName?.split(' ')[0] || 'there'}</span>
          </h1>
          <p className="text-base sm:text-lg text-secondary-600 dark:text-secondary-400">
            Create professional, ATS-optimized resumes with AI
          </p>
        </motion.div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-secondary-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-secondary-100 dark:border-secondary-700">
                <div className="flex items-center gap-4 mb-2 sm:mb-3">
                  <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10"
          >
            <motion.div variants={item} className="bg-white dark:bg-secondary-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-secondary-100 dark:border-secondary-700 transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-4 mb-2 sm:mb-3">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white">{stats.totalResumes}</div>
                  <div className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 font-medium">Total Resumes</div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={item} className="bg-white dark:bg-secondary-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-secondary-100 dark:border-secondary-700 transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-4 mb-2 sm:mb-3">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                  <Award className="h-6 w-6 sm:h-7 sm:w-7 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white">{stats.averageScore}%</div>
                  <div className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 font-medium">Average ATS Score</div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={item} className="bg-white dark:bg-secondary-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-secondary-100 dark:border-secondary-700 transition-transform hover:scale-[1.02] sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-4 mb-2 sm:mb-3">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white">{stats.recentUploads}</div>
                  <div className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 font-medium">Recent (7 days)</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8 sm:mb-10"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
            Quick Actions
            <span className="text-[10px] sm:text-xs font-normal px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">Most Used</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/upload')}
              className="group bg-white dark:bg-secondary-800 rounded-2xl p-5 sm:p-8 shadow-sm border border-secondary-100 dark:border-secondary-700 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-700 transition-all text-left relative overflow-hidden"
            >
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                <Upload className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-secondary-900 dark:text-white mb-1 sm:mb-2">
                Upload Resume
              </h3>
              <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed mb-3 sm:mb-4">
                Upload existing resume for AI analysis and ATS scoring
              </p>
              <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold text-xs sm:text-sm">
                Get started
                <svg className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/resume/create')}
              className="group bg-gradient-to-br from-secondary-900 to-secondary-800 dark:from-blue-900/40 dark:to-purple-900/40 rounded-2xl p-5 sm:p-8 shadow-sm hover:shadow-lg border border-transparent dark:border-blue-500/30 transition-all text-left relative overflow-hidden sm:col-span-2 md:col-span-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-white/10 dark:bg-white/10 flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-white/20 dark:group-hover:bg-white/20 transition-colors relative z-10">
                <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 relative z-10">
                Create New Resume
              </h3>
              <p className="text-xs sm:text-sm text-secondary-200 dark:text-secondary-200 leading-relaxed mb-3 sm:mb-4 relative z-10">
                Build professional resume step-by-step with guided wizard
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 dark:bg-white/10 rounded-lg text-white font-semibold text-xs sm:text-sm hover:bg-white/30 dark:hover:bg-white/20 transition-colors relative z-10">
                Start creating
                <svg className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/resumes')}
              className="group bg-white dark:bg-secondary-800 rounded-2xl p-5 sm:p-8 shadow-sm border border-secondary-100 dark:border-secondary-700 hover:shadow-lg hover:border-green-200 dark:hover:border-green-700 transition-all text-left relative overflow-hidden"
            >
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-green-100 dark:group-hover:bg-green-900/40 transition-colors">
                <List className="h-6 w-6 sm:h-7 sm:w-7 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-secondary-900 dark:text-white mb-1 sm:mb-2">
                My Resumes
              </h3>
              <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed mb-3 sm:mb-4">
                View, manage, and export all your saved resumes
              </p>
              <div className="flex items-center text-green-600 dark:text-green-400 font-semibold text-xs sm:text-sm">
                View all
                <svg className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-800 rounded-2xl p-5 sm:p-8 shadow-sm"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 dark:text-secondary-50 mb-6 sm:mb-8">Platform Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="flex gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-secondary-900 dark:text-secondary-50 mb-1 sm:mb-2 text-sm sm:text-base">ATS Optimization</h3>
                <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed">Get detailed scores and beat applicant tracking systems</p>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-secondary-900 dark:text-secondary-50 mb-1 sm:mb-2 text-sm sm:text-base">AI-Powered Analysis</h3>
                <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed">Intelligent resume analysis with actionable recommendations</p>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-secondary-900 dark:text-secondary-50 mb-1 sm:mb-2 text-sm sm:text-base">Professional Templates</h3>
                <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed">Export in beautiful LaTeX-generated PDF formats</p>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-bold text-secondary-900 dark:text-secondary-50 mb-1 sm:mb-2 text-sm sm:text-base">Real-time Feedback</h3>
                <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed">Instant suggestions to improve your resume quality</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
