import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import PublicLayout from '../components/layouts/PublicLayout'
import { SEO, HomeSchema } from '../components/SEO'
import { useEffect, useState, useRef } from 'react'
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
  Globe,
  Layout,
  MessageSquare,
  Video,
  History,
  GitBranch,
  Mic,
  Camera,
  Share2,
  AudioWaveform,
  PhoneOff,
  Quote,
  ChevronDown,
  ChevronUp,
  HelpCircle,
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

  const [landingStats, setLandingStats] = useState({
    resumes_created: '1,000+',
    ats_pass_rate: '95%',
    avg_score: '92%',
    user_rating: '4.9/5',
    build_time: '<10min'
  });

  const stats = [
    { value: landingStats.resumes_created, label: 'Resumes Built' },
    { value: landingStats.ats_pass_rate, label: 'ATS Pass Rate' },
    { value: landingStats.avg_score, label: 'Avg Score' },
    { value: landingStats.build_time, label: 'Build Time' },
  ]

  const [successStories, setSuccessStories] = useState<any[]>([])
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  useEffect(() => {
    // Fetch stats
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/resumes/public/stats`);
        if (response.ok) {
          const data = await response.json();
          setLandingStats({
            resumes_created: data.resumes_created || '1,000+',
            ats_pass_rate: data.ats_pass_rate || '95%',
            avg_score: data.avg_score || '92%',
            user_rating: data.user_rating || '4.9/5',
            build_time: '<10min'
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();

    // Fetch real testimonials from backend
    const fetchSuccessStories = async () => {
      try {
        // Use absolute URL to fetch from backend
        const response = await fetch(`${API_URL}/api/resumes/public/testimonials?limit=50`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setSuccessStories(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
      }
    };

    fetchSuccessStories();
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationFrameId: number;

    const scroll = () => {
      if (!isPaused && scrollContainer) {
        if (scrollContainer.scrollLeft >= (scrollContainer.scrollWidth - scrollContainer.clientWidth - 1)) {
          // Reset to beginning or handle end. For true infinite, we need better reset point.
          // Simple auto scroll: loop back when hitting end is jarring.
          // Better: increment until end, then maybe reverse or verify logic.
          // Let's use the standard Reset-to-0 if we can.
          scrollContainer.scrollLeft = 0;
        } else {
          scrollContainer.scrollLeft += 1;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, successStories]);

  // FAQ State
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [faqPage, setFaqPage] = useState(1);
  const faqsPerPage = 5;

  const faqs = [
    {
      question: "Is Prativeda free to use?",
      answer: "We operate on a transparent credit system. You receive 10 FREE credits every month, enough to create and score a resume. for power users, we offer affordable top-up packs starting at just ₹89."
    },
    {
      question: "How do the credits work?",
      answer: "Each premium action uses credits: Creating a resume (5 credits), ATS Scoring (5 credits), and PDF Export (3 credits). Your free allowance renews monthly, or you can buy more whenever you need."
    },
    {
      question: "Why isn't it completely free?",
      answer: "We use enterprise-grade AI and expensive LaTeX rendering servers to ensure your resume is perfect. The small credit fee covers these server costs so we can provide you with the best possible quality."
    },
    {
      question: "Can I download my resume for free?",
      answer: "Yes! If you have credits available (from your monthly free 10), downloading is covered. Each high-quality PDF export costs 3 credits."
    },
    {
      question: "Do credits expire?",
      answer: "Your monthly free credits reset every month. However, purchased top-up credits do not expire and stay in your account until you use them."
    },
    {
      question: "Can I use it for multiple resumes?",
      answer: "Yes, you can create and manage multiple versions of your resume. Each new resume creation deducts 5 credits, but editing existing text usually costs less (1 credit) or is free."
    },
    {
      question: "What if I run out of credits?",
      answer: "No worries! You can purchase additional credit packs instantly. Our 'Starter Pack' begins at ₹89, offering great value for job seekers who need a quick boost."
    },
    {
      question: "Does it support Indian resume formats?",
      answer: "Absolutely. Our templates are optimized for both Indian and Global markets. Whether you need a standard format or a modern creative layout, we have you covered."
    },
    {
      question: "Is my personal data safe?",
      answer: "Yes, we take security seriously. Your data is encrypted and stored securely. We do not sell your personal information to third-party recruiters or agencies."
    },
    {
      question: "How accurate is the ATS score?",
      answer: "Our ATS scorer mimics real-world enterprise applicant tracking systems. A score above 80% generally indicates excellent compatibility with most job portals."
    }
  ];

  // Pagination logic
  const totalFaqPages = Math.ceil(faqs.length / faqsPerPage);
  const displayedFaqs = faqs.slice((faqPage - 1) * faqsPerPage, faqPage * faqsPerPage);

  // No duplication for unique display
  const displayStories = successStories;

  return (
    <>
      <SEO
        title="Prativeda – AI Resume Builder | ATS-Optimized Resumes"
        description="Create ATS-optimized resumes with AI analysis. Get higher ATS scores, pass screening, land more interviews. Free templates + intelligent parsing."
        keywords="resume builder, ATS scoring, AI resume, job application, resume optimization"
        url="https://prativeda.codetapasya.com"
      />
      <HomeSchema />
      <PublicLayout>



        {/* Hero Section - Futuristic 3D */}
        <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:min-h-screen flex flex-col lg:justify-center overflow-hidden">
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
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-4 sm:py-2 bg-secondary-100 dark:bg-white/5 backdrop-blur-xl rounded-full border border-secondary-200 dark:border-white/10 mb-4 sm:mb-8"
                >
                  <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-900 dark:bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-secondary-900 dark:bg-white" />
                  </span>
                  <span className="text-[10px] sm:text-sm font-medium text-secondary-900 dark:text-white/90 tracking-wide">AI Resume Wizard • ATS Analysis</span>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-[1.0] sm:leading-[0.95] tracking-tighter text-secondary-900 dark:text-white"
                >
                  Build ATS-Perfect
                  <br />
                  <span className="relative inline-block">
                    <span className="relative z-10">Resumes</span>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.8, duration: 0.8 }}
                      className="absolute bottom-1 sm:bottom-2 left-0 right-0 h-2 sm:h-3 bg-secondary-200 dark:bg-white/20 -z-0"
                    />
                  </span>
                  <br />
                  with AI
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-base sm:text-xl text-secondary-600 dark:text-white/60 mb-6 sm:mb-8 leading-relaxed max-w-xl font-light"
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
                    className="group relative px-6 py-3 sm:px-8 sm:py-4 bg-secondary-900 dark:bg-white text-white dark:text-black rounded-lg font-bold overflow-hidden w-full sm:w-auto"
                  >
                    <div className="absolute inset-0 bg-secondary-800 dark:bg-white blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Start Building Free
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 sm:px-8 sm:py-4 border border-secondary-200 dark:border-white/20 rounded-lg font-semibold hover:bg-secondary-50 dark:hover:bg-white/5 transition-colors backdrop-blur-xl w-full sm:w-auto text-secondary-900 dark:text-white"
                  >
                    Watch Demo
                  </motion.button>
                </motion.div>

                {/* Stats Row */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center gap-8 pt-8 border-t border-secondary-200 dark:border-white/10"
                >
                  <div>
                    <div className="text-3xl font-bold mb-1 text-secondary-900 dark:text-white">{landingStats.resumes_created}</div>
                    <div className="text-sm text-secondary-500 dark:text-white/50">Resumes Created</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-1 text-secondary-900 dark:text-white">{landingStats.ats_pass_rate}</div>
                    <div className="text-sm text-secondary-500 dark:text-white/50">ATS Pass Rate</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-1 text-secondary-900 dark:text-white">{landingStats.user_rating}</div>
                    <div className="text-sm text-secondary-500 dark:text-white/50">User Rating</div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right - 3D Floating Elements */}
              <motion.div
                style={{
                  x: mousePosition.x,
                  y: mousePosition.y,
                }}
                className="relative hidden lg:block h-[600px] lg:scale-75 xl:scale-100 origin-center"
              >
                {/* Main Dashboard Panel */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ delay: 0.4, duration: 1 }}
                  style={{ y: y1 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px]"
                >
                  <div className="relative bg-white dark:bg-white/5 backdrop-blur-2xl rounded-2xl p-8 border border-secondary-200 dark:border-white/10 shadow-2xl">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary-50/50 dark:from-white/10 via-transparent to-transparent rounded-2xl" />

                    {/* ATS Score Circle */}
                    <div className="relative flex items-center justify-center mb-6">
                      <svg className="w-32 h-32 -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          className="text-secondary-100 dark:text-white/10"
                          strokeWidth="8"
                          fill="none"
                        />
                        <motion.circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          className="text-secondary-900 dark:text-white"
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
                        <div className="text-4xl font-bold text-secondary-900 dark:text-white">92%</div>
                        <div className="text-xs text-secondary-500 dark:text-white/50">ATS Score</div>
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
                          <CheckCircle className="h-4 w-4 text-secondary-500 dark:text-white/70" />
                          <span className="text-secondary-600 dark:text-white/60">{text}</span>
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
                  className="absolute top-20 -left-10 lg:-left-4 xl:-left-20 w-48 h-64 bg-white dark:bg-white/5 backdrop-blur-xl rounded-lg border border-secondary-200 dark:border-white/10 p-4 shadow-2xl"
                >
                  <div className="space-y-2">
                    <div className="h-3 bg-secondary-200 dark:bg-white/20 rounded w-3/4" />
                    <div className="h-2 bg-secondary-100 dark:bg-white/10 rounded w-1/2" />
                    <div className="h-2 bg-secondary-100 dark:bg-white/10 rounded w-2/3" />
                    <div className="mt-4 space-y-1">
                      <div className="h-2 bg-secondary-100 dark:bg-white/10 rounded" />
                      <div className="h-2 bg-secondary-100 dark:bg-white/10 rounded w-5/6" />
                      <div className="h-2 bg-secondary-100 dark:bg-white/10 rounded w-4/6" />
                    </div>
                  </div>
                </motion.div>

                {/* Analytics Panel - Right */}
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 1 }}
                  style={{ y: y1 }}
                  className="absolute top-40 -right-10 lg:-right-4 xl:-right-20 w-56 bg-white dark:bg-white/5 backdrop-blur-xl rounded-lg border border-secondary-200 dark:border-white/10 p-4 shadow-2xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-secondary-500 dark:text-white/50">Keywords</span>
                      <span className="text-sm font-bold text-secondary-900 dark:text-white">28/30</span>
                    </div>
                    <div className="h-1.5 bg-secondary-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '93%' }}
                        transition={{ delay: 1.5, duration: 1.5 }}
                        className="h-full bg-secondary-900 dark:bg-white rounded-full"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-secondary-500 dark:text-white/50">Export Ready</span>
                      <CheckCircle className="h-4 w-4 text-secondary-900 dark:text-white" />
                    </div>
                  </div>
                </motion.div>

                {/* Credits Badge - Bottom */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 1 }}
                  className="absolute bottom-20 left-10 px-4 py-2 bg-white dark:bg-white/5 backdrop-blur-xl rounded-full border border-secondary-200 dark:border-white/10 shadow-lg dark:shadow-none"
                >
                  <span className="text-sm font-medium text-secondary-600 dark:text-white/60">Credits: <span className="text-secondary-900 dark:text-white">100</span></span>
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
                  stroke="currentColor"
                  className="text-secondary-200 dark:text-white"
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
        <section className="py-8 sm:py-20 px-4 sm:px-6 relative border-y border-secondary-200 dark:border-white/10 overflow-hidden">
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
                  <div className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-0.5 sm:mb-2 text-secondary-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-base text-secondary-500 dark:text-white/50 font-medium">{stat.label}</div>
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
              <h3 className="text-xs sm:text-sm font-semibold text-secondary-400 dark:text-white/40 tracking-widest uppercase mb-6 sm:mb-8">
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
                <svg className="h-6 sm:h-8 w-auto fill-secondary-300 dark:fill-white/30 group-hover:fill-secondary-900 dark:group-hover:fill-white transition-all duration-300" viewBox="0 0 283 64" fill="none">
                  <path d="M141.68 16.25c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.46 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zM248.72 16c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.45 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zM200.24 34c0 6 3.92 10 10 10 4.12 0 7.21-1.87 8.8-4.92l7.68 4.43c-3.18 5.3-9.14 8.49-16.48 8.49-11.05 0-19-7.2-19-18s7.96-18 19-18c7.34 0 13.29 3.19 16.48 8.49l-7.68 4.43c-1.59-3.05-4.68-4.92-8.8-4.92-6.07 0-10 4-10 10zm82.48-29v46h-9V5h9zM36.95 0L73.9 64H0L36.95 0zm92.38 5l-27.71 48L73.91 5H84.3l17.32 30 17.32-30h10.39zm58.91 12v9.69c-1-.29-2.06-.49-3.2-.49-5.81 0-10 4-10 10V51h-9V17h9v9.2c0-5.08 5.91-9.2 13.2-9.2z" />
                </svg>
                <span className="text-xs sm:text-sm font-medium text-secondary-400 dark:text-white/50 group-hover:text-secondary-900 dark:group-hover:text-white transition-colors">Vercel</span>
              </motion.div>

              {/* GitHub */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: 0.2 }}
                className="group flex flex-col items-center gap-2 sm:gap-3"
              >
                <svg className="h-8 sm:h-10 w-auto fill-secondary-300 dark:fill-white/30 group-hover:fill-secondary-900 dark:group-hover:fill-white transition-all duration-300" viewBox="0 0 98 96">
                  <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" />
                </svg>
                <span className="text-xs sm:text-sm font-medium text-secondary-400 dark:text-white/50 group-hover:text-secondary-900 dark:group-hover:text-white transition-colors">GitHub</span>
              </motion.div>

              {/* Netlify */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: 0.3 }}
                className="group flex flex-col items-center gap-2 sm:gap-3"
              >
                <svg className="h-6 sm:h-8 w-auto fill-secondary-300 dark:fill-white/30 group-hover:fill-secondary-900 dark:group-hover:fill-white transition-all duration-300" viewBox="0 0 40 40">
                  <path d="M27.4635 24.3218L30.4904 21.2949L24.4949 15.2994L24.4365 15.3286L27.4635 24.3218ZM22.8304 16.7159L28.9135 22.799L31.9696 19.7429L25.8865 13.6598L22.8304 16.7159ZM20.7337 18.8126L23.7606 27.8058L26.7875 24.7789L23.7898 15.7565L20.7337 18.8126ZM31.9988 12.3383L28.9427 15.3944L35.0258 21.4775L38.0527 18.4506L31.9988 12.3383ZM27.4927 13.9284L24.4366 10.8723L21.3804 13.9284L24.4366 16.9845L27.4927 13.9284ZM20.1242 12.3675L17.0681 15.4236L23.1804 21.5067L26.2073 18.4798L20.1242 12.3675ZM15.7619 16.7451L18.7889 25.7383L21.8742 22.653L18.8181 13.6598L15.7619 16.7451ZM22.5973 29.0734C22.5681 29.0734 22.5681 29.0734 22.5389 29.0734C22.4805 29.0734 22.4512 29.0442 22.4512 29.015L20.355 19.9926L13.6944 26.6532C13.6944 26.6532 13.6944 26.6532 13.6944 26.6824L22.5973 29.0734ZM34.9674 10.8723L31.9404 13.8992L38.0235 19.9822L41.0504 16.9553L34.9674 10.8723ZM30.5196 9.28218L27.4635 12.3383L30.5196 15.3944L33.5757 12.3383L30.5196 9.28218ZM26.1573 7.72129L23.1012 10.7774L26.1573 13.8335L29.2135 10.7774L26.1573 7.72129ZM21.795 6.16039L18.7389 9.21651L21.795 12.2726L24.8512 9.21651L21.795 6.16039ZM17.4327 4.59949L14.3766 7.6556L17.4327 10.7117L20.4889 7.6556L17.4327 4.59949ZM13.0704 3.03859L10.0143 6.09471L13.0704 9.15083L16.1265 6.09471L13.0704 3.03859ZM24.4658 3.18016L22.5096 5.13636L25.5658 8.19248L27.5512 6.20708L24.4658 3.18016ZM20.8796 0.0240326L20.7337 0.140327L23.7898 3.19645L25.8281 1.15813L20.8796 0.0240326ZM28.9135 7.63389L26.8458 9.7016L29.9019 12.7577L31.9696 10.69L28.9135 7.63389ZM42.3658 18.2166L39.3096 21.2727L45.3927 27.3558L48.4196 24.3289L42.3658 18.2166ZM37.3296 16.6557L34.2735 19.7118L40.3566 25.795L43.4127 22.7389L37.3296 16.6557ZM47.7827 20.039L44.7266 23.0951L47.7827 26.1512L50.8389 23.0951L47.7827 20.039ZM38.0527 24.9988C38.0527 25.0572 38.0235 25.0864 37.9942 25.1157L35.8981 27.2118L44.8596 29.5735C44.8888 29.5735 44.9181 29.5735 44.9473 29.5735C45.035 29.5735 45.0642 29.5443 45.0935 29.515L47.1604 27.4481L38.0527 24.9988ZM7.01347 8.92861C6.92579 8.92861 6.86734 8.99938 6.86734 9.08706V30.6491C6.86734 30.9075 7.01347 31.1075 7.27192 31.1952L16.2335 34.1637L19.2896 31.1075L7.01347 8.92861ZM20.4596 32.278L12.5096 15.6536L9.45347 18.7097L17.4327 35.3633L20.4596 32.278ZM41.6673 30.3511L38.6112 33.4072L55.7827 37.4296L58.8389 34.3735L41.6673 30.3511ZM37.9066 31.8536L34.8505 34.9097L39.915 36.1075L42.9712 33.0514L37.9066 31.8536ZM53.0527 23.532L49.9966 26.5881L53.0527 29.6443L56.1089 26.5881L53.0527 23.532ZM48.6904 21.9711L45.6343 25.0272L48.6904 28.0833L51.7466 25.0272L48.6904 21.9711ZM33.5465 33.2903L30.4904 36.3464L33.5465 39.4025L36.6027 36.3464L33.5465 33.2903ZM29.1842 31.7294L26.1281 34.7855L29.1842 37.8416L32.2404 34.7855L29.1842 31.7294ZM24.8219 30.1685L21.7658 33.2247L24.8219 36.2808L27.8781 33.2247L24.8219 30.1685Z" />
                </svg>
                <span className="text-xs sm:text-sm font-medium text-secondary-400 dark:text-white/50 group-hover:text-secondary-900 dark:group-hover:text-white transition-colors">Netlify</span>
              </motion.div>

              {/* Firebase */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: 0.4 }}
                className="group flex flex-col items-center gap-2 sm:gap-3"
              >
                <svg className="h-9 sm:h-11 w-auto fill-secondary-300 dark:fill-white/30 group-hover:fill-secondary-900 dark:group-hover:fill-white transition-all duration-300" viewBox="0 0 192 192">
                  <path d="M124.71 120.22L91 156.82a7.59 7.59 0 0 1-10.85-.33L35.05 98.4a7.59 7.59 0 0 1 1.49-11.27L124.71 120.22z" />
                  <path d="M35.05 98.4L58.14 17.9a4 4 0 0 1 7.47-.6l59.93 103.15L91 156.82a7.59 7.59 0 0 1-10.85-.33L35.05 98.4z" opacity=".72" />
                  <path d="M165.34 106.55L152.48 45.88a4 4 0 0 0-6.75-2L35.05 98.4l45.1 58.09a7.59 7.59 0 0 0 10.85.33l74.34-50.27z" opacity=".48" />
                  <path d="M35.05 98.4l89.66-33.49L102.82 28.05a4 4 0 0 0-7.22-.18L35.05 98.4z" opacity=".48" />
                </svg>
                <span className="text-xs sm:text-sm font-medium text-secondary-400 dark:text-white/50 group-hover:text-secondary-900 dark:group-hover:text-white transition-colors">Firebase</span>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="mb-12 sm:mb-20"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight text-secondary-900 dark:text-white">
                Enterprise-Grade Technology
              </h2>
              <p className="text-lg sm:text-xl text-secondary-600 dark:text-white/60 max-w-2xl font-light">
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
                  className="group relative bg-white dark:bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-secondary-200 dark:border-white/10 hover:border-secondary-300 dark:hover:border-white/20 hover:bg-secondary-50 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer shadow-lg dark:shadow-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary-100/50 dark:from-white/5 via-transparent to-transparent rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative flex items-start justify-between mb-4 sm:mb-6">
                    <div className="p-2 sm:p-3 bg-secondary-900 dark:bg-white rounded-lg group-hover:shadow-[0_0_30px_rgba(0,0,0,0.2)] dark:group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-shadow">
                      <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white dark:text-black" />
                    </div>
                    <span className="text-4xl sm:text-5xl font-bold text-secondary-200 dark:text-white/10 group-hover:text-secondary-300 dark:group-hover:text-white/20 transition-colors">
                      {feature.number}
                    </span>
                  </div>

                  <h3 className="relative text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-secondary-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="relative text-sm sm:text-base text-secondary-600 dark:text-white/60 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Wizard Timeline Section */}
        <section className="py-20 sm:py-32 px-4 sm:px-6 relative border-y border-secondary-200 dark:border-white/10 overflow-hidden">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="mb-12 sm:mb-20 text-center"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight text-secondary-900 dark:text-white">
                Guided Step-by-Step
              </h2>
              <p className="text-lg sm:text-xl text-secondary-600 dark:text-white/60 font-light max-w-2xl mx-auto">
                Progressive timeline shows exactly where you are in the resume building journey.
              </p>
            </motion.div>

            {/* Timeline Visualization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="relative bg-white dark:bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-secondary-200 dark:border-white/10 overflow-x-auto shadow-sm dark:shadow-none"
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
                          ? 'bg-secondary-900 dark:bg-white text-white dark:text-black shadow-[0_0_20px_rgba(0,0,0,0.2)] dark:shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                          : 'bg-secondary-100 dark:bg-white/20 border border-secondary-300 dark:border-white/30 text-secondary-400 dark:text-white'
                          }`}
                      >
                        {step}
                        {index < 3 && (
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-secondary-900 dark:border-white"
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
                          className={`h-1 w-6 sm:w-8 mx-1 sm:mx-2 origin-left transition-all duration-300 ${index < 2 ? 'bg-secondary-900 dark:bg-white' : 'bg-secondary-200 dark:bg-white/20'
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
                      <div className="text-[10px] sm:text-xs font-medium text-secondary-400 dark:text-white/50 text-center whitespace-pre-line leading-tight">
                        {item.label}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Progress Info */}
                <div className="mt-6 sm:mt-8 flex items-center gap-6 sm:gap-8 text-xs sm:text-sm text-secondary-600 dark:text-white/60">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-secondary-900 dark:bg-white" />
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-secondary-200 dark:bg-white/30" />
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
                  className="text-center p-4 bg-white dark:bg-white/5 md:bg-transparent rounded-lg md:rounded-none border md:border-none border-secondary-200 dark:border-white/5"
                >
                  <h3 className="font-bold mb-1 sm:mb-2 text-lg sm:text-base text-secondary-900 dark:text-white">{item.title}</h3>
                  <p className="text-secondary-500 dark:text-white/50 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Upload & Templates Section */}
        <section className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="mb-12 sm:mb-20"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight text-secondary-900 dark:text-white">
                Flexible Resume Building
              </h2>
              <p className="text-lg sm:text-xl text-secondary-600 dark:text-white/60 font-light max-w-2xl">
                Start fresh or upload your existing resume for instant optimization.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              {/* Upload Feature */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                className="group relative bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-10 border border-secondary-200 dark:border-white/10 hover:border-purple-400 dark:hover:border-white/20 hover:bg-secondary-50 dark:hover:bg-white/10 transition-all duration-300 shadow-lg dark:shadow-none"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 dark:from-white/10 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative">
                  <div className="p-3 sm:p-4 bg-secondary-900 dark:bg-white w-fit rounded-xl mb-4 sm:mb-6 shadow-[0_0_30px_rgba(0,0,0,0.2)] dark:shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_40px_rgba(0,0,0,0.3)] dark:group-hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-shadow">
                    <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-white dark:text-black" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-secondary-900 dark:text-white">Upload Existing Resume</h3>
                  <p className="text-sm sm:text-base text-secondary-600 dark:text-white/60 mb-4 sm:mb-6 leading-relaxed">
                    Instantly parse and analyze your PDF, DOC, or DOCX file. Get ATS score, optimization suggestions, and automated content enhancement.
                  </p>
                  <ul className="space-y-2 sm:space-y-3">
                    {['Supports PDF, DOC, DOCX', 'Max 10MB file size', 'Instant ATS analysis', 'Auto-extraction of data'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-secondary-700 dark:text-white/70">
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
                className="group relative bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-10 border border-secondary-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-white/20 hover:bg-secondary-50 dark:hover:bg-white/10 transition-all duration-300 shadow-lg dark:shadow-none"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 dark:from-white/10 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative">
                  <div className="p-3 sm:p-4 bg-secondary-900 dark:bg-white w-fit rounded-xl mb-4 sm:mb-6 shadow-[0_0_30px_rgba(0,0,0,0.2)] dark:shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_40px_rgba(0,0,0,0.3)] dark:group-hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-shadow">
                    <Palette className="h-6 w-6 sm:h-8 sm:w-8 text-white dark:text-black" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-secondary-900 dark:text-white">Professional Templates</h3>
                  <p className="text-sm sm:text-base text-secondary-600 dark:text-white/60 mb-4 sm:mb-6 leading-relaxed">
                    Choose from 6+ enterprise-grade LaTeX templates. Each optimized for ATS systems and designed by industry experts.
                  </p>
                  <ul className="space-y-2 sm:space-y-3">
                    {['Modern & Clean Design', 'ATS-Optimized Layouts', 'Fully Customizable', 'Export as PDF'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-secondary-700 dark:text-white/70">
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

        {/* Portfolio & Hosting Section */}
        <section className="py-20 sm:py-32 px-4 sm:px-6 relative border-t border-secondary-200 dark:border-white/10 overflow-hidden">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center mb-20 sm:mb-32">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                className="order-2 lg:order-1"
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-secondary-200 dark:border-white/10 overflow-hidden shadow-2xl">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-secondary-200 dark:border-white/10 bg-secondary-50/50 dark:bg-white/5">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-black/20 text-[10px] text-secondary-500 dark:text-white/40 font-mono">
                          <Lock className="w-3 h-3" />
                          portfolio.dev
                        </div>
                      </div>
                    </div>
                    <div className="p-1">
                      <img
                        src="https://images.unsplash.com/photo-1517292987719-0369a794ec0f?auto=format&fit=crop&q=80&w=800&h=600"
                        alt="Portfolio Preview"
                        className="w-full h-auto rounded-lg opacity-90"
                      />
                    </div>
                  </div>

                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="absolute right-0 sm:-right-4 top-10 bg-white dark:bg-zinc-900 border border-secondary-200 dark:border-white/10 rounded-lg p-3 shadow-xl flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-xs font-bold text-secondary-900 dark:text-white">Live Deployment</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded bg-black flex items-center justify-center text-white" title="Vercel">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                          <path d="M12 1L24 22H0L12 1Z" />
                        </svg>
                      </div>
                      <div className="w-6 h-6 rounded bg-teal-500 flex items-center justify-center text-white" title="Netlify">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                          <path d="M7.4 20l11.3-11.3 5.3 5.3L7.4 20zM0 7.4l7.4 7.4 5.3-5.3L0 7.4zM7.4 0l-5.3 5.3 11.3 11.3L18.7 11.3 7.4 0z" />
                        </svg>
                      </div>
                      <div className="w-6 h-6 rounded bg-gray-800 flex items-center justify-center text-white" title="GitHub">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-7.77-3.795-1.425 0 0-.525-1.425-1.425-1.8 0 0-1.155-.795.105-.78 0 0 1.29.09 1.95 1.335.855 1.47 2.25 1.05 2.79.81.09-.63.345-1.05.63-1.29-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.92 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                className="order-1 lg:order-2"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-6">
                  <Globe className="w-4 h-4" />
                  Web Presence
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-secondary-900 dark:text-white">
                  Instant Portfolio Generation
                </h2>
                <p className="text-lg text-secondary-600 dark:text-white/60 mb-8 leading-relaxed">
                  Transform your resume into a stunning, responsive portfolio website in seconds. No coding required.
                </p>
                <div className="space-y-4">
                  {[
                    { title: 'One-Click Deploy', desc: 'Push to Vercel, Netlify, or GitHub instantly.' },
                    { title: 'Responsive Design', desc: 'Looks perfect on mobile, tablet, and desktop.' },
                    { title: 'SEO Optimized', desc: 'Rank higher on Google with automatic SEO.' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary-100 dark:bg-white/10 flex items-center justify-center text-secondary-900 dark:text-white">
                        {i === 0 ? <Zap className="w-5 h-5" /> : i === 1 ? <Layout className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-secondary-900 dark:text-white">{item.title}</h3>
                        <p className="text-sm text-secondary-500 dark:text-white/50">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Interview Prep Section */}
            <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center mb-20 sm:mb-32">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-6">
                  <Mic className="w-4 h-4" />
                  Interview Coach
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-secondary-900 dark:text-white">
                  AI Interview Preparation
                </h2>
                <p className="text-lg text-secondary-600 dark:text-white/60 mb-8 leading-relaxed">
                  Practice with our AI interviewer that adapts to your resume and job description. Get real-time feedback on your answers.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: MessageSquare, label: 'Smart Questions' },
                    { icon: AudioWaveform, label: 'Audio Analysis' },
                    { icon: Brain, label: 'Feedback Loop' },
                    { icon: Star, label: 'Score & Improve' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-secondary-50 dark:bg-white/5 border border-secondary-100 dark:border-white/10">
                      <item.icon className="w-5 h-5 text-purple-500" />
                      <span className="font-medium text-secondary-900 dark:text-white">{item.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full blur-[100px] opacity-20" />
                <div className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-secondary-200 dark:border-white/10 p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="font-bold text-secondary-900 dark:text-white">AI Interviewer</div>
                        <div className="text-xs text-green-500 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Online
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-secondary-100 dark:bg-white/10 text-xs font-medium">05:23</div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="bg-secondary-50 dark:bg-white/5 rounded-lg p-4 rounded-tl-none border border-secondary-100 dark:border-white/5">
                      <p className="text-sm text-secondary-600 dark:text-white/80">
                        Based on your experience at Tech Corp, how did you handle the scalability challenges mentioned in your resume?
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-500/10 rounded-lg p-4 rounded-tr-none ml-auto max-w-[80%] border border-purple-100 dark:border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-full h-4 bg-purple-200 dark:bg-purple-500/20 rounded animate-pulse" />
                        <div className="w-2/3 h-4 bg-purple-200 dark:bg-purple-500/20 rounded animate-pulse" />
                      </div>
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">
                        <Mic className="w-3 h-3" />
                        Recording...
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <button className="w-12 h-12 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors">
                      <PhoneOff className="w-5 h-5" />
                    </button>
                    <button className="w-12 h-12 rounded-full bg-secondary-900 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Version Control Section */}
            <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                className="order-2 lg:order-1"
              >
                <div className="relative bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-secondary-200 dark:border-white/10 p-6 sm:p-8">
                  <div className="space-y-6">
                    {[
                      { ver: 'v2.4', label: 'Senior Dev Application', date: '2 mins ago', active: true },
                      { ver: 'v2.3', label: 'Startup Generalist', date: '2 days ago', active: false },
                      { ver: 'v2.2', label: 'Remote Role Base', date: '5 days ago', active: false },
                    ].map((item, i) => (
                      <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${item.active ? 'bg-secondary-50 dark:bg-white/10 border-secondary-200 dark:border-white/20' : 'border-transparent opacity-60'}`}>
                        <div className={`p-2 rounded-lg ${item.active ? 'bg-secondary-900 text-white' : 'bg-secondary-100 dark:bg-white/10'}`}>
                          <GitBranch className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-secondary-900 dark:text-white">{item.label}</span>
                            <span className="text-xs font-mono text-secondary-500 dark:text-white/40">{item.ver}</span>
                          </div>
                          <div className="text-xs text-secondary-500 dark:text-white/50 flex items-center gap-2">
                            <History className="w-3 h-3" />
                            Updated {item.date}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                className="order-1 lg:order-2"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-semibold mb-6">
                  <History className="w-4 h-4" />
                  Version Control
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-secondary-900 dark:text-white">
                  Resume Versioning
                </h2>
                <p className="text-lg text-secondary-600 dark:text-white/60 mb-8 leading-relaxed">
                  Never lose a change. Maintain multiple versions of your resume tailored for different job applications and companies.
                </p>
                <div className="space-y-4">
                  {[
                    { title: 'Unlimited Versions', desc: 'Create as many variations as you need.' },
                    { title: 'Auto-Save History', desc: 'Rewind to any point in time with ease.' },
                    { title: 'Compare Changes', desc: 'See what changed between versions.' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-secondary-900 dark:text-white">{item.title}</h3>
                        <p className="text-sm text-secondary-500 dark:text-white/50">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ATS & Security Section */}
        <section className="py-20 sm:py-32 px-4 sm:px-6 relative border-y border-secondary-200 dark:border-white/10 overflow-hidden">
          <div className="container mx-auto max-w-7xl">
            <div className="grid md:grid-cols-2 gap-12 sm:gap-16 items-center">
              {/* Left: ATS Scoring */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
              >
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight text-secondary-900 dark:text-white">
                    Real-Time ATS Scoring
                  </h2>
                  <p className="text-lg sm:text-xl text-secondary-600 dark:text-white/60 font-light">
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
                        <span className="font-medium text-secondary-900 dark:text-white">{metric.label}</span>
                        <span className="text-secondary-500 dark:text-white/60">{metric.value}%</span>
                      </div>
                      <div className="h-2 bg-secondary-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-secondary-900 dark:bg-white rounded-full"
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
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight text-secondary-900 dark:text-white">
                    Secure & Private
                  </h2>
                  <p className="text-lg sm:text-xl text-secondary-600 dark:text-white/60 font-light">
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
                      className="flex gap-4 p-4 bg-white dark:bg-white/5 rounded-xl border border-secondary-200 dark:border-white/5 shadow-sm dark:shadow-none"
                    >
                      <div className="flex-shrink-0 pt-1">
                        <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-secondary-900 dark:text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-secondary-900 dark:text-white mb-1">{item.title}</h4>
                        <p className="text-secondary-500 dark:text-white/60 text-sm">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 sm:py-32 relative overflow-hidden bg-secondary-50 dark:bg-black/20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 mb-12 sm:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="text-center"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight text-secondary-900 dark:text-white">
                Success Stories
              </h2>
              <p className="text-lg sm:text-xl text-secondary-600 dark:text-white/60 font-light max-w-2xl mx-auto">
                Join thousands of professionals who landed their dream jobs with Prativeda.
              </p>
            </motion.div>
          </div>

          <div className="relative w-full overflow-hidden mask-gradient-x">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-secondary-50 dark:from-[#0f172a] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-secondary-50 dark:from-[#0f172a] to-transparent z-10 pointer-events-none" />

            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto pb-10 px-4 no-scrollbar scroll-smooth"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
              style={{ scrollBehavior: isPaused ? 'auto' : 'unset' }} // 'auto' for user touch, 'unset' for js smooth scroll
            >
              {(displayStories.length > 0 ? displayStories : [
                { name: 'Loading Success Stories...', role: 'Please wait', company: '...', text: 'Fetching real user data...' },
                { name: 'Loading Success Stories...', role: 'Please wait', company: '...', text: 'Fetching real user data...' }
              ]).map((user, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[300px] sm:w-[350px] p-6 bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-white/10 shadow-lg relative group hover:-translate-y-1 transition-transform duration-300"
                >
                  <Quote className="absolute top-6 right-6 w-8 h-8 text-secondary-100 dark:text-white/5 group-hover:text-secondary-200 dark:group-hover:text-white/10 transition-colors" />

                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(user.rating || 5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>

                  <p className="text-secondary-600 dark:text-white/80 mb-6 text-sm leading-relaxed min-h-[60px]">
                    "{user.text}"
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary-200 dark:bg-white/20 flex items-center justify-center font-bold text-secondary-900 dark:text-white border border-secondary-300 dark:border-white/10 overflow-hidden leading-none">
                      {user.name ? user.name.charAt(0) : '?'}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-secondary-900 dark:text-white">{user.name}</div>
                      <div className="text-xs text-secondary-500 dark:text-white/50">{user.role} at {user.company}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 sm:py-32 px-4 sm:px-6 relative border-t border-secondary-200 dark:border-white/10 overflow-hidden">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="text-center mb-12 sm:mb-20"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 tracking-tight text-secondary-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <p className="text-lg sm:text-xl text-secondary-600 dark:text-white/60 font-light max-w-2xl mx-auto">
                Everything you need to know about building your perfect resume.
              </p>
            </motion.div>

            <div className="space-y-4">
              {displayedFaqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-white/5 backdrop-blur-sm border border-secondary-200 dark:border-white/10 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setActiveFAQ(activeFAQ === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 sm:p-6 text-left focus:outline-none"
                  >
                    <span className="text-base sm:text-lg font-semibold text-secondary-900 dark:text-white pr-4 sm:pr-8">
                      {faq.question}
                    </span>
                    <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-secondary-200 dark:border-white/20 flex items-center justify-center transition-colors ${activeFAQ === index ? 'bg-secondary-900 dark:bg-white text-white dark:text-black' : 'text-secondary-500 dark:text-white/50'}`}>
                      {activeFAQ === index ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {activeFAQ === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <div className="px-4 pb-4 sm:px-6 sm:pb-6 text-sm sm:text-base text-secondary-600 dark:text-white/70 leading-relaxed border-t border-secondary-100 dark:border-white/5 pt-3 sm:pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* FAQ Pagination */}
            {totalFaqPages > 1 && (
              <div className="flex justify-center gap-2 mt-8 sm:mt-12">
                {[...Array(totalFaqPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFaqPage(i + 1)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${faqPage === i + 1
                      ? 'bg-secondary-900 dark:bg-white text-white dark:text-black shadow-lg scale-110'
                      : 'bg-white dark:bg-white/5 text-secondary-600 dark:text-white/60 hover:bg-secondary-100 dark:hover:bg-white/10'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              className="relative bg-white dark:bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-8 sm:p-16 text-center border border-secondary-200 dark:border-white/10 overflow-hidden shadow-2xl dark:shadow-none"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-50/50 dark:from-white/10 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />

              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-6 tracking-tight text-secondary-900 dark:text-white">
                    Start Your Journey
                  </h2>
                  <p className="text-base sm:text-xl text-secondary-600 dark:text-white/60 mb-6 sm:mb-10 max-w-2xl mx-auto font-light">
                    Join 10,000+ professionals building their future with AI-powered resumes.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(255,255,255,0.5)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/login')}
                    className="group relative px-6 py-3 sm:px-12 sm:py-5 bg-secondary-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-base sm:text-lg overflow-hidden w-full sm:w-auto"
                  >
                    <div className="absolute inset-0 bg-secondary-800 dark:bg-white blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Get Started Free
                      <ArrowUpRight className="h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>


      </PublicLayout>
    </>
  )
}
