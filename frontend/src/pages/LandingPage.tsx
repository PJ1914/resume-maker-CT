import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import PublicLayout from '../components/layouts/PublicLayout'
import { useEffect, useState } from 'react'
import {
  Sparkles,
  FileText,
  Zap,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Star,
  Download,
  RefreshCw,
  Upload,
  ArrowUpRight,
  Brain,
  Activity,
  BarChart3,
  Layers,
  Wand2,
  Shield,
  Workflow,
  Code2,
  Palette,
  Lock,
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, 50])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Intelligence',
      description: 'Neural network analysis optimizes every word for maximum impact.',
      number: '01',
    },
    {
      icon: Activity,
      title: 'Real-Time ATS Scoring',
      description: 'Live feedback shows exactly how recruiters will see your resume.',
      number: '02',
    },
    {
      icon: BarChart3,
      title: 'Data-Driven Insights',
      description: 'Advanced analytics reveal what makes top-performing resumes stand out.',
      number: '03',
    },
    {
      icon: Layers,
      title: 'Enterprise-Grade Output',
      description: 'LaTeX rendering produces pixel-perfect, professional documents.',
      number: '04',
    },
  ]

  const stats = [
    { value: '10,000+', label: 'Resumes Built' },
    { value: '95%', label: 'ATS Pass Rate' },
    { value: '92%', label: 'Avg Score' },
    { value: '<2min', label: 'Build Time' },
  ]

  return (
    <PublicLayout>



      {/* Hero Section - Futuristic 3D */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 min-h-screen flex items-center">
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ opacity }}
              className="flex flex-col items-center text-center lg:items-start lg:text-left"
            >
              {/* Status Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-4 sm:py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-4 sm:mb-8"
              >
                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-white" />
                </span>
                <span className="text-[10px] sm:text-sm font-medium text-white/90 tracking-wide">AI Resume Wizard • ATS Analysis</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 leading-[1.0] sm:leading-[0.95] tracking-tighter"
              >
                Build ATS-Perfect
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10">Resumes</span>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="absolute bottom-1 sm:bottom-2 left-0 right-0 h-2 sm:h-3 bg-white/20 -z-0"
                  />
                </span>
                <br />
                with AI
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-base sm:text-xl text-white/60 mb-6 sm:mb-8 leading-relaxed max-w-xl font-light"
              >
                Score Higher. Get Noticed. Get Hired.
                <br />
                Neural-powered optimization for the modern job market.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12 w-full sm:w-auto"
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255,255,255,0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className="group relative px-6 py-3 sm:px-8 sm:py-4 bg-white text-black rounded-lg font-bold overflow-hidden w-full sm:w-auto"
                >
                  <div className="absolute inset-0 bg-white blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Start Building Free
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 sm:px-8 sm:py-4 border border-white/20 rounded-lg font-semibold hover:bg-white/5 transition-colors backdrop-blur-xl w-full sm:w-auto"
                >
                  Watch Demo
                </motion.button>
              </motion.div>

              {/* Stats Row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-8 pt-8 border-t border-white/10"
              >
                <div>
                  <div className="text-3xl font-bold mb-1">10,000+</div>
                  <div className="text-sm text-white/50">Resumes Created</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">95%</div>
                  <div className="text-sm text-white/50">ATS Pass Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">4.9/5</div>
                  <div className="text-sm text-white/50">User Rating</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right - 3D Floating Elements */}
            <motion.div
              style={{
                x: mousePosition.x,
                y: mousePosition.y,
              }}
              className="relative hidden lg:block h-[600px]"
            >
              {/* Main Dashboard Panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ delay: 0.4, duration: 1 }}
                style={{ y: y1 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px]"
              >
                <div className="relative bg-white/5 backdrop-blur-2xl rounded-2xl p-8 border border-white/10 shadow-2xl">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl" />

                  {/* ATS Score Circle */}
                  <div className="relative flex items-center justify-center mb-6">
                    <svg className="w-32 h-32 -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="white"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 0.92 }}
                        transition={{ delay: 1, duration: 2, ease: 'easeOut' }}
                        strokeDasharray="351.858"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <div className="text-4xl font-bold">92%</div>
                      <div className="text-xs text-white/50">ATS Score</div>
                    </div>
                  </div>

                  {/* AI Suggestions */}
                  <div className="space-y-3">
                    {['Experience section optimized', 'Keywords matched', 'Format ATS-ready'].map((text, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + i * 0.2 }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="h-4 w-4 text-white/70" />
                        <span className="text-white/60">{text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Floating Resume Card - Left */}
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 1 }}
                style={{ y: y2 }}
                className="absolute top-20 -left-20 w-48 h-64 bg-white/5 backdrop-blur-xl rounded-lg border border-white/10 p-4 shadow-2xl"
              >
                <div className="space-y-2">
                  <div className="h-3 bg-white/20 rounded w-3/4" />
                  <div className="h-2 bg-white/10 rounded w-1/2" />
                  <div className="h-2 bg-white/10 rounded w-2/3" />
                  <div className="mt-4 space-y-1">
                    <div className="h-2 bg-white/10 rounded" />
                    <div className="h-2 bg-white/10 rounded w-5/6" />
                    <div className="h-2 bg-white/10 rounded w-4/6" />
                  </div>
                </div>
              </motion.div>

              {/* Analytics Panel - Right */}
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 1 }}
                style={{ y: y1 }}
                className="absolute top-40 -right-20 w-56 bg-white/5 backdrop-blur-xl rounded-lg border border-white/10 p-4 shadow-2xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/50">Keywords</span>
                    <span className="text-sm font-bold">28/30</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '93%' }}
                      transition={{ delay: 1.5, duration: 1.5 }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">Export Ready</span>
                    <CheckCircle className="h-4 w-4" />
                  </div>
                </div>
              </motion.div>

              {/* Credits Badge - Bottom */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-20 left-10 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10"
              >
                <span className="text-sm font-medium">Credits: <span className="text-white">19,692</span></span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Neural Network Lines Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full">
            {[...Array(5)].map((_, i) => (
              <motion.line
                key={i}
                x1={`${i * 25}%`}
                y1="0"
                x2={`${100 - i * 25}%`}
                y2="100%"
                stroke="white"
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.3 }}
                transition={{ delay: i * 0.2, duration: 2 }}
              />
            ))}
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-20 px-4 sm:px-6 relative border-y border-white/10">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-0.5 sm:mb-2 text-white">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-base text-white/50 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted Companies Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 relative">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-8 sm:mb-12"
          >
            <h3 className="text-xs sm:text-sm font-semibold text-white/40 tracking-widest uppercase mb-6 sm:mb-8">
              Powered by Industry Leaders
            </h3>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 items-center justify-items-center">
            {/* Vercel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: 0.1 }}
              className="group flex flex-col items-center gap-2 sm:gap-3"
            >
              <svg className="h-6 sm:h-8 w-auto fill-white/30 group-hover:fill-white transition-all duration-300" viewBox="0 0 283 64" fill="none">
                <path d="M141.68 16.25c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.46 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zM248.72 16c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.45 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zM200.24 34c0 6 3.92 10 10 10 4.12 0 7.21-1.87 8.8-4.92l7.68 4.43c-3.18 5.3-9.14 8.49-16.48 8.49-11.05 0-19-7.2-19-18s7.96-18 19-18c7.34 0 13.29 3.19 16.48 8.49l-7.68 4.43c-1.59-3.05-4.68-4.92-8.8-4.92-6.07 0-10 4-10 10zm82.48-29v46h-9V5h9zM36.95 0L73.9 64H0L36.95 0zm92.38 5l-27.71 48L73.91 5H84.3l17.32 30 17.32-30h10.39zm58.91 12v9.69c-1-.29-2.06-.49-3.2-.49-5.81 0-10 4-10 10V51h-9V17h9v9.2c0-5.08 5.91-9.2 13.2-9.2z" />
              </svg>
              <span className="text-xs sm:text-sm font-medium text-white/50 group-hover:text-white transition-colors">Vercel</span>
            </motion.div>

            {/* GitHub */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: 0.2 }}
              className="group flex flex-col items-center gap-2 sm:gap-3"
            >
              <svg className="h-8 sm:h-10 w-auto fill-white/30 group-hover:fill-white transition-all duration-300" viewBox="0 0 98 96">
                <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" />
              </svg>
              <span className="text-xs sm:text-sm font-medium text-white/50 group-hover:text-white transition-colors">GitHub</span>
            </motion.div>

            {/* Netlify */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: 0.3 }}
              className="group flex flex-col items-center gap-2 sm:gap-3"
            >
              <svg className="h-6 sm:h-8 w-auto fill-white/30 group-hover:fill-white transition-all duration-300" viewBox="0 0 40 40">
                <path d="M27.4635 24.3218L30.4904 21.2949L24.4949 15.2994L24.4365 15.3286L27.4635 24.3218ZM22.8304 16.7159L28.9135 22.799L31.9696 19.7429L25.8865 13.6598L22.8304 16.7159ZM20.7337 18.8126L23.7606 27.8058L26.7875 24.7789L23.7898 15.7565L20.7337 18.8126ZM31.9988 12.3383L28.9427 15.3944L35.0258 21.4775L38.0527 18.4506L31.9988 12.3383ZM27.4927 13.9284L24.4366 10.8723L21.3804 13.9284L24.4366 16.9845L27.4927 13.9284ZM20.1242 12.3675L17.0681 15.4236L23.1804 21.5067L26.2073 18.4798L20.1242 12.3675ZM15.7619 16.7451L18.7889 25.7383L21.8742 22.653L18.8181 13.6598L15.7619 16.7451ZM22.5973 29.0734C22.5681 29.0734 22.5681 29.0734 22.5389 29.0734C22.4805 29.0734 22.4512 29.0442 22.4512 29.015L20.355 19.9926L13.6944 26.6532C13.6944 26.6532 13.6944 26.6532 13.6944 26.6824L22.5973 29.0734ZM34.9674 10.8723L31.9404 13.8992L38.0235 19.9822L41.0504 16.9553L34.9674 10.8723ZM30.5196 9.28218L27.4635 12.3383L30.5196 15.3944L33.5757 12.3383L30.5196 9.28218ZM26.1573 7.72129L23.1012 10.7774L26.1573 13.8335L29.2135 10.7774L26.1573 7.72129ZM21.795 6.16039L18.7389 9.21651L21.795 12.2726L24.8512 9.21651L21.795 6.16039ZM17.4327 4.59949L14.3766 7.6556L17.4327 10.7117L20.4889 7.6556L17.4327 4.59949ZM13.0704 3.03859L10.0143 6.09471L13.0704 9.15083L16.1265 6.09471L13.0704 3.03859ZM24.4658 3.18016L22.5096 5.13636L25.5658 8.19248L27.5512 6.20708L24.4658 3.18016ZM20.8796 0.0240326L20.7337 0.140327L23.7898 3.19645L25.8281 1.15813L20.8796 0.0240326ZM28.9135 7.63389L26.8458 9.7016L29.9019 12.7577L31.9696 10.69L28.9135 7.63389ZM42.3658 18.2166L39.3096 21.2727L45.3927 27.3558L48.4196 24.3289L42.3658 18.2166ZM37.3296 16.6557L34.2735 19.7118L40.3566 25.795L43.4127 22.7389L37.3296 16.6557ZM47.7827 20.039L44.7266 23.0951L47.7827 26.1512L50.8389 23.0951L47.7827 20.039ZM38.0527 24.9988C38.0527 25.0572 38.0235 25.0864 37.9942 25.1157L35.8981 27.2118L44.8596 29.5735C44.8888 29.5735 44.9181 29.5735 44.9473 29.5735C45.035 29.5735 45.0642 29.5443 45.0935 29.515L47.1604 27.4481L38.0527 24.9988ZM7.01347 8.92861C6.92579 8.92861 6.86734 8.99938 6.86734 9.08706V30.6491C6.86734 30.9075 7.01347 31.1075 7.27192 31.1952L16.2335 34.1637L19.2896 31.1075L7.01347 8.92861ZM20.4596 32.278L12.5096 15.6536L9.45347 18.7097L17.4327 35.3633L20.4596 32.278ZM41.6673 30.3511L38.6112 33.4072L55.7827 37.4296L58.8389 34.3735L41.6673 30.3511ZM37.9066 31.8536L34.8505 34.9097L39.915 36.1075L42.9712 33.0514L37.9066 31.8536ZM53.0527 23.532L49.9966 26.5881L53.0527 29.6443L56.1089 26.5881L53.0527 23.532ZM48.6904 21.9711L45.6343 25.0272L48.6904 28.0833L51.7466 25.0272L48.6904 21.9711ZM33.5465 33.2903L30.4904 36.3464L33.5465 39.4025L36.6027 36.3464L33.5465 33.2903ZM29.1842 31.7294L26.1281 34.7855L29.1842 37.8416L32.2404 34.7855L29.1842 31.7294ZM24.8219 30.1685L21.7658 33.2247L24.8219 36.2808L27.8781 33.2247L24.8219 30.1685Z" />
              </svg>
              <span className="text-xs sm:text-sm font-medium text-white/50 group-hover:text-white transition-colors">Netlify</span>
            </motion.div>

            {/* Firebase */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: 0.4 }}
              className="group flex flex-col items-center gap-2 sm:gap-3"
            >
              <svg className="h-9 sm:h-11 w-auto fill-white/30 group-hover:fill-white transition-all duration-300" viewBox="0 0 192 192">
                <path d="M124.71 120.22L91 156.82a7.59 7.59 0 0 1-10.85-.33L35.05 98.4a7.59 7.59 0 0 1 1.49-11.27L124.71 120.22z" />
                <path d="M35.05 98.4L58.14 17.9a4 4 0 0 1 7.47-.6l59.93 103.15L91 156.82a7.59 7.59 0 0 1-10.85-.33L35.05 98.4z" opacity=".72" />
                <path d="M165.34 106.55L152.48 45.88a4 4 0 0 0-6.75-2L35.05 98.4l45.1 58.09a7.59 7.59 0 0 0 10.85.33l74.34-50.27z" opacity=".48" />
                <path d="M35.05 98.4l89.66-33.49L102.82 28.05a4 4 0 0 0-7.22-.18L35.05 98.4z" opacity=".48" />
              </svg>
              <span className="text-xs sm:text-sm font-medium text-white/50 group-hover:text-white transition-colors">Firebase</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 relative">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="mb-12 sm:mb-20"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight">
              Enterprise-Grade Technology
            </h2>
            <p className="text-lg sm:text-xl text-white/60 max-w-2xl font-light">
              Powered by advanced AI and optimized for modern recruiting systems.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative flex items-start justify-between mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 bg-white rounded-lg group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-shadow">
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
                  </div>
                  <span className="text-4xl sm:text-5xl font-bold text-white/10 group-hover:text-white/20 transition-colors">
                    {feature.number}
                  </span>
                </div>

                <h3 className="relative text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="relative text-sm sm:text-base text-white/60 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Wizard Timeline Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 relative border-y border-white/10">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="mb-12 sm:mb-20 text-center"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight">
              Guided Step-by-Step
            </h2>
            <p className="text-lg sm:text-xl text-white/60 font-light max-w-2xl mx-auto">
              Progressive timeline shows exactly where you are in the resume building journey.
            </p>
          </motion.div>

          {/* Timeline Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="relative bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-white/10 overflow-x-auto"
          >
            <div className="min-w-[800px] lg:min-w-full">
              <div className="flex items-center gap-2 pb-8">
                {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'].map((step, index) => (
                  <div key={index} className="flex items-center flex-1 min-w-max">
                    {/* Step Circle */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true, margin: '-100px' }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${index < 3
                        ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                        : 'bg-white/20 border border-white/30 text-white'
                        }`}
                    >
                      {step}
                      {index < 3 && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-white"
                          initial={{ scale: 1, opacity: 1 }}
                          animate={{ scale: 1.2, opacity: 0 }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </motion.div>

                    {/* Connector Line */}
                    {index < 10 && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ delay: index * 0.05 + 0.1 }}
                        className={`h-1 w-6 sm:w-8 mx-1 sm:mx-2 origin-left transition-all duration-300 ${index < 2 ? 'bg-white' : 'bg-white/20'
                          }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Labels */}
              <div className="flex items-start gap-2">
                {[
                  { step: '01', label: 'Quick\nStart' },
                  { step: '02', label: 'Contact' },
                  { step: '03', label: 'Experience' },
                  { step: '04', label: 'Education' },
                  { step: '05', label: 'Skills' },
                  { step: '06', label: 'Projects' },
                  { step: '07', label: 'Certifications' },
                  { step: '08', label: 'Languages' },
                  { step: '09', label: 'Achievements' },
                  { step: '10', label: 'Summary' },
                  { step: '11', label: 'Review' },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ delay: index * 0.05 + 0.2 }}
                    className="flex-1 min-w-max"
                  >
                    <div className="text-[10px] sm:text-xs font-medium text-white/50 text-center whitespace-pre-line leading-tight">
                      {item.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Progress Info */}
              <div className="mt-6 sm:mt-8 flex items-center gap-6 sm:gap-8 text-xs sm:text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-white" />
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-white/30" />
                  <span>Upcoming</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Timeline Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mt-8 sm:mt-12">
            {[
              { title: 'Real-Time Progress', desc: 'See exactly where you are in the process' },
              { title: 'Save Anytime', desc: 'Auto-saves your progress at each step' },
              { title: 'Resume Strength', desc: 'Live meter showing resume quality score' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-4 bg-white/5 md:bg-transparent rounded-lg md:rounded-none border md:border-none border-white/5"
              >
                <h3 className="font-bold mb-1 sm:mb-2 text-lg sm:text-base">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upload & Templates Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 relative">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="mb-12 sm:mb-20"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight">
              Flexible Resume Building
            </h2>
            <p className="text-lg sm:text-xl text-white/60 font-light max-w-2xl">
              Start fresh or upload your existing resume for instant optimization.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {/* Upload Feature */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-10 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                <div className="p-3 sm:p-4 bg-white w-fit rounded-xl mb-4 sm:mb-6 shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-shadow">
                  <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Upload Existing Resume</h3>
                <p className="text-sm sm:text-base text-white/60 mb-4 sm:mb-6 leading-relaxed">
                  Instantly parse and analyze your PDF, DOC, or DOCX file. Get ATS score, optimization suggestions, and automated content enhancement.
                </p>
                <ul className="space-y-2 sm:space-y-3">
                  {['Supports PDF, DOC, DOCX', 'Max 10MB file size', 'Instant ATS analysis', 'Auto-extraction of data'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/70">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Templates Feature */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-10 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                <div className="p-3 sm:p-4 bg-white w-fit rounded-xl mb-4 sm:mb-6 shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-shadow">
                  <Palette className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Professional Templates</h3>
                <p className="text-sm sm:text-base text-white/60 mb-4 sm:mb-6 leading-relaxed">
                  Choose from 6+ enterprise-grade LaTeX templates. Each optimized for ATS systems and designed by industry experts.
                </p>
                <ul className="space-y-2 sm:space-y-3">
                  {['Modern & Clean Design', 'ATS-Optimized Layouts', 'Fully Customizable', 'Export as PDF'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/70">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ATS & Security Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 relative border-y border-white/10">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 sm:gap-16 items-center">
            {/* Left: ATS Scoring */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
            >
              <div className="mb-6 sm:mb-8">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight">
                  Real-Time ATS Scoring
                </h2>
                <p className="text-lg sm:text-xl text-white/60 font-light">
                  Get instant feedback on your resume's ATS compatibility with detailed optimization tips.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Keyword Optimization', value: 92 },
                  { label: 'Format Compliance', value: 88 },
                  { label: 'Content Strength', value: 85 },
                ].map((metric, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-white">{metric.label}</span>
                      <span className="text-white/60">{metric.value}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-white rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${metric.value}%` }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ delay: i * 0.1, duration: 1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Security & Privacy */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="mt-8 md:mt-0"
            >
              <div className="mb-6 sm:mb-8">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight">
                  Secure & Private
                </h2>
                <p className="text-lg sm:text-xl text-white/60 font-light">
                  Enterprise-grade security to protect your personal information.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Lock, title: 'End-to-End Encrypted', desc: 'All data encrypted in transit and at rest' },
                  { icon: Shield, title: 'Firebase Security', desc: 'Enterprise-grade cloud infrastructure' },
                  { icon: CheckCircle, title: 'Privacy First', desc: 'Your data is never shared with third parties' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5"
                  >
                    <div className="flex-shrink-0 pt-1">
                      <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                      <p className="text-white/60 text-sm">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 relative">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            className="relative bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-8 sm:p-16 text-center border border-white/10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />

            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight">
                  Start Your Journey
                </h2>
                <p className="text-lg sm:text-xl text-white/60 mb-8 sm:mb-10 max-w-2xl mx-auto font-light">
                  Join 10,000+ professionals building their future with AI-powered resumes.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(255,255,255,0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className="group relative px-8 py-4 sm:px-12 sm:py-5 bg-white text-black rounded-xl font-bold text-lg overflow-hidden w-full sm:w-auto"
                >
                  <div className="absolute inset-0 bg-white blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Get Started Free
                    <ArrowUpRight className="h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </span>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>


    </PublicLayout>
  )
}
