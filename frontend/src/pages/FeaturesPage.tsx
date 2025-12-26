import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Brain,
  Activity,
  BarChart3,
  Upload,
  Zap,
  CheckCircle,
  Shield,
  Sparkles,
  RefreshCw,
  Github,
  Mic,
  Layout
} from 'lucide-react'
import PublicLayout from '../components/layouts/PublicLayout'
import { SEO } from '../components/SEO'

export default function FeaturesPage() {
  const navigate = useNavigate()

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Resume Parser',
      description: 'Upload your existing resume and let AI extract and optimize your information automatically.',
      details: [
        'PDF, DOCX, TXT support',
        'Intelligent data extraction',
        'Auto-formatting',
        'Smart section detection',
      ],
    },
    {
      icon: Activity,
      title: 'Real-Time ATS Scoring',
      description: 'Get instant feedback on how well your resume will perform with Applicant Tracking Systems.',
      details: [
        'Score out of 100',
        'Detailed recommendations',
        'Keyword optimization',
        'Format compatibility check',
      ],
    },
    {
      icon: Sparkles,
      title: 'Professional LaTeX Templates',
      description: '6+ ATS-optimized templates with pixel-perfect formatting and modern designs.',
      details: [
        'Modern, Classic, Technical styles',
        'Fully customizable',
        'Industry-specific layouts',
        'Print-ready output',
      ],
    },
    {
      icon: FileText,
      title: 'Smart Resume Editor',
      description: 'Intuitive editor with real-time preview and AI-powered content suggestions.',
      details: [
        'Live preview',
        'AI content enhancement',
        'Section management',
        'Auto-save functionality',
      ],
    },
    {
      icon: RefreshCw,
      title: 'Version Control',
      description: 'Create unlimited resume versions tailored for different job applications.',
      details: [
        'Unlimited versions',
        'Version history',
        'Easy duplication',
        'Compare changes',
      ],
    },
    {
      icon: Upload,
      title: 'High-Quality PDF Export',
      description: 'Download professional PDFs optimized for both ATS systems and human readers.',
      details: [
        'ATS-friendly format',
        'High-resolution output',
        'Consistent formatting',
        'Print-ready quality',
      ],
    },
    {
      icon: Github,
      title: 'GitHub Integration',
      description: 'Connect your GitHub account to showcase your projects and contributions.',
      details: [
        'OAuth authentication',
        'Project imports',
        'Contribution stats',
        'Repository linking',
      ],
    },
    {
      icon: Mic,
      title: 'AI Interview Prep',
      description: 'Practice interviews with AI-powered voice and text coaching.',
      details: [
        'Voice interview simulation',
        'Real-time feedback',
        'Common questions bank',
        'Performance analytics',
      ],
    },
    {
      icon: Layout,
      title: 'Portfolio Builder',
      description: 'Transform your resume into a professional portfolio website.',
      details: [
        'One-click conversion',
        'Responsive design',
        'Custom domains',
        'SEO optimized',
      ],
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Enterprise-grade security with Firebase authentication and encrypted storage.',
      details: [
        'Firebase Auth (Google, GitHub, Email)',
        'Encrypted data storage',
        'Private by default',
        'No data sharing',
      ],
    },
    {
      icon: Zap,
      title: 'Credit System',
      description: 'Flexible credit-based pricing for AI features with packages that never expire.',
      details: [
        'Pay-as-you-go model',
        'Credits never expire',
        'Transparent pricing',
        'Free credits to start',
      ],
    },
    {
      icon: BarChart3,
      title: 'Resume Analytics',
      description: 'Track your resume performance and get insights on improvements.',
      details: [
        'ATS score tracking',
        'Improvement suggestions',
        'Version comparisons',
        'Export history',
      ],
    },
  ]

  return (
    <>
      <SEO
        title="Features - Prativeda | AI Resume Builder & ATS Scoring"
        description="Discover Prativeda's powerful features: AI resume parsing, ATS scoring, LaTeX templates, GitHub integration, interview prep, and portfolio builder."
        keywords="resume features, ATS scoring, LaTeX resume, resume parser, AI resume, GitHub integration, interview prep, portfolio builder"
        url="https://prativeda.codetapasya.com/features"
      />
      <PublicLayout>
        {/* Hero Section */}
        <section className="relative pt-24 sm:pt-32 md:pt-40 pb-12 sm:pb-20 px-4 sm:px-6">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12 sm:mb-20"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight text-secondary-900 dark:text-white">
                Powerful Features for
                <br className="hidden sm:block" />
                <span className="sm:inline block mt-2 sm:mt-0">Your Career Success</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-secondary-600 dark:text-white/60 max-w-3xl mx-auto font-light">
                Everything you need to create, optimize, and showcase your professional profile.
              </p>
            </motion.div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-white dark:bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-secondary-200 dark:border-white/10 hover:border-secondary-300 dark:hover:border-white/20 hover:bg-secondary-50 dark:hover:bg-white/10 transition-all duration-300 shadow-lg dark:shadow-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary-100/50 dark:from-white/5 via-transparent to-transparent rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative">
                    <div className="p-3 bg-secondary-900 dark:bg-white rounded-lg mb-4 sm:mb-6 w-fit group-hover:shadow-[0_0_30px_rgba(0,0,0,0.2)] dark:group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-shadow">
                      <feature.icon className="h-6 w-6 text-white dark:text-black" />
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold mb-3 text-secondary-900 dark:text-white">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-secondary-600 dark:text-white/60 mb-6 leading-relaxed">{feature.description}</p>

                    <ul className="space-y-2">
                      {feature.details.map((detail, i) => (
                        <li key={i} className="flex items-center gap-2 text-secondary-700 dark:text-white/70 text-sm">
                          <CheckCircle className="h-4 w-4 flex-shrink-0 text-secondary-900 dark:text-white" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="mt-16 sm:mt-20 text-center"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-secondary-900 dark:text-white">Ready to Get Started?</h2>
              <p className="text-base sm:text-lg text-secondary-600 dark:text-white/60 mb-8 max-w-2xl mx-auto">
                Join thousands of professionals who have transformed their resumes with Prativeda.
              </p>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(255,255,255,0.5)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="group relative px-8 py-4 sm:px-12 sm:py-5 bg-secondary-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg overflow-hidden w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-secondary-800 dark:bg-white blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <span className="relative z-10">Create Your Resume Free</span>
              </motion.button>
            </motion.div>
          </div>
        </section>
      </PublicLayout>
    </>
  )
}
