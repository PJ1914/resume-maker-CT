import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FileText, Shield, Lock, Eye, Database, UserCheck } from 'lucide-react'

export default function PrivacyPolicyPage() {
  const navigate = useNavigate()

  const sections = [
    {
      title: '1. Information We Collect',
      content: `We collect information you provide directly to us when you create an account, build a resume, or contact us for support. This includes:
      
• Personal information (name, email, phone number)
• Resume content and work history
• Payment information (processed securely through Stripe)
• Usage data and analytics
• Device and browser information`,
    },
    {
      title: '2. How We Use Your Information',
      content: `We use the information we collect to:

• Provide, maintain, and improve our services
• Process your transactions and send related information
• Send you technical notices and support messages
• Respond to your comments and questions
• Analyze usage patterns and optimize user experience
• Detect and prevent fraud and abuse`,
    },
    {
      title: '3. Information Sharing',
      content: `We do not sell your personal information. We may share your information only in these circumstances:

• With your consent
• With service providers who assist in our operations (e.g., hosting, analytics)
• To comply with legal obligations
• To protect our rights and prevent fraud
• In connection with a business transfer or acquisition`,
    },
    {
      title: '4. Data Security',
      content: `We implement industry-standard security measures to protect your information:

• End-to-end encryption for sensitive data
• Firebase Authentication and Firestore security rules
• Regular security audits and updates
• Secure payment processing through certified providers
• Access controls and monitoring`,
    },
    {
      title: '5. Your Rights',
      content: `You have the right to:

• Access your personal information
• Correct inaccurate data
• Delete your account and data
• Export your resume data
• Opt-out of marketing communications
• Withdraw consent at any time`,
    },
    {
      title: '6. Data Retention',
      content: `We retain your information for as long as your account is active or as needed to provide services. You can request deletion of your data at any time through your account settings. Some information may be retained for legal compliance or legitimate business purposes.`,
    },
    {
      title: '7. Cookies and Tracking',
      content: `We use cookies and similar technologies to:

• Maintain your session
• Remember your preferences
• Analyze site traffic and usage
• Improve our services

You can control cookies through your browser settings.`,
    },
    {
      title: '8. International Data Transfers',
      content: `Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy and applicable laws.`,
    },
    {
      title: '9. Children\'s Privacy',
      content: `Our services are not intended for users under 16 years of age. We do not knowingly collect information from children. If you become aware that a child has provided us with personal information, please contact us.`,
    },
    {
      title: '10. Changes to This Policy',
      content: `We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. Continued use of our services constitutes acceptance of the updated policy.`,
    },
  ]

  const principles = [
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data is yours. We never sell or share your information.',
    },
    {
      icon: Lock,
      title: 'Encrypted',
      description: 'End-to-end encryption keeps your information secure.',
    },
    {
      icon: Eye,
      title: 'Transparent',
      description: 'Clear policies with no hidden terms or conditions.',
    },
    {
      icon: Database,
      title: 'Compliant',
      description: 'GDPR, CCPA, and industry standards compliance.',
    },
    {
      icon: UserCheck,
      title: 'Control',
      description: 'Full control over your data with easy export and deletion.',
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
              Privacy Policy
            </h1>
            <p className="text-base sm:text-lg text-white/60 max-w-3xl mx-auto font-light">
              Last Updated: December 10, 2025
            </p>
          </motion.div>

          {/* Principles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 mb-20"
          >
            {principles.map((principle, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 text-center"
              >
                <div className="p-3 bg-white rounded-lg mb-4 w-fit mx-auto">
                  <principle.icon className="h-6 w-6 text-black" />
                </div>
                <h3 className="font-bold mb-2">{principle.title}</h3>
                <p className="text-white/60 text-sm">{principle.description}</p>
              </div>
            ))}
          </motion.div>

          {/* Policy Content */}
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
                  <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                  <p className="text-white/70 leading-relaxed">
                    If you have any questions about this Privacy Policy, please contact us at:
                  </p>
                  <div className="mt-4 space-y-2 text-white/70">
                    <p>Email: privacy@prativeda.com</p>
                    <p>Address: 123 Innovation Drive, San Francisco, CA 94105</p>
                  </div>
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
