import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Scale, FileCheck, AlertCircle } from 'lucide-react'
import PublicLayout from '../components/layouts/PublicLayout'
import { SEO } from '../components/SEO'

export default function TermsPage() {
  const navigate = useNavigate()

  const sections = [
    {
      title: '1. Introduction and Acceptance of Terms',
      content: `Welcome to prativeda, India's premier career development platform owned and operated by prativeda Developers. By creating an account, accessing our services, or using any part of our platform, you ("User," "you," or "your") agree to be legally bound by these Terms and Conditions ("Terms," "Agreement").

These Terms constitute a legally binding agreement between you and prativeda regarding your use of our comprehensive platform.

prativeda reserves the right to modify these Terms at any time. Material changes will be communicated via email notification and platform announcements. Continued use of our services after such modifications constitutes acceptance of the updated Terms.`,
    },
    {
      title: '2. User Registration and Account Management',
      content: `Eligibility Requirements:

• You must be at least 13 years old to create an account
• Users between 13-17 years old must have verifiable parental or guardian consent
• Corporate accounts require authorization from an authorized representative
• International users must comply with their local laws regarding online services

Account Security and Responsibilities:

• Credential Protection: Maintain strict confidentiality of login credentials; never share passwords
• Account Monitoring: Regularly monitor your account for unauthorized access or suspicious activity
• Immediate Reporting: Report security breaches, unauthorized access, or suspicious activity within 24 hours
• Accurate Information: Provide truthful, current, and complete registration information
• Profile Updates: Keep account information updated, especially contact details for important notifications
• Single Account Policy: One account per person; multiple accounts may result in termination

prativeda may require email verification, phone number confirmation, or additional identity verification for premium services or suspicious activity prevention.`,
    },
    {
      title: '3. Comprehensive Acceptable Use Policy',
      content: `prativeda maintains a zero-tolerance policy for misuse. Users agree to engage ethically and professionally in all platform activities.

Strictly Prohibited Activities:

• Academic Dishonesty: Plagiarizing content, submitting others' work as your own
• Harassment and Discrimination: Offensive behavior based on race, gender, religion, nationality, sexual orientation, disability, or any protected characteristic
• Platform Abuse: Attempting to hack, overload, or disrupt our servers, databases, or security systems
• Content Violations: Uploading malicious code, viruses, spam, or inappropriate content including adult material
• Commercial Misuse: Using the platform for unauthorized commercial activities, solicitation, or advertising
• Intellectual Property Infringement: Violating copyrights, trademarks, or other intellectual property rights
• Account Fraud: Creating fake accounts, impersonating others, or providing false information
• System Manipulation: Exploiting bugs, using automation tools, or manipulating progress tracking systems
• Data Mining: Scraping, extracting, or harvesting platform data without explicit written permission

Users must maintain respectful discourse, provide constructive feedback, use appropriate language, and contribute positively to the environment.`,
    },
    {
      title: '4. Intellectual Property Rights and Content Ownership',
      content: `prativeda's Proprietary Content:

All educational materials, including templates, tutorials, videos, platform features, user interface design, algorithms, and branding elements are the exclusive intellectual property of prativeda and protected by Indian and international copyright laws.

Licensed Use Permissions:

• Personal Learning: Access and study content for personal skill development
• Offline Study: Download permitted materials for offline learning during subscription period
• Knowledge Application: Apply learned concepts in personal and professional projects
• Portfolio Building: Showcase projects and resumes created using our platform
• Educational Sharing: Discuss concepts learned with peers in educational contexts

Strict Usage Restrictions:

• No Redistribution: Sharing, selling, or redistributing our content through any medium
• No Commercial Use: Using our content for commercial training, workshops, or competing platforms
• No Reverse Engineering: Attempting to copy, recreate, or reverse engineer our platform features
• Attribution Requirements: Removing copyright notices, watermarks, or attribution information
• No Derivative Works: Creating unauthorized derivative works or adaptations for commercial purposes

User-Generated Content Policy: When you submit content, you retain ownership of your original work but grant prativeda a perpetual, royalty-free license to display and use your submissions for platform improvement and promotional activities (anonymized where appropriate).`,
    },
    {
      title: '5. Subscription Plans and Payment Terms',
      content: `Service Tiers:

• Free Tier: Access to basic templates and features
• Premium Plans: Full access to all templates, advanced AI tools, and priority support
• Enterprise Solutions: Custom pricing for institutions and corporate programs

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
      title: '6. Community Guidelines',
      content: `prativeda fosters an inclusive, supportive community. All users must contribute to maintaining this environment through respectful engagement.

Community Participation Standards:

• Respectful Interaction: Treat all community members with dignity
• Constructive Feedback: Provide helpful, specific feedback
• Knowledge Sharing: Share insights, resources, and experiences
• Professional Communication: Use appropriate language in all discussions
• Cultural Sensitivity: Respect diverse backgrounds and cultures`,
    },
    {
      title: '7. Content Submission Guidelines',
      content: `Original Work Requirements:

• Authenticity: All submitted content must be your original work or properly attributed
• License Compliance: Respect open-source licenses and attribution requirements

Content Quality and Safety Standards:

• No Malicious Content: Submissions must not contain viruses, malware, or harmful scripts
• Security Awareness: Avoid exposing sensitive information like personal data
• Performance Considerations: Ensure submissions don't consume excessive system resources`,
    },
    {
      title: '8. Platform Availability and Technical Support',
      content: `Service Level Commitments:

• Uptime Target: 99.5% platform availability with minimal planned downtime
• Maintenance Windows: Scheduled maintenance announced 48 hours in advance
• Emergency Maintenance: Immediate action for security vulnerabilities or critical issues
• Performance Monitoring: Continuous monitoring of platform performance and user experience

Support Services:

• Free Users: Email support (48-72 hour response)
• Premium Users: Priority email support (24-48 hour response)
• Technical Issues: Platform bugs, payment problems, and account access issues receive priority attention

Planned Updates and Features: prativeda continuously evolves with new features and improvements.`,
    },
    {
      title: '9. Account Termination and Data Retention',
      content: `User-Initiated Account Closure:

• Self-Service Deletion: Users can delete accounts through settings with immediate effect
• Data Export: Download personal data and resume history before deletion
• Subscription Cancellation: Active subscriptions must be cancelled separately before account deletion
• Irreversible Process: Account deletion is permanent and cannot be undone

Platform-Initiated Termination: prativeda reserves the right to suspend or terminate accounts for violations of these Terms.

Data Retention Policy: Upon account termination, personal data is deleted within 30 days, except for anonymized usage statistics retained for platform improvement.`,
    },
    {
      title: '10. Disclaimers and Limitation of Liability',
      content: `Purpose Disclaimer: prativeda provides tools for career development. We make no guarantees regarding:
• Employment Outcomes: Job placement, salary increases, or career advancement
• Acceptance: Recognition by specific employers or ATS systems
• Individual Results: Outcomes vary based on effort and application

Technical Disclaimers:
• Content Accuracy: While we strive for accuracy, industry standards evolve rapidly
• Third-Party Integration: Payment processors and other integrated services are governed by their respective terms
• Browser Compatibility: Platform optimized for modern browsers
• Mobile Experience: Full functionality may vary on mobile devices

Liability Limitations: prativeda's total liability for any claims related to these Terms or platform usage is limited to the amount paid for services in the 12 months preceding the claim. We are not liable for:
• Indirect, incidental, or consequential damages
• Lost profits, data, or business opportunities
• Third-party actions or content
• Force majeure events beyond our reasonable control`,
    },
    {
      title: '11. Privacy and Data Protection',
      content: `Your privacy is paramount to us. prativeda adheres to strict data protection standards and Indian privacy laws. Our comprehensive Privacy Policy details how we collect, use, store, and protect your personal information.

Data Processing Consent: By using our platform, you consent to our data practices as outlined in our Privacy Policy.

International Users: Users outside India acknowledge that their data may be processed in India in accordance with Indian data protection laws and our Privacy Policy.`,
    },
    {
      title: '12. Governing Law and Dispute Resolution',
      content: `Jurisdiction and Applicable Law: These Terms are governed by the laws of India. Any disputes arising from or relating to these Terms or your use of prativeda shall be subject to the exclusive jurisdiction of courts in Hyderabad, Telangana, India.

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
Email: support-prativeda@codetapasya.com
Address: prativeda, Hyderabad, Telangana, India
Response Timeline: We aim to respond within 7 working days as per Indian law.
Response Times: We aim to respond to all inquiries within 48 hours during business days.`,
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
    <>
      <SEO
        title="Terms of Service - Prativeda"
        description="Review our terms of service for using Prativeda resume builder and portfolio tools."
        url="https://prativeda.codetapasya.com/terms"
      />
      <PublicLayout>
      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 md:pt-40 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 tracking-tight">
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
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16 sm:mb-20 max-w-4xl mx-auto"
          >
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 text-center"
              >
                <div className="p-3 bg-white rounded-lg mb-4 w-fit mx-auto">
                  <highlight.icon className="h-6 w-6 text-black" />
                </div>
                <h3 className="font-bold mb-2 text-lg sm:text-xl">{highlight.title}</h3>
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
            <div className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-6 sm:p-12 border border-white/10">
              <div className="space-y-8 sm:space-y-12">
                {sections.map((section, index) => (
                  <div key={index}>
                    <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{section.title}</h2>
                    <p className="text-white/70 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                      {section.content}
                    </p>
                  </div>
                ))}

                <div className="pt-8 border-t border-white/10">
                  <h2 className="text-xl sm:text-2xl font-bold mb-4">Contact Information</h2>
                  <p className="text-white/70 leading-relaxed text-sm sm:text-base">
                    If you have any questions about these Terms of Service, please contact us at:
                  </p>
                  <div className="mt-4 space-y-2 text-white/70 text-sm sm:text-base">
                    <p>Email: legal-prativeda@codetapasya.com</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10">
                  <p className="text-white/50 text-xs sm:text-sm">
                    By using prativeda, you acknowledge that you have read, understood, and agree to be
                    bound by these Terms of Service.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
    </>
  )
}
