import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Send, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import PublicLayout from '../components/layouts/PublicLayout'

export default function ContactPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
      await axios.post(`${API_URL}/contact/`, formData)
      toast.success('Message sent successfully! We will get back to you soon.')
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight text-secondary-900 dark:text-white">
              Get in Touch
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-secondary-600 dark:text-white/60 max-w-3xl mx-auto font-light">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>

          {/* Centered Contact Form */}
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-6 sm:p-12 border border-secondary-200 dark:border-white/10 shadow-lg dark:shadow-none"
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-secondary-900 dark:text-white">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-secondary-900 dark:text-gray-300">Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-secondary-50 dark:bg-white/10 border border-secondary-300 dark:border-white/20 rounded-lg focus:outline-none focus:border-secondary-500 dark:focus:border-white/40 transition-colors text-sm sm:text-base text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-white/40"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-secondary-900 dark:text-gray-300">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-secondary-50 dark:bg-white/10 border border-secondary-300 dark:border-white/20 rounded-lg focus:outline-none focus:border-secondary-500 dark:focus:border-white/40 transition-colors text-sm sm:text-base text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-white/40"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-secondary-900 dark:text-gray-300">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-secondary-50 dark:bg-white/10 border border-secondary-300 dark:border-white/20 rounded-lg focus:outline-none focus:border-secondary-500 dark:focus:border-white/40 transition-colors text-sm sm:text-base text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-white/40"
                    placeholder="What's this about?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-secondary-900 dark:text-gray-300">Message</label>
                  <textarea
                    rows={6}
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-secondary-50 dark:bg-white/10 border border-secondary-300 dark:border-white/20 rounded-lg focus:outline-none focus:border-secondary-500 dark:focus:border-white/40 transition-colors resize-none text-sm sm:text-base text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-white/40"
                    placeholder="Tell us more..."
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(255,255,255,0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 sm:py-4 bg-secondary-900 dark:bg-white text-white dark:text-black rounded-lg font-semibold flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
