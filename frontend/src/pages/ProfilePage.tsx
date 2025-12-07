import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { apiClient } from '@/services/api'
import { motion } from 'framer-motion'
import {
  MapPin,
  Shield,
  Crown,
  Settings,
  Edit3,
  ArrowRight,
  Star,
  Briefcase,
  Code,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getAvatar } from '@/components/ui/avatars'

export default function ProfilePage() {
  const { user, isAdmin } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalResumes: 0,
    averageScore: 0,
    lastActivity: null as string | null
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get<{
        email: string
        uid: string
        is_admin: boolean
        is_premium: boolean
        credits?: number
      }>('/me')
      setProfile(data)

      // Fetch user stats
      const resumesData = await apiClient.get<{ resumes: any[], total: number }>('/api/resumes?limit=100')
      const resumes = resumesData.resumes || []
      const scores = resumes.filter(r => r.latest_score).map(r => r.latest_score)
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

      setStats({
        totalResumes: resumes.length,
        averageScore: Math.round(avgScore),
        lastActivity: resumes.length > 0 ? resumes[0].created_at : null
      })
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-950 dark:to-secondary-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side - Main Profile Skeleton */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-secondary-800 rounded-3xl shadow-xl overflow-hidden animate-pulse">
                {/* Header Skeleton */}
                <div className="h-32 sm:h-40 bg-secondary-300 dark:bg-secondary-700"></div>
                
                {/* Profile Content Skeleton */}
                <div className="px-6 sm:px-8 pb-8 -mt-16">
                  {/* Avatar Skeleton */}
                  <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-secondary-300 dark:bg-secondary-700 border-4 border-white dark:border-secondary-800"></div>
                  
                  {/* Info Skeleton */}
                  <div className="mt-8 space-y-3">
                    <div className="h-8 w-48 bg-secondary-300 dark:bg-secondary-700 rounded"></div>
                    <div className="h-4 w-32 bg-secondary-200 dark:bg-secondary-700 rounded"></div>
                    <div className="h-4 w-40 bg-secondary-200 dark:bg-secondary-700 rounded"></div>
                  </div>
                  
                  {/* Buttons Skeleton */}
                  <div className="flex gap-3 pt-6">
                    <div className="h-10 w-32 bg-secondary-300 dark:bg-secondary-700 rounded-xl"></div>
                    <div className="h-10 w-32 bg-secondary-300 dark:bg-secondary-700 rounded-xl"></div>
                  </div>
                  
                  {/* Stats Skeleton */}
                  <div className="grid grid-cols-3 gap-3 pt-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-secondary-100 dark:bg-secondary-700 rounded-2xl p-4 space-y-2">
                        <div className="h-4 w-24 bg-secondary-200 dark:bg-secondary-600 rounded"></div>
                        <div className="h-6 w-16 bg-secondary-200 dark:bg-secondary-600 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Side Skeleton */}
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white dark:bg-secondary-800 rounded-2xl p-6 animate-pulse">
                  <div className="h-6 w-32 bg-secondary-300 dark:bg-secondary-700 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-full"></div>
                    <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const AvatarComponent = getAvatar(user?.email || 'default')
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User'

  // Skills/Technologies (you can make this dynamic later)
  const skills = ['HTML', 'CSS', 'Dart', 'C++', 'UI Design']

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-950 dark:to-secondary-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Main Profile Card */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-secondary-800 rounded-3xl shadow-xl overflow-hidden"
            >
              {/* Rainbow Gradient Header */}
              <div className="h-32 sm:h-40 bg-gradient-to-r from-orange-400 via-pink-400 via-purple-400 via-blue-400 via-cyan-400 to-emerald-400 relative">
                <button className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                  <Edit3 className="h-4 w-4 text-white" />
                </button>
              </div>

              {/* Profile Content */}
              <div className="px-6 sm:px-8 pb-8 -mt-16">
                {/* Avatar */}
                <div className="relative inline-block">
                  <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full border-4 border-white dark:border-secondary-800 overflow-hidden bg-white shadow-xl">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <AvatarComponent className="h-full w-full" />
                    )}
                  </div>
                </div>

                {/* User Info */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white">
                        {displayName}
                      </h1>
                      <p className="text-secondary-600 dark:text-secondary-400 mt-1">
                        {profile?.is_premium ? 'Premium User' : 'Free User'}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-secondary-500 dark:text-secondary-400">
                        <MapPin className="h-4 w-4" />
                        <span>{user?.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button className="px-6 py-2.5 bg-secondary-900 dark:bg-white text-white dark:text-secondary-900 rounded-xl font-semibold hover:scale-105 transition-transform">
                      Edit Profile
                    </button>
                    <button className="px-6 py-2.5 bg-white dark:bg-secondary-700 border-2 border-secondary-200 dark:border-secondary-600 text-secondary-900 dark:text-white rounded-xl font-semibold hover:scale-105 transition-transform">
                      Settings
                    </button>
                  </div>

                  {/* Stats Cards Row */}
                  <div className="grid grid-cols-3 gap-3 pt-6">
                    {/* Ready for work */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-4 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-secondary-900 dark:text-white">Ready for work</h3>
                        <div className="p-2 bg-blue-500 rounded-full group-hover:scale-110 transition-transform">
                          <ArrowRight className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <p className="text-xs text-secondary-600 dark:text-secondary-400 leading-relaxed">
                        Show recruiters that you're ready for work.
                      </p>
                    </motion.div>

                    {/* Share posts */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-4 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-secondary-900 dark:text-white">Share posts</h3>
                        <div className="p-2 bg-purple-500 rounded-full group-hover:scale-110 transition-transform">
                          <ArrowRight className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <p className="text-xs text-secondary-600 dark:text-secondary-400 leading-relaxed">
                        Share latest news to get connected with others.
                      </p>
                    </motion.div>

                    {/* Update */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-2xl p-4 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-secondary-900 dark:text-white">Update</h3>
                        <div className="p-2 bg-cyan-500 rounded-full group-hover:scale-110 transition-transform">
                          <ArrowRight className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <p className="text-xs text-secondary-600 dark:text-secondary-400 leading-relaxed">
                        Keep your profile updated so that recruiters know you better.
                      </p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Info Cards */}
          <div className="space-y-6">
            {/* Current Role Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-secondary-800 rounded-3xl shadow-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-secondary-600 dark:text-secondary-400 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Current role
                </h3>
              </div>
              <p className="text-lg font-bold text-secondary-900 dark:text-white">
                {profile?.is_premium ? 'Premium User' : 'Free Tier User'}
              </p>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                {isAdmin && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                    <Shield className="h-3 w-3" />
                    ADMIN
                  </span>
                )}
                {profile?.is_premium && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
                    <Crown className="h-3 w-3" />
                    PREMIUM
                  </span>
                )}
              </div>
            </motion.div>

            {/* Skills Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-secondary-800 rounded-3xl shadow-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-secondary-600 dark:text-secondary-400 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Skills
                </h3>
                <Star className="h-4 w-4 text-secondary-400" />
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-secondary-100 dark:bg-secondary-700 text-secondary-900 dark:text-white text-sm font-medium rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-secondary-800 rounded-3xl shadow-xl p-6"
            >
              <h3 className="text-sm font-semibold text-secondary-600 dark:text-secondary-400 mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">Total Resumes</span>
                  <span className="text-2xl font-bold text-secondary-900 dark:text-white">{stats.totalResumes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">Avg ATS Score</span>
                  <span className="text-2xl font-bold text-secondary-900 dark:text-white">{stats.averageScore}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">Resume Limit</span>
                  <span className="text-2xl font-bold text-secondary-900 dark:text-white">
                    {stats.totalResumes}/{profile?.is_premium ? '∞' : '2'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Upgrade Card for Free Users */}
            {!profile?.is_premium && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-3xl shadow-xl p-6 text-white"
              >
                <Crown className="h-10 w-10 mb-3" />
                <h3 className="text-xl font-bold mb-2">Upgrade to Premium</h3>
                <p className="text-sm text-white/90 mb-4">
                  Unlock unlimited resumes and advanced features
                </p>
                <button className="w-full px-4 py-2.5 bg-white text-orange-600 rounded-xl font-bold hover:scale-105 transition-transform">
                  Upgrade Now
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
