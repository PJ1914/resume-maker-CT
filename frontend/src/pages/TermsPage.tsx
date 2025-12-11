import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FileText, Scale, FileCheck, AlertCircle } from 'lucide-react'

export default function TermsPage() {
  const navigate = useNavigate()

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By accessing and using prativeda ("Service"), you accept and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.

These Terms apply to all users, including visitors, registered users, and premium subscribers.`,
    },
    {
      title: '2. Description of Service',
      content: `prativeda provides an AI-powered resume building platform that includes:

• Resume creation and editing tools
• ATS (Applicant Tracking System) scoring
• Professional LaTeX templates
• PDF export functionality
• AI-powered content suggestions
• Version control and storage

We reserve the right to modify, suspend, or discontinue any part of the Service at any time.`,
    },
    {
      title: '3. User Accounts',
      content: `Account Creation:
• You must provide accurate and complete information
• You must be at least 16 years old to use the Service
• One person or entity may maintain only one account
• You are responsible for maintaining account security

Account Termination:
• We may suspend or terminate accounts that violate these Terms
• You may close your account at any time through account settings
• Upon termination, your right to use the Service ceases immediately`,
    },
    {
      title: '4. User Content',
      content: `You retain ownership of all content you create using our Service, including resumes and personal information.

By using our Service, you grant us a limited license to:
• Store and process your content to provide the Service
• Display your content back to you
• Make backups for service reliability
• Improve our AI and algorithms (using anonymized data only)

You represent that:
• You own or have rights to all content you upload
• Your content does not violate any laws or third-party rights
• Your content is accurate and not misleading`,
    },
    {
      title: '5. Prohibited Uses',
      content: `You agree NOT to:

• Use the Service for any illegal purpose
• Violate any laws or regulations
• Infringe on intellectual property rights
• Upload malicious code or viruses
• Attempt to gain unauthorized access to our systems
• Scrape, data mine, or reverse engineer the Service
• Impersonate others or provide false information
• Spam, harass, or abuse other users
• Resell or redistribute our Service without permission`,
    },
    {
      title: '6. Intellectual Property',
      content: `Service Ownership:
• The Service, including all code, designs, and content, is owned by prativeda
• Our trademarks, logos, and brand features are protected
• You may not use our intellectual property without written permission

Third-Party Content:
• Some templates and features may include third-party content
• Such content is subject to the respective owners' terms`,
    },
    {
      title: '7. Payment and Subscriptions',
      content: `Billing:
• Subscription fees are billed in advance on a monthly or annual basis
• All fees are in US dollars unless otherwise stated
• We use Stripe for secure payment processing

Refunds:
• Free trial periods do not require payment information
• Refunds may be provided at our discretion
• No refunds for partial subscription periods

Cancellation:
• You may cancel your subscription at any time
• Cancellation takes effect at the end of the current billing period
• Access to premium features ends upon cancellation`,
    },
    {
      title: '8. Disclaimers',
      content: `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.

We do not guarantee:
• Uninterrupted or error-free service
• That resumes created will result in job offers
• Specific ATS pass rates for individual resumes
• That AI suggestions will be accurate or suitable

You use the Service at your own risk.`,
    },
    {
      title: '9. Limitation of Liability',
      content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW:

• We are not liable for indirect, incidental, or consequential damages
• Our total liability is limited to the amount you paid in the last 12 months
• We are not responsible for lost data, profits, or opportunities

Some jurisdictions do not allow these limitations, so they may not apply to you.`,
    },
    {
      title: '10. Indemnification',
      content: `You agree to indemnify and hold prativeda harmless from any claims, damages, or expenses arising from:

• Your use of the Service
• Your violation of these Terms
• Your violation of any third-party rights
• Content you upload or create`,
    },
    {
      title: '11. Changes to Terms',
      content: `We may modify these Terms at any time. Changes will be effective immediately upon posting to our website. Your continued use of the Service constitutes acceptance of the modified Terms.

For material changes, we will provide notice through:
• Email notification
• In-app announcement
• Website banner`,
    },
    {
      title: '12. Governing Law',
      content: `These Terms are governed by the laws of the State of California, United States, without regard to conflict of law provisions.

Any disputes will be resolved through binding arbitration in San Francisco, California, except that you may assert claims in small claims court.`,
    },
  ]

  const highlights = [
    {
      icon: Scale,
      title: 'Fair Terms',
      description: 'Clear and balanced terms that protect both parties.',
    },
    {
      icon: FileCheck,
      title: 'Your Rights',
      description: 'You retain full ownership of your resume content.',
    },
    {
      icon: AlertCircle,
      title: 'Transparency',
      description: 'No hidden clauses or surprise terms.',
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
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-base sm:text-lg text-white/60 max-w-3xl mx-auto font-light">
              Last Updated: December 10, 2025
            </p>
          </motion.div>

          {/* Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="grid md:grid-cols-3 gap-6 mb-20 max-w-4xl mx-auto"
          >
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 text-center"
              >
                <div className="p-3 bg-white rounded-lg mb-4 w-fit mx-auto">
                  <highlight.icon className="h-6 w-6 text-black" />
                </div>
                <h3 className="font-bold mb-2">{highlight.title}</h3>
                <p className="text-white/60 text-sm">{highlight.description}</p>
              </div>
            ))}
          </motion.div>

          {/* Terms Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 sm:p-12 border border-white/10">
              <div className="space-y-12">
                {sections.map((section, index) => (
                  <div key={index}>
                    <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                    <p className="text-white/70 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                ))}

                <div className="pt-8 border-t border-white/10">
                  <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
                  <p className="text-white/70 leading-relaxed">
                    If you have any questions about these Terms of Service, please contact us at:
                  </p>
                  <div className="mt-4 space-y-2 text-white/70">
                    <p>Email: legal@prativeda.com</p>
                    <p>Address: 123 Innovation Drive, San Francisco, CA 94105</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10">
                  <p className="text-white/50 text-sm">
                    By using prativeda, you acknowledge that you have read, understood, and agree to be
                    bound by these Terms of Service.
                  </p>
                </div>
              </div>
            </div>
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
