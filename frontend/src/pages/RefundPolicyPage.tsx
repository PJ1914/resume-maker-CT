import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Shield, CreditCard, RefreshCw } from 'lucide-react'
import PublicLayout from '../components/layouts/PublicLayout'

export default function RefundPolicyPage() {
    const navigate = useNavigate()

    const sections = [
        {
            title: '1. Our Commitment to Quality',
            content: `At prativeda, we strive to provide high-quality career development tools. We understand that sometimes our services may not meet your expectations, and we are committed to resolving any issues fairly and promptly.

This policy outlines the terms and conditions for refunds and cancellations for all prativeda services, including subscription plans and premium content access.`,
        },
        {
            title: '2. Subscription Plans Overview',
            content: `Free Plan: Access to basic templates and features.

Premium Plans:

• Monthly Plan: ₹99/month - 30-day access to all templates and premium features
• Yearly Plan: ₹799/year - 12-month access with additional benefits`,
        },
        {
            title: '3. Cancellation Policy',
            content: `How to Cancel:

• Log into your prativeda account
• Go to Account Settings → Subscription Management
• Click "Cancel Subscription" and follow the prompts
• You will receive a confirmation email

Cancellation Effects:

• Your subscription will remain active until the end of the current billing period
• You will continue to have access to premium content until expiration
• Auto-renewal will be disabled
• You can reactivate your subscription at any time
• Your data will be preserved`,
        },
        {
            title: '4. Refund Eligibility',
            content: `We offer refunds under the following circumstances:

4.1 Technical Issues
• Inability to access purchased content due to verified platform-side technical issues
• Significant functionality problems preventing service usage
• Payment processing errors resulting in duplicate charges

4.2 Service Interruption
• Extended platform downtime (more than 48 hours)
• Permanent discontinuation of a purchased service
• Inability to provide promised features or support`,
        },
        {
            title: '5. Refund Limitations',
            content: `Refunds will NOT be granted in the following cases:

• Content Consumption: If you have unlocked significant premium content
• Time Limit: Refund requests made more than 7 days after purchase
• Change of Mind: Simple change of mind without valid technical or quality issues
• Violation of Terms: Account suspension or termination due to Terms violation
• Free Content: Issues with free features or content
• Third-party Issues: Problems caused by user's internet, device, or browser

We reserve the right to deny refund requests that do not meet the eligibility criteria or where abuse of the refund system is suspected.`,
        },
        {
            title: '6. Refund Process',
            content: `Step 1: Contact Support
Before requesting a refund, please contact our support team at support-prativeda@codetapasya.com with:
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

Refund processing times may vary depending on your bank or payment provider. prativeda is not responsible for delays caused by financial institutions.`,
        },
        {
            title: '8. Partial Refunds',
            content: `In certain cases, we may offer partial refunds:

• Temporary service disruptions affecting part of subscription period
• Prorated refunds for annual subscriptions cancelled within the first month`,
        },
        {
            title: '9. Alternative Solutions',
            content: `Before processing refunds, we may offer alternative solutions:

• Account Credit: Store credit for future purchases
• Extended Access: Additional time to use premium features
• Technical Support: One-on-one assistance to resolve issues`,
        },
        {
            title: '10. Dispute Resolution',
            content: `If you are not satisfied with our refund decision:

• Contact our escalation team at support-prativeda@codetapasya.com
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

• Support: support-prativeda@codetapasya.com
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

                    {/* Policy Content */}
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
                                        If you have any questions about this Refund Policy, please contact us at:
                                    </p>
                                    <div className="mt-4 space-y-2 text-white/70 text-sm sm:text-base">
                                        <p>Email: support-prativeda@codetapasya.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </PublicLayout>
    )
}
