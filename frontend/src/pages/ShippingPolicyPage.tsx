import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FileText, Truck, Package, Globe, Clock, Smartphone } from 'lucide-react'

export default function ShippingPolicyPage() {
    const navigate = useNavigate()

    const sections = [
        {
            title: '1. Digital Services Only',
            content: `CodeTapasya is primarily a digital learning platform that provides online coding courses, tutorials, and educational content. Currently, we do not offer physical products that require shipping.

All our services are delivered digitally through our online platform, including:

• Online coding courses and tutorials
• Interactive coding playground access
• Digital certificates and badges
• Premium feature access
• Community forum participation`,
        },
        {
            title: '2. Instant Digital Delivery',
            content: `Upon successful payment and account verification:

• Immediate Access: Premium features are activated instantly
• Course Materials: Available immediately after subscription
• Digital Certificates: Generated upon course completion
• Account Upgrades: Processed within minutes`,
        },
        {
            title: '3. Future Physical Products',
            content: `While we currently focus on digital services, CodeTapasya may introduce physical products in the future, such as:

• Branded merchandise (t-shirts, stickers, mugs)
• Printed coding reference materials
• Hardware kits for programming projects
• Books and study guides`,
        },
        {
            title: '4. Shipping Policy for Future Physical Products',
            content: `4.1 Shipping Coverage
When we introduce physical products, we plan to offer:
• Domestic Shipping: All major cities and towns in India
• International Shipping: Select countries (to be announced)
• Remote Areas: May require additional handling time

4.2 Estimated Delivery Times
• Metro Cities: 2-3 business days
• Tier 2 Cities: 3-5 business days
• Rural Areas: 5-7 business days
• International: 7-14 business days

4.3 Shipping Charges
• Free Shipping: Orders above ₹500 within India
• Standard Shipping: ₹50-100 depending on location
• Express Shipping: ₹150-200 for next-day delivery
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
• Delivery attempts during business hours (9 AM - 7 PM)
• SMS/Email notifications before delivery
• Signature required for valuable items
• Safe drop-off options available

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
            content: `When we launch physical products, we plan to partner with:

• Domestic: BlueDart, DTDC, India Post, Delhivery
• International: DHL, FedEx, UPS
• Last Mile: Local courier services for remote areas`,
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
• Insurance coverage for high-value items
• Full refund if replacement not possible`,
        },
        {
            title: '10. Contact Information for Shipping',
            content: `For shipping-related queries (when applicable):

• Support: support@codetapasya.com
• Track Orders: Available through account dashboard
• Customer Service: Available during business hours`,
        },
        {
            title: '11. Governing Law and Jurisdiction',
            content: `This Shipping Policy shall be governed by and interpreted in accordance with the laws of India. Any disputes relating to shipping or delivery shall be subject to the exclusive jurisdiction of the courts located in Hyderabad, Telangana, India.

🔔 Important Notice: As of June 2025, CodeTapasya offers only digital services with no physical product shipping. This Shipping Policy is published in anticipation of future product offerings. Users will be notified when physical merchandise becomes available.`,
        },
    ]

    const highlights = [
        {
            icon: Smartphone,
            title: 'Digital Delivery',
            description: 'Instant access to all courses and features.',
        },
        {
            icon: Globe,
            title: 'Global Access',
            description: 'Learn from anywhere in the world.',
        },
        {
            icon: Clock,
            title: 'Instant',
            description: 'Start learning immediately after purchase.',
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
                            Shipping Policy
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
                                        For shipping-related queries, please contact us at:
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
