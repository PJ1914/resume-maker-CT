import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    HelpCircle,
    Search,
    FileText,
    CreditCard,
    Settings,
    Shield,
    Zap,
    MessageCircle,
    ChevronDown,
    ChevronRight,
    Mail,
    Book,
    Video,
    ExternalLink,
    AlertCircle,
    Lightbulb
} from 'lucide-react'
import PublicLayout from '../components/layouts/PublicLayout'
import { SEO } from '../components/SEO'

export default function HelpCenterPage() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedGuide, setExpandedGuide] = useState<number | null>(null)
    const [selectedCategory, setSelectedCategory] = useState('All')

    const categories = [
        { name: 'All', icon: Book, color: 'blue' },
        { name: 'Troubleshooting', icon: AlertCircle, color: 'red' },
        { name: 'How-To Guides', icon: Lightbulb, color: 'green' },
        { name: 'Features', icon: Zap, color: 'purple' },
        { name: 'Account & Billing', icon: CreditCard, color: 'orange' }
    ]

    const helpGuides = [
        {
            category: 'Troubleshooting',
            question: 'My resume upload is failing. What should I do?',
            answer: 'Ensure your file is under 10MB and in PDF, DOCX, or TXT format. Try converting your file to PDF if you\'re using another format. Clear your browser cache and try again. If the issue persists, contact support with your file type and size.'
        },
        {
            category: 'Troubleshooting',
            question: 'The ATS score isn\'t showing after I upload my resume',
            answer: 'ATS scoring typically takes 10-30 seconds. If it\'s taking longer, refresh the page. Make sure you have sufficient credits in your account. Check your internet connection and try re-uploading the resume.'
        },
        {
            category: 'Troubleshooting',
            question: 'I can\'t see my saved resumes',
            answer: 'Make sure you\'re logged into the same account you used to create the resumes. Check if you\'re using the correct sign-in method (Google, GitHub, or email). Your resumes are stored per account and don\'t transfer between different login methods.'
        },
        {
            category: 'How-To Guides',
            question: 'How do I improve my ATS score?',
            answer: 'Focus on these key areas: Use standard section headings (Experience, Education, Skills), include relevant keywords from the job description, avoid tables and complex formatting, use a simple font, quantify your achievements with numbers, and ensure contact information is clearly visible at the top.'
        },
        {
            category: 'How-To Guides',
            question: 'How do I use AI to enhance my resume content?',
            answer: 'In the resume editor, select any text section and click the "AI Enhance" button. The AI will suggest improvements for clarity, impact, and ATS optimization. You can accept, reject, or modify the suggestions. This feature uses credits from your account.'
        },
        {
            category: 'How-To Guides',
            question: 'How do I tailor my resume for different jobs?',
            answer: 'Create a new version from your base resume, then customize the summary, skills, and experience descriptions to match the specific job requirements. Use the job description\'s keywords naturally throughout. Save each version with a descriptive name like "Software Engineer - Google".'
        },
        {
            category: 'Features',
            question: 'What templates are available?',
            answer: 'We offer 6+ professional LaTeX templates optimized for ATS systems: Modern, Classic, Technical, Creative, Executive, and Academic. All templates are fully customizable and designed to pass ATS screening while looking professional to human recruiters.'
        },
        {
            category: 'Features',
            question: 'Can I export my resume in different formats?',
            answer: 'Yes! All users can export to PDF. The PDF is optimized for both ATS systems and printing. Premium features may include additional export formats. Always use PDF when submitting to job applications for best compatibility.'
        },
        {
            category: 'Account & Billing',
            question: 'How do credits work?',
            answer: 'Credits are used for AI-powered features: resume parsing (1 credit), ATS scoring (1 credit), and AI content enhancement (2 credits). New users get free credits to start. You can purchase credit packages or upgrade to a plan for unlimited usage. Credits never expire.'
        },
        {
            category: 'Account & Billing',
            question: 'What happens if I run out of credits?',
            answer: 'You can still access and edit your existing resumes. To use AI features again, purchase more credits or upgrade to a premium plan. Your saved resumes and data remain accessible regardless of credit balance.'
        }
    ]

    const quickLinks = [
        {
            title: 'Video Tutorials',
            description: 'Watch step-by-step guides',
            icon: Video,
            link: '#tutorials'
        },
        {
            title: 'Documentation',
            description: 'Detailed feature guides',
            icon: Book,
            link: '/features'
        },
        {
            title: 'Contact Support',
            description: 'Get help from our team',
            icon: MessageCircle,
            link: '/contact'
        },
        {
            title: 'Email Us',
            description: 'support-prativeda@codetapasya.com',
            icon: Mail,
            link: 'mailto:support-prativeda@codetapasya.com'
        }
    ]

    const filteredGuides = selectedCategory === 'All'
        ? helpGuides
        : helpGuides.filter(guide => guide.category === selectedCategory)

    const searchedGuides = searchQuery
        ? filteredGuides.filter(guide =>
            guide.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guide.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : filteredGuides

    return (
        <>
            <SEO
                title="Help Center - Prativeda | Support & Guides"
                description="Get help with Prativeda. Find troubleshooting guides, how-to tutorials, and answers about resume building, ATS optimization, and account management."
                keywords="help center, support, troubleshooting, resume help, how-to guides, customer service"
                url="https://prativeda.codetapasya.com/help"
            />
            <PublicLayout>
                {/* Hero Section */}
                <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 overflow-hidden">
                    <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05] -z-10" />
                    <div className="absolute h-full w-full bg-white dark:bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] -z-10" />

                    <div className="container mx-auto max-w-4xl text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-100 dark:bg-white/10 text-secondary-800 dark:text-white mb-6 sm:mb-8 border border-secondary-200 dark:border-white/10 backdrop-blur-sm">
                                <HelpCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">Support</span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-secondary-900 dark:text-white mb-6 sm:mb-8">
                                How can we help?
                            </h1>
                            <p className="text-lg sm:text-xl text-secondary-600 dark:text-white/60 mb-8 sm:mb-12 px-4">
                                Search our knowledge base or browse categories below
                            </p>

                            {/* Search Bar */}
                            <div className="relative max-w-2xl mx-auto">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400 dark:text-white/40" />
                                <input
                                    type="text"
                                    placeholder="Search for help..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-2xl border-2 border-secondary-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-white/40 focus:border-secondary-400 dark:focus:border-white/30 focus:outline-none transition-colors text-base sm:text-lg"
                                />
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Quick Links */}
                <section className="py-8 sm:py-12 px-4 sm:px-6 bg-secondary-50 dark:bg-zinc-900/50">
                    <div className="container mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {quickLinks.map((link, index) => (
                                <motion.a
                                    key={index}
                                    href={link.link}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl border border-secondary-200 dark:border-white/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                                >
                                    <link.icon className="w-6 h-6 sm:w-8 sm:h-8 text-secondary-900 dark:text-white mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
                                    <h3 className="font-bold text-secondary-900 dark:text-white mb-1 text-sm sm:text-base">{link.title}</h3>
                                    <p className="text-xs sm:text-sm text-secondary-600 dark:text-white/60 break-words">{link.description}</p>
                                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-secondary-400 dark:text-white/40 mt-2 group-hover:translate-x-1 transition-transform" />
                                </motion.a>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Categories */}
                <section className="py-8 sm:py-12 px-4 sm:px-6 border-b border-secondary-200 dark:border-white/10">
                    <div className="container mx-auto max-w-7xl">
                        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                            {categories.map((category, index) => (
                                <motion.button
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => setSelectedCategory(category.name)}
                                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${selectedCategory === category.name
                                        ? 'bg-secondary-900 dark:bg-white text-white dark:text-secondary-900 shadow-lg'
                                        : 'bg-secondary-100 dark:bg-white/10 text-secondary-700 dark:text-white/70 hover:bg-secondary-200 dark:hover:bg-white/20'
                                        }`}
                                >
                                    <category.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">{category.name}</span>
                                    <span className="sm:hidden">{category.name.split(' ')[0]}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Help Guides */}
                <section className="py-12 sm:py-20 px-4 sm:px-6">
                    <div className="container mx-auto max-w-4xl">
                        <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white mb-6 sm:mb-8 text-center">
                            Help Guides & Troubleshooting
                        </h2>

                        {searchedGuides.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-secondary-600 dark:text-white/60 text-base sm:text-lg">
                                    No results found. Try a different search term or category.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 sm:space-y-4">
                                {searchedGuides.map((guide, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white dark:bg-zinc-900 rounded-xl border border-secondary-200 dark:border-white/10 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                                    >
                                        <button
                                            onClick={() => setExpandedGuide(expandedGuide === index ? null : index)}
                                            className="w-full px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-secondary-50 dark:hover:bg-white/5 transition-all duration-200"
                                        >
                                            <div className="flex-1 pr-3">
                                                <span className="inline-block px-2 py-0.5 rounded-md bg-secondary-100 dark:bg-white/10 text-secondary-700 dark:text-white/70 text-xs font-medium mb-1.5">
                                                    {guide.category}
                                                </span>
                                                <h3 className="font-semibold text-secondary-900 dark:text-white text-sm sm:text-base leading-snug">
                                                    {guide.question}
                                                </h3>
                                            </div>
                                            <motion.div
                                                animate={{ rotate: expandedGuide === index ? 180 : 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                            >
                                                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-600 dark:text-white/60 flex-shrink-0" />
                                            </motion.div>
                                        </button>

                                        <motion.div
                                            initial={false}
                                            animate={{
                                                height: expandedGuide === index ? "auto" : 0,
                                                opacity: expandedGuide === index ? 1 : 0
                                            }}
                                            transition={{
                                                height: { duration: 0.3, ease: "easeInOut" },
                                                opacity: { duration: 0.2, ease: "easeInOut" }
                                            }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 sm:px-5 pb-3 sm:pb-4 pt-1">
                                                <p className="text-secondary-600 dark:text-white/70 leading-relaxed text-sm">
                                                    {guide.answer}
                                                </p>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Contact CTA */}
                <section className="py-12 sm:py-20 px-4 sm:px-6 bg-secondary-50 dark:bg-zinc-900/50">
                    <div className="container mx-auto max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative rounded-2xl sm:rounded-3xl bg-gray-100 dark:bg-zinc-800 overflow-hidden text-center py-12 sm:py-16 px-6 sm:px-8"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-zinc-800 dark:via-zinc-800 dark:to-zinc-900 opacity-90" />
                            <div className="absolute top-0 right-0 p-12 opacity-5 blur-3xl rounded-full bg-blue-500 w-64 h-64" />

                            <div className="relative z-10">
                                <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-secondary-900 dark:text-white mx-auto mb-4 sm:mb-6" />
                                <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white mb-3 sm:mb-4">
                                    Still need help?
                                </h2>
                                <p className="text-base sm:text-lg text-secondary-600 dark:text-white/70 mb-6 sm:mb-8 max-w-xl mx-auto px-4">
                                    Our support team is here to help. Get in touch and we'll respond within 24 hours.
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/contact')}
                                    className="bg-secondary-900 dark:bg-white text-white dark:text-secondary-900 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all"
                                >
                                    Contact Support
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </PublicLayout>
        </>
    )
}
