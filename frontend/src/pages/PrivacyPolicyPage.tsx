import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FileText, Shield, Lock, Eye, Database, UserCheck } from 'lucide-react'

export default function PrivacyPolicyPage() {
  const navigate = useNavigate()

  const sections = [
    {
      title: '1. Information We Collect',
      content: `CodeTapasya ("we", "our", or "us") collects information to provide you with a personalized learning experience. We collect:

• Personal Information: Name, email address, username, and profile picture when you create an account
• Learning Data: Course progress, quiz results, code submissions, and project uploads
• GitHub Integration Data: Repository information, commit history, and code contributions when you connect your GitHub account
• Usage Information: How you interact with our platform, pages visited, and features used
• Technical Information: IP address, browser type, device information, and cookies
• Payment Information: Billing details are processed securely through Razorpay. We do not store or collect card information directly. Razorpay is PCI-DSS compliant and acts as our trusted payment processor.`,
    },
    {
      title: '2. How We Use Your Information',
      content: `We use your information to:

• Provide and maintain our educational services
• Personalize your learning experience and track progress
• Facilitate code repository management and project submissions
• Process payments and manage subscriptions
• Send important updates about courses and platform changes
• Improve our platform through analytics and user feedback
• Provide customer support and respond to inquiries
• Prevent fraud and ensure platform security`,
    },
    {
      title: '3. Information Sharing and Disclosure',
      content: `We respect your privacy and will never sell your personal information. We may share your information only in these circumstances:

• Service Providers: With trusted third-party services like Firebase (authentication), Razorpay (payments), AWS (hosting), and GitHub (code repositories and project management)
• Legal Requirements: When required by law or to protect our rights and users' safety
• Business Transfers: In case of merger, acquisition, or sale of assets (users will be notified)
• With Your Consent: When you explicitly agree to share information`,
    },
    {
      title: '4. Data Security',
      content: `We implement industry-standard security measures to protect your information:

• Encryption of data in transit and at rest
• Secure authentication through Firebase
• OAuth-based secure integration with GitHub
• Regular security audits and updates
• Limited access to personal data by employees
• Secure payment processing through PCI-compliant providers`,
    },
    {
      title: '5. Cookies and Tracking',
      content: `We use cookies and similar technologies to enhance your experience:

• Essential Cookies: Required for platform functionality and user authentication
• Analytics Cookies: Help us understand how users interact with our platform
• Preference Cookies: Remember your settings and preferences

We use both session and persistent cookies, and third-party tools like Google Analytics, Firebase, and GitHub OAuth. These help track user behavior, preferences, and session activity.

You can control cookies through your browser settings, but disabling them may affect platform functionality.`,
    },
    {
      title: '6. Your Rights and Choices',
      content: `You have the following rights regarding your personal information:

• Access: Request a copy of your personal data
• Correction: Update or correct inaccurate information
• Deletion: Request deletion of your account and associated data
• Portability: Export your learning data
• GitHub Disconnect: Remove GitHub integration and associated data at any time
• Opt-out: Unsubscribe from marketing communications

To exercise these rights, please contact us at privacy@codetapasya.com`,
    },
    {
      title: '7. Rights Under GDPR (For EU Users)',
      content: `If you are located in the European Union, you have the following additional rights:

• Right to Object: You may object to how we process your data
• Right to Restrict Processing: You may ask us to limit how we use your data
• Right to Lodge Complaint: You may lodge a complaint with your local data protection authority
• Legal Basis: We process your data based on consent, contracts, legal obligations, or our legitimate interest`,
    },
    {
      title: '8. Children\'s Privacy',
      content: `CodeTapasya is designed for users aged 13 and above. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will delete the information immediately.`,
    },
    {
      title: '9. International Data Transfers',
      content: `Your information may be transferred to and stored on servers located outside your country of residence, such as in India, AWS regions, or GitHub's global infrastructure. We implement contractual safeguards like Standard Contractual Clauses (SCCs) and technical protections to ensure your data remains secure during such transfers.`,
    },
    {
      title: '10. Data Retention',
      content: `We retain your personal information only as long as necessary to provide our services and comply with legal obligations. Learning progress and course data are retained until you delete your account or request removal. GitHub integration data is retained only while the connection is active.`,
    },
    {
      title: '11. Changes to This Policy',
      content: `We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify users of significant changes via email or platform notifications. Continued use of CodeTapasya after changes constitutes acceptance of the updated policy.`,
    },
    {
      title: '12. Contact Us',
      content: `If you have questions about this Privacy Policy or our data practices, please contact us:

Email: privacy@codetapasya.com
Support: support@codetapasya.com
Address: CodeTapasya, Hyderabad, Telangana, India`,
    },
    {
      title: '13. Grievance Officer (India – DPDPB Compliance)',
      content: `In accordance with the Digital Personal Data Protection Act (DPDPB), you may contact our designated Grievance Officer for data protection concerns:

Grievance Officer: Pranay Jumbarthi
Email: support@codetapasya.com
Address: CodeTapasya, Hyderabad, Telangana, India
Response Timeline: We aim to respond within 7 working days as per Indian law.`,
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
