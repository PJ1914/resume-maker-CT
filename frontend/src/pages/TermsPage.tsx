import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FileText, Scale, FileCheck, AlertCircle } from 'lucide-react'

export default function TermsPage() {
  const navigate = useNavigate()

  const sections = [
    {
      title: '1. Introduction and Acceptance of Terms',
      content: `Welcome to CodeTapasya, India's premier coding education platform owned and operated by CodeTapasya Developers. By creating an account, accessing our services, or using any part of our platform, you ("User," "you," or "your") agree to be legally bound by these Terms and Conditions ("Terms," "Agreement").

These Terms constitute a legally binding agreement between you and CodeTapasya regarding your use of our comprehensive learning platform, including but not limited to:

• Interactive Courses: Project-based programming courses in Python, JavaScript, Web Development, Data Science, and Machine Learning
• Code Playground: Browser-based coding environment with multi-language support and instant feedback
• GitHub Integration: Portfolio building and assignment submission through GitHub connectivity
• Assessment System: Interactive quizzes, coding challenges, and progress tracking
• Community Features: Discussion forums, peer collaboration, and mentorship programs
• CodeTapasya AI: AI Assistant for instant coding help and learning guidance
• Premium Services: Advanced features, priority support, and exclusive content

CodeTapasya reserves the right to modify these Terms at any time. Material changes will be communicated via email notification and platform announcements. Continued use of our services after such modifications constitutes acceptance of the updated Terms.`,
    },
    {
      title: '2. User Registration and Account Management',
      content: `Eligibility Requirements:

• You must be at least 13 years old to create an account
• Users between 13-17 years old must have verifiable parental or guardian consent
• Corporate accounts require authorization from an authorized representative
• International users must comply with their local laws regarding online education services

Account Security and Responsibilities:

• Credential Protection: Maintain strict confidentiality of login credentials; never share passwords
• Account Monitoring: Regularly monitor your account for unauthorized access or suspicious activity
• Immediate Reporting: Report security breaches, unauthorized access, or suspicious activity within 24 hours
• Accurate Information: Provide truthful, current, and complete registration information
• Profile Updates: Keep account information updated, especially contact details for important notifications
• Single Account Policy: One account per person; multiple accounts may result in termination

CodeTapasya may require email verification, phone number confirmation, or additional identity verification for premium services or suspicious activity prevention.`,
    },
    {
      title: '3. Comprehensive Acceptable Use Policy',
      content: `CodeTapasya maintains a zero-tolerance policy for misuse. Users agree to engage ethically and professionally in all platform activities.

Strictly Prohibited Activities:

• Academic Dishonesty: Plagiarizing code, submitting others' work as your own, or using unauthorized assistance in assessments
• Harassment and Discrimination: Offensive behavior based on race, gender, religion, nationality, sexual orientation, disability, or any protected characteristic
• Platform Abuse: Attempting to hack, overload, or disrupt our servers, databases, or security systems
• Content Violations: Uploading malicious code, viruses, spam, or inappropriate content including adult material
• Commercial Misuse: Using the platform for unauthorized commercial activities, solicitation, or advertising
• Intellectual Property Infringement: Violating copyrights, trademarks, or other intellectual property rights
• Account Fraud: Creating fake accounts, impersonating others, or providing false information
• System Manipulation: Exploiting bugs, using automation tools, or manipulating progress tracking systems
• Data Mining: Scraping, extracting, or harvesting platform data without explicit written permission

Users must maintain respectful discourse, provide constructive feedback, use appropriate language, and contribute positively to the learning environment.`,
    },
    {
      title: '4. Intellectual Property Rights and Content Ownership',
      content: `CodeTapasya's Proprietary Content:

All educational materials, including courses, tutorials, videos, quizzes, coding challenges, platform features, user interface design, algorithms, and branding elements are the exclusive intellectual property of CodeTapasya and protected by Indian and international copyright laws.

Licensed Use Permissions:

• Personal Learning: Access and study content for personal skill development
• Offline Study: Download permitted materials for offline learning during subscription period
• Knowledge Application: Apply learned concepts in personal and professional projects
• Portfolio Building: Showcase projects created using knowledge gained from our courses
• Educational Sharing: Discuss concepts learned with peers in educational contexts

Strict Usage Restrictions:

• No Redistribution: Sharing, selling, or redistributing our content through any medium
• No Commercial Use: Using our content for commercial training, workshops, or competing platforms
• No Reverse Engineering: Attempting to copy, recreate, or reverse engineer our platform features
• Attribution Requirements: Removing copyright notices, watermarks, or attribution information
• No Derivative Works: Creating unauthorized derivative works or adaptations for commercial purposes

User-Generated Content Policy: When you submit code, projects, comments, or participate in discussions, you retain ownership of your original work but grant CodeTapasya a perpetual, royalty-free license to display, modify, and use your submissions for educational purposes, platform improvement, and promotional activities.`,
    },
    {
      title: '5. Subscription Plans and Payment Terms',
      content: `Service Tiers:

• Free Tier (Permanent): Access to blogs, sample projects, community forums, and basic playground features
• Monthly Premium: ₹99/month - Full access to all courses, advanced playground features, priority support, and progress analytics
• Annual Premium: ₹799/year - All monthly benefits plus early access to new courses, exclusive workshops, and enhanced community features
• Enterprise Solutions: Custom pricing for institutions, schools, and corporate training programs

Payment Processing and Billing:

• Secure Processing: All payments processed through Razorpay with bank-grade security
• Auto-Renewal: Subscriptions automatically renew unless cancelled before the next billing cycle
• Currency: All prices displayed in Indian Rupees (INR) including applicable GST and taxes
• Payment Methods: Credit cards, debit cards, UPI, net banking, and digital wallets accepted
• Failed Payments: Service may be suspended for failed payments; 7-day grace period provided
• Price Changes: 30-day advance notice for any subscription price modifications

Subscription Management: Users can upgrade, downgrade, or cancel subscriptions through account settings. Changes take effect at the next billing cycle unless otherwise specified.

Refunds: Refunds are not provided for partial use or mid-term cancellations, except as required by law`,
    },
    {
      title: '6. Community Guidelines and Learning Environment',
      content: `CodeTapasya fosters an inclusive, supportive learning community. All users must contribute to maintaining this environment through respectful engagement and constructive participation.

Community Participation Standards:

• Respectful Interaction: Treat all community members with dignity, regardless of skill level or background
• Constructive Feedback: Provide helpful, specific feedback that encourages learning and improvement
• Knowledge Sharing: Share insights, resources, and experiences that benefit the entire community
• Mentorship Culture: Support beginners and contribute to peer learning initiatives
• Professional Communication: Use appropriate language in all discussions, forums, and comments
• Cultural Sensitivity: Respect diverse backgrounds, cultures, and learning styles

Discussion Forum Guidelines: Stay on-topic, search before posting duplicate questions, provide context for coding problems, acknowledge helpful responses, and maintain confidentiality of other users' personal information.`,
    },
    {
      title: '7. Code Submission and Project Guidelines',
      content: `Original Work Requirements:

• Authenticity: All submitted code and projects must be your original work or properly attributed
• Proper Attribution: Clearly cite external libraries, frameworks, tutorials, or code snippets used
• License Compliance: Respect open-source licenses and attribution requirements
• Academic Integrity: Collaboration is encouraged, but final submissions must represent your understanding

Code Quality and Safety Standards:

• No Malicious Code: Submissions must not contain viruses, malware, or harmful scripts
• Clean Code Practices: Follow industry standards for readability, documentation, and organization
• Security Awareness: Avoid exposing sensitive information like API keys or personal data
• Performance Considerations: Ensure code submissions don't consume excessive system resources

GitHub Integration Terms: When connecting your GitHub account, you authorize CodeTapasya to access public repositories for portfolio display and assignment submission. Private repository access requires explicit permission and is used solely for educational purposes.`,
    },
    {
      title: '8. Platform Availability and Technical Support',
      content: `Service Level Commitments:

• Uptime Target: 99.5% platform availability with minimal planned downtime
• Maintenance Windows: Scheduled maintenance announced 48 hours in advance
• Emergency Maintenance: Immediate action for security vulnerabilities or critical issues
• Performance Monitoring: Continuous monitoring of platform performance and user experience

Support Services:

• Free Users: Community forums, documentation, and email support (48-72 hour response)
• Premium Users: Priority email support (24-48 hour response) and live chat during business hours
• Enterprise Users: Dedicated account management and phone support
• Technical Issues: Platform bugs, payment problems, and account access issues receive priority attention

Planned Updates and Features: CodeTapasya continuously evolves with new courses, features, and improvements. The upcoming Scode collaborative coding platform will provide real-time collaboration with AI assistance.`,
    },
    {
      title: '9. Account Termination and Data Retention',
      content: `User-Initiated Account Closure:

• Self-Service Deletion: Users can delete accounts through settings with immediate effect
• Data Export: Download personal data, certificates, and project history before deletion
• Subscription Cancellation: Active subscriptions must be cancelled separately before account deletion
• Irreversible Process: Account deletion is permanent and cannot be undone

Platform-Initiated Termination: CodeTapasya reserves the right to suspend or terminate accounts for violations of these Terms, including but not limited to:
• Severe Policy Violations: Harassment, plagiarism, or malicious activities
• Fraudulent Activity: Payment fraud, fake accounts, or unauthorized access attempts
• Repeated Minor Violations: Multiple warnings for community guideline breaches
• Legal Requirements: Court orders or regulatory compliance requirements
• Extended Inactivity: Accounts inactive for more than 2 years (with 60-day notice)

Data Retention Policy: Upon account termination, learning certificates remain valid indefinitely. Personal data is deleted within 30 days, except for anonymized usage statistics retained for platform improvement.`,
    },
    {
      title: '10. Disclaimers and Limitation of Liability',
      content: `Educational Purpose Disclaimer: CodeTapasya provides educational content for skill development purposes. While our courses are designed to be industry-relevant and comprehensive, we make no guarantees regarding:
• Employment Outcomes: Job placement, salary increases, or career advancement
• Certification Value: Recognition by specific employers or educational institutions
• Technology Currency: Rapid changes in programming languages and frameworks may affect content relevance
• Individual Results: Learning outcomes vary based on effort, prior knowledge, and application

Technical Disclaimers:
• Content Accuracy: While we strive for accuracy, programming concepts and best practices evolve rapidly
• Third-Party Integration: GitHub, payment processors, and other integrated services are governed by their respective terms
• Browser Compatibility: Platform optimized for modern browsers; legacy browser support not guaranteed
• Mobile Experience: Full functionality may vary on mobile devices

Liability Limitations: CodeTapasya's total liability for any claims related to these Terms or platform usage is limited to the amount paid for services in the 12 months preceding the claim. We are not liable for:
• Indirect, incidental, or consequential damages
• Lost profits, data, or business opportunities
• Third-party actions or content
• Force majeure events beyond our reasonable control`,
    },
    {
      title: '11. Privacy and Data Protection',
      content: `Your privacy is paramount to us. CodeTapasya adheres to strict data protection standards and Indian privacy laws. Our comprehensive Privacy Policy details how we collect, use, store, and protect your personal information.

Data Processing Consent: By using our platform, you consent to our data practices as outlined in our Privacy Policy, including:
• Learning Analytics: Progress tracking, course completion analytics, and personalized recommendations
• Platform Improvement: Anonymized usage data to enhance user experience and course effectiveness
• Communication: Educational content, platform updates, and subscription-related notifications
• Security Monitoring: Account protection and fraud prevention measures

International Users: Users outside India acknowledge that their data may be processed in India in accordance with Indian data protection laws and our Privacy Policy.`,
    },
    {
      title: '12. Governing Law and Dispute Resolution',
      content: `Jurisdiction and Applicable Law: These Terms are governed by the laws of India. Any disputes arising from or relating to these Terms or your use of CodeTapasya shall be subject to the exclusive jurisdiction of courts in Hyderabad, Telangana, India.

Dispute Resolution Process:
• Good Faith Negotiation: Initial attempt to resolve disputes through direct communication
• Mediation: If negotiation fails, disputes may be referred to mediation
• Arbitration: Final disputes resolved through arbitration under the Indian Arbitration and Conciliation Act, 2015
• Language: All proceedings conducted in English

Consumer Rights: Nothing in these Terms limits your rights as a consumer under applicable Indian consumer protection laws.`,
    },
    {
      title: '13. Contact Information and Legal Notices',
      content: `For all matters related to these Terms, please contact us through the following channels:

Grievance Officer: Pranay Jumbarthi
Email: support@codetapasya.com
Address: CodeTapasya, Hyderabad, Telangana, India
Response Timeline: We aim to respond within 7 working days as per Indian law.
Response Times: We aim to respond to all inquiries within 48 hours during business days. Legal matters may require additional processing time.`,
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
