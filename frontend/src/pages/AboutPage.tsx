import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FileText, Target, Users, Zap, Heart } from 'lucide-react'
import PublicLayout from '../components/layouts/PublicLayout'

export default function AboutPage() {
  const navigate = useNavigate()

  const values = [
    {
      icon: Target,
      title: 'Mission Driven',
      description: 'Empowering job seekers with AI-powered tools to land their dream careers.',
    },
    {
      icon: Users,
      title: 'User Focused',
      description: 'Every feature is designed with your success in mind.',
    },
    {
      icon: Zap,
      title: 'Innovation First',
      description: 'Leveraging cutting-edge AI to stay ahead of industry trends.',
    },
    {
      icon: Heart,
      title: 'Passion Fueled',
      description: 'We love what we do and it shows in every detail.',
    },
  ]

  const stats = [
    { value: '10,000+', label: 'Active Users' },
    { value: '50,000+', label: 'Resumes Created' },
    { value: '95%', label: 'ATS Pass Rate' },
    { value: '4.9/5', label: 'User Rating' },
  ]

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 md:pt-40 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 sm:mb-20"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              About prativeda
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/60 max-w-3xl mx-auto font-light">
              We're on a mission to revolutionize how professionals create resumes with the power of artificial intelligence.
            </p>
          </motion.div>

          {/* Story Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="max-w-4xl mx-auto mb-16 sm:mb-20"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-6 sm:p-12 border border-white/10">
              <h2 className="text-2xl sm:text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">Our Story</h2>
              <div className="space-y-4 text-white/70 leading-relaxed text-sm sm:text-base">
                <p>
                  prativeda was born from a simple observation: job seekers were spending countless hours
                  formatting resumes, only to have them rejected by Applicant Tracking Systems (ATS) before
                  a human ever saw them.
                </p>
                <p>
                  We knew there had to be a better way. Combining our expertise in artificial intelligence,
                  LaTeX typesetting, and user experience design, we created a platform that not only makes
                  resumes beautiful but ensures they pass through ATS filters with flying colors.
                </p>
                <p>
                  Today, thousands of professionals trust prativeda to help them land their dream jobs.
                  We're proud to have helped our users secure positions at companies like Google, Microsoft,
                  Amazon, and countless startups around the world.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-20"
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-xl rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 text-center"
              >
                <div className="text-2xl sm:text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">{stat.value}</div>
                <div className="text-white/60 text-xs sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Values Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="mb-16 sm:mb-20"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="p-3 bg-white rounded-lg mb-4 w-fit">
                    <value.icon className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Team Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-2xl sm:text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">Join Our Journey</h2>
            <p className="text-white/60 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
              We're a team of engineers, designers, and career experts passionate about helping people
              achieve their professional goals. Want to be part of our mission?
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255,255,255,0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/contact')}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-white text-black rounded-lg font-semibold text-sm sm:text-base"
            >
              Get in Touch
            </motion.button>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  )
}
