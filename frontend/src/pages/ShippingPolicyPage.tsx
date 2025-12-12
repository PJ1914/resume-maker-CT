import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Truck, Package, Globe, Clock, Smartphone } from 'lucide-react'
import PublicLayout from '../components/layouts/PublicLayout'
import { SEO } from '../components/SEO'

export default function ShippingPolicyPage() {
    const navigate = useNavigate()

    const sections = [
        {
            title: '1. Digital Services Only',
            content: `prativeda is primarily a digital career development platform. Currently, we do not offer physical products that require shipping.

All our services are delivered digitally through our online platform, including:

• Resume templates and builder access
• AI-powered tools
• Digital downloads (PDF, etc.)
• Premium feature access`,
        },
        {
            title: '2. Instant Digital Delivery',
            content: `Upon successful payment and account verification:

• Immediate Access: Premium features are activated instantly
• Digital Downloads: Available immediately after generation
• Account Upgrades: Processed within minutes`,
        },
        {
            title: '3. Future Physical Products',
            content: `While we currently focus on digital services, prativeda may introduce physical products in the future, such as:

• Branded merchandise
• Printed career guides
• Professional accessories`,
        },
        {
            title: '4. Shipping Policy for Future Physical Products',
            content: `4.1 Shipping Coverage
When we introduce physical products, we plan to offer:
• Domestic Shipping: All major cities and towns in India
• International Shipping: Select countries (to be announced)

4.2 Estimated Delivery Times
• Metro Cities: 2-3 business days
• Tier 2 Cities: 3-5 business days
• Rural Areas: 5-7 business days
• International: 7-14 business days

4.3 Shipping Charges
• Free Shipping: Orders above ₹500 within India
• Standard Shipping: Rates depend on location
• International: Calculated based on destination and weight`,
        },
        {
            title: '5. Order Processing',
            content: `For future physical products:

• Order Confirmation: Immediate email confirmation
• Processing Time: 1-2 business days
• Packaging: Eco-friendly materials whenever possible
• Tracking: Tracking number provided via email/SMS`,
        },
        {
            title: '6. Delivery and Returns',
            content: `6.1 Delivery Process
• Delivery attempts during business hours
• SMS/Email notifications before delivery

6.2 Return Policy for Physical Products
• Return Window: 7 days from delivery
• Condition: Items must be unused and in original packaging
• Return Shipping: Customer responsibility unless item defective
• Refund Processing: 5-7 business days after return verification`,
        },
        {
            title: '7. International Shipping (Future)',
            content: `For international orders, customers should be aware of:

• Customs Duties: Customer responsibility
• Import Restrictions: Compliance with local laws
• Extended Delivery: Possible delays due to customs
• Address Accuracy: Critical for international delivery`,
        },
        {
            title: '8. Shipping Partners',
            content: `When we launch physical products, we plan to partner with reputable courier services for both domestic and international shipping.`,
        },
        {
            title: '9. Special Circumstances',
            content: `9.1 Failed Delivery Attempts
• Multiple delivery attempts (usually 3)
• Package held at local facility for 7 days
• Customer notification via SMS/email
• Return to sender if unclaimed

9.2 Damaged or Lost Packages
• Immediate replacement for damaged items
• Investigation for lost packages
• Full refund if replacement not possible`,
        },
        {
            title: '10. Contact Information for Shipping',
            content: `For shipping-related queries (when applicable):

• Support: support-prativeda@codetapasya.com
• Track Orders: Available through account dashboard
• Customer Service: Available during business hours`,
        },
        {
            title: '11. Governing Law and Jurisdiction',
            content: `This Shipping Policy shall be governed by and interpreted in accordance with the laws of India. Any disputes relating to shipping or delivery shall be subject to the exclusive jurisdiction of the courts located in Hyderabad, Telangana, India.

🔔 Important Notice: As of June 2025, prativeda offers only digital services with no physical product shipping. This Shipping Policy is published in anticipation of future product offerings. Users will be notified when physical merchandise becomes available.`,
        },
    ]

    const highlights = [
        {
            icon: Smartphone,
            title: 'Digital Delivery',
            description: 'Instant access to all features.',
        },
        {
            icon: Globe,
            title: 'Global Access',
            description: 'Accessible from anywhere in the world.',
        },
        {
            icon: Clock,
            title: 'Instant',
            description: 'Start using immediately after purchase.',
        },
    ]

    return (
        <>
            <SEO
                title="Shipping Policy - Prativeda"
                description="Learn about our digital delivery and shipping policies."
                url="https://prativeda.codetapasya.com/shipping-policy"
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
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 tracking-tight text-secondary-900 dark:text-white">
                                Shipping Policy
                            </h1>
                            <p className="text-base sm:text-lg text-secondary-600 dark:text-white/60 max-w-3xl mx-auto font-light">
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
                                    className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-secondary-200 dark:border-white/10 text-center shadow-sm dark:shadow-none"
                                >
                                    <div className="p-3 bg-secondary-900 dark:bg-white rounded-lg mb-4 w-fit mx-auto">
                                        <highlight.icon className="h-6 w-6 text-white dark:text-black" />
                                    </div>
                                    <h3 className="font-bold mb-2 text-lg sm:text-xl text-secondary-900 dark:text-white">{highlight.title}</h3>
                                    <p className="text-secondary-600 dark:text-white/60 text-sm">{highlight.description}</p>
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
                            <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-6 sm:p-12 border border-secondary-200 dark:border-white/10 shadow-lg dark:shadow-none">
                                <div className="space-y-8 sm:space-y-12">
                                    {sections.map((section, index) => (
                                        <div key={index}>
                                            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-secondary-900 dark:text-white">{section.title}</h2>
                                            <p className="text-secondary-700 dark:text-white/70 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                                                {section.content}
                                            </p>
                                        </div>
                                    ))}

                                    <div className="pt-8 border-t border-secondary-200 dark:border-white/10">
                                        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-secondary-900 dark:text-white">Contact Information</h2>
                                        <p className="text-secondary-700 dark:text-white/70 leading-relaxed text-sm sm:text-base">
                                            For shipping-related queries, please contact us at:
                                        </p>
                                        <div className="mt-4 space-y-2 text-secondary-700 dark:text-white/70 text-sm sm:text-base">
                                            <p>Email: support-prativeda@codetapasya.com</p>
                                        </div>
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
