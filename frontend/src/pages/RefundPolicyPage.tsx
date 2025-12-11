import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FileText, Shield, CreditCard, RefreshCw, AlertCircle } from 'lucide-react'

export default function RefundPolicyPage() {
    const navigate = useNavigate()

    const sections = [
        {
            title: '1. Our Commitment to Quality',
            content: `At CodeTapasya, we strive to provide high-quality educational content and tools for developers. We understand that sometimes our services may not meet your expectations, and we are committed to resolving any issues fairly and promptly.

This policy outlines the terms and conditions for refunds and cancellations for all CodeTapasya services, including subscription plans and premium content access.`,
        },
        {
            title: '2. Subscription Plans Overview',
            content: `Free Plan: Always free with access to blogs, sample projects, and community features.

Premium Plans:

• Monthly Plan: ₹99/month - 30-day access to all courses and premium features
• Yearly Plan: ₹799/year - 12-month access with additional benefits`,
        },
        {
            title: '3. Cancellation Policy',
            content: `How to Cancel:

• Log into your CodeTapasya account
• Go to Account Settings → Subscription Management
• Click "Cancel Subscription" and follow the prompts
• You will receive a confirmation email

Cancellation Effects:

• Your subscription will remain active until the end of the current billing period
• You will continue to have access to premium content until expiration
• Auto-renewal will be disabled
• You can reactivate your subscription at any time
• Your learning progress and certificates will be preserved`,
        },
        {
            title: '4. Refund Eligibility',
            content: `We offer refunds under the following circumstances:

4.1 Technical Issues
• Inability to access purchased content due to verified platform-side technical issues not caused by the user's internet or device
• Significant functionality problems preventing course completion
• Payment processing errors resulting in duplicate charges

4.2 Content Quality Issues
• Course content significantly different from description
• Incomplete or corrupted course materials
• Outdated content that doesn't match current technology standards

4.3 Service Interruption
• Extended platform downtime (more than 48 hours)
• Permanent discontinuation of a purchased course
• Inability to provide promised features or support`,
        },
        {
            title: '5. Refund Limitations',
            content: `Refunds will NOT be granted in the following cases:

• Content Consumption: If you have completed more than 20% of purchased course content
• Time Limit: Refund requests made more than 7 days after purchase
• Change of Mind: Simple change of mind without valid technical or quality issues
• Violation of Terms: Account suspension or termination due to Terms violation
• Free Content: Issues with free features or content
• Third-party Issues: Problems caused by user's internet, device, or browser
• Completed Courses: Courses that have been fully completed with certificates issued

We reserve the right to deny refund requests that do not meet the eligibility criteria or where abuse of the refund system is suspected.`,
        },
        {
            title: '6. Refund Process',
            content: `Step 1: Contact Support
Before requesting a refund, please contact our support team at support@codetapasya.com with:
• Your account email and username
• Transaction ID or payment reference
• Detailed description of the issue
• Screenshots or error messages (if applicable)

Step 2: Issue Resolution
Our team will attempt to resolve the issue within 24-48 hours. Many problems can be fixed without requiring a refund.

Step 3: Refund Approval
If the issue cannot be resolved, we will review your case and approve eligible refunds within 3-5 business days.`,
        },
        {
            title: '7. Refund Processing Time',
            content: `• Credit/Debit Cards: 5-7 business days
• UPI/Net Banking: 3-5 business days
• Digital Wallets: 2-4 business days
• Bank Transfers: 7-10 business days

Refund processing times may vary depending on your bank or payment provider. CodeTapasya is not responsible for delays caused by financial institutions.`,
        },
        {
            title: '8. Partial Refunds',
            content: `In certain cases, we may offer partial refunds:

• Temporary service disruptions affecting part of subscription period
• Partial completion of courses due to technical issues
• Prorated refunds for annual subscriptions cancelled within the first month`,
        },
        {
            title: '9. Alternative Solutions',
            content: `Before processing refunds, we may offer alternative solutions:

• Account Credit: Store credit for future purchases
• Course Transfer: Access to equivalent or upgraded courses
• Extended Access: Additional time to complete courses
• Technical Support: One-on-one assistance to resolve issues`,
        },
        {
            title: '10. Dispute Resolution',
            content: `If you are not satisfied with our refund decision:

• Contact our escalation team at support@codetapasya.com
• Provide additional evidence or documentation
• Request a second review of your case
• We will respond within 5-7 business days`,
        },
        {
            title: '11. Payment Gateway Policies',
            content: `All payments are processed through Razorpay, which is PCI DSS compliant. For payment-related disputes:

• Failed transactions are automatically refunded within 5-7 business days
• Duplicate charges will be refunded immediately upon verification
• Bank charges for refunds are borne by the payment gateway, not the user`,
        },
        {
            title: '12. Contact Information',
            content: `For refund requests or questions about this policy:

• Support: support@codetapasya.com
• Phone Support: Currently not available. Please raise a ticket through our support system or email us.
• Response Time: 24-48 hours for initial response`,
        },
        {
            title: '13. Legal Jurisdiction',
            content: `This Refund & Cancellation Policy shall be governed by the laws of India. Any disputes relating to refunds shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana, India. By using our services, you agree to comply with this jurisdiction clause.`,
        },
    ]

    const highlights = [
        {
            icon: Shield,
            title: 'Quality Guarantee',
            description: 'We stand behind our educational content.',
        },
        {
            icon: RefreshCw,
            title: 'Fair Refunds',
            description: 'Clear eligibility criteria for refunds.',
        },
        {
            icon: CreditCard,
            title: 'Secure Payments',
            description: 'Processed securely via Razorpay.',
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
                            Refund & Cancellation Policy
                        </h1>
                        <p className="text-base sm:text-lg text-white/60 max-w-3xl mx-auto font-light">
                            Effective Date: June 27, 2025
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
                                    <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
                                    <p className="text-white/70 leading-relaxed">
                                        If you have any questions about this Refund Policy, please contact us at:
                                    </p>
                                    <div className="mt-4 space-y-2 text-white/70">
                                        <p>Email: support@codetapasya.com</p>
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
