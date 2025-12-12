import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Brain,
  Activity,
  BarChart3,
  Layers,
  Zap,
  CheckCircle,
  Shield,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Code2,
} from 'lucide-react'
import PublicLayout from '../components/layouts/PublicLayout'
import { SEO } from '../components/SEO'

export default function FeaturesPage() {
  const navigate = useNavigate()

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Intelligence',
      description: 'Neural network analysis optimizes every word for maximum impact.',
      details: [
        'Smart content suggestions',
        'Industry-specific keywords',
        'Action verb recommendations',
        'Tone and style optimization',
      ],
    },
    {
      icon: Activity,
      title: 'Real-Time ATS Scoring',
      description: 'Live feedback shows exactly how recruiters will see your resume.',
      details: [
        'Instant compatibility check',
        'Format validation',
        'Keyword density analysis',
        'Pass rate prediction',
      ],
    },
    {
      icon: BarChart3,
      title: 'Data-Driven Insights',
      description: 'Advanced analytics reveal what makes top-performing resumes stand out.',
      details: [
        'Industry benchmarks',
        'Success rate tracking',
        'Competitor analysis',
        'Performance metrics',
      ],
    },
    {
      icon: Layers,
      title: 'Enterprise-Grade Output',
      description: 'LaTeX rendering produces pixel-perfect, professional documents.',
      details: [
        'Multiple export formats',
        'High-quality PDF output',
        'Print-ready layouts',
        'Custom branding options',
      ],
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Generate and update resumes in seconds, not hours.',
      details: [
        'Real-time preview',
        'Auto-save functionality',
        'Quick template switching',
        'Instant PDF generation',
      ],
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Enterprise-grade security protects your personal information.',
      details: [
        'End-to-end encryption',
        'Firebase security',
        'GDPR compliant',
        'No data sharing',
      ],
    },
    {
      icon: Sparkles,
      title: 'Smart Templates',
      description: '6+ professional LaTeX templates designed by industry experts.',
      details: [
        'ATS-optimized layouts',
        'Modern designs',
        'Fully customizable',
        'Industry-specific options',
      ],
    },
    {
      icon: RefreshCw,
      title: 'Version Control',
      description: 'Track changes and maintain multiple resume versions effortlessly.',
      details: [
        'Unlimited versions',
        'Change history',
        'Easy rollback',
        'Compare versions',
      ],
    },
    {
      icon: TrendingUp,
      title: 'Career Analytics',
      description: 'Track your job search progress with detailed insights.',
      details: [
        'Application tracking',
        'Response rate analysis',
        'Interview conversion',
        'Success predictions',
      ],
    },
    {
      icon: Code2,
      title: 'Developer Tools',
      description: 'Advanced features for tech professionals.',
      details: [
        'GitHub integration',
        'Project showcase',
        'Skills visualization',
        'Code snippets support',
      ],
    },
  ]

  return (
    <>
      <SEO
        title="Features - Prativeda | AI Resume Builder & ATS Scoring"
        description="Discover Prativeda's powerful features: AI resume parsing, ATS scoring, portfolio templates, LaTeX export, and more to boost your job search."
        keywords="resume features, ATS scoring, portfolio templates, LaTeX resume, resume parser, AI resume"
        url="https://prativeda.codetapasya.com/features"
      />
      <SEO
        title="Features - Prativeda | Professional Resume Builder"
        description="Explore Prativeda's powerful features for ATS-optimized resumes, portfolio generation, and career tools."
        keywords="resume features, ATS optimization, portfolio builder, career tools"
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
                Everything you need to create, optimize, and track your resume journey.
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
                Join thousands of professionals who have transformed their resumes with prativeda.
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
