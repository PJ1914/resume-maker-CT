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
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10"
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="relative h-10 w-10 bg-white rounded-lg flex items-center justify-center group">
                <div className="absolute inset-0 bg-white blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <FileText className="h-6 w-6 text-black relative z-10" />
              </div>
              <span className="text-xl font-bold tracking-tight">prativeda</span>
            </motion.div>

            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 border border-white/20 rounded-lg font-semibold hover:bg-white/5 transition-colors backdrop-blur-xl text-sm sm:text-base"
              >
                Sign In
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="relative px-6 py-2.5 bg-white text-black rounded-lg font-semibold overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <span className="relative z-10">Get Started</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16 sm:mb-20"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              Powerful Features for
              <br />
              Your Career Success
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/60 max-w-3xl mx-auto font-light">
              Everything you need to create, optimize, and track your resume journey.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative">
                  <div className="p-3 bg-white rounded-lg mb-6 w-fit group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-shadow">
                    <feature.icon className="h-6 w-6 text-black" />
                  </div>

                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-white/60 mb-6 leading-relaxed">{feature.description}</p>

                  <ul className="space-y-2">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-2 text-white/70 text-sm">
                        <CheckCircle className="h-4 w-4 flex-shrink-0" />
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
            className="mt-20 text-center"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-base sm:text-lg text-white/60 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have transformed their resumes with prativeda.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(255,255,255,0.5)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="group relative px-12 py-5 bg-white text-black rounded-xl font-bold text-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-white blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <span className="relative z-10">Create Your Resume Free</span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-white/10 mt-20">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-white rounded-md flex items-center justify-center">
                <FileText className="h-5 w-5 text-black" />
              </div>
              <span className="font-semibold">prativeda</span>
            </div>
            <div className="text-white/50 text-sm">© 2025 prativeda. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
