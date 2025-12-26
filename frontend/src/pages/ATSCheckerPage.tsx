import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    FileText,
    CheckCircle,
    Zap,
    Search,
    BarChart3,
    Layers,
    ArrowRight,
    ShieldCheck,
    Cpu
} from 'lucide-react'
import { PublicNavbar } from '../components/layouts/PublicNavbar'
import { PublicFooter } from '../components/layouts/PublicFooter'
import { StarryBackground } from '../components/ui/StarryBackground'

export default function ATSCheckerPage() {
    const scoreBreakdown = [
        {
            title: "Keywords & Relevance",
            score: "30 Points",
            description: "Analyzes industry-standard keywords and strict matching against job descriptions to ensure your resume passes the first filter.",
            icon: Search,
            color: "text-blue-500 bg-blue-500/10"
        },
        {
            title: "Section Quality",
            score: "35 Points",
            description: "Evaluates the depth of your Experience, Projects, and Education sections. Checks for clear dates, roles, and structural completeness.",
            icon: Layers,
            color: "text-purple-500 bg-purple-500/10"
        },
        {
            title: "Formatting & Structure",
            score: "15 Points",
            description: "Ensures your resume uses ATS-friendly logic: proper hierarchy, readable fonts, and correct margin usage. Prevents parsing errors.",
            icon: FileText,
            color: "text-green-500 bg-green-500/10"
        },
        {
            title: "Quantifiable Impact",
            score: "10 Points",
            description: "Scans for specific metrics (%, currency, numbers) that demonstrate your achievements rather than just listing duties.",
            icon: BarChart3,
            color: "text-orange-500 bg-orange-500/10"
        },
        {
            title: "Readability & Clarity",
            score: "10 Points",
            description: "Checks grammar, sentence structure, and active voice usage to ensure your resume is concise and professional for human readers.",
            icon: CheckCircle,
            color: "text-pink-500 bg-pink-500/10"
        }
    ]

    const engines = [
        {
            name: "Engine 1: Standard Validator",
            description: "Our rule-based engine acts like the strictest legacy ATS systems. It validates your file format, checks for prohibited elements (tables, graphics), and ensures your contact information is parseable.",
            icon: ShieldCheck,
            features: [
                "File Integrity Check",
                "Contact Info Parsing",
                "Structural Compliance",
                "Format Validation"
            ]
        },
        {
            name: "Engine 2: AI Deep Scan",
            description: "Powered by Google's Gemini 1.5 AI. This engine reads your resume like a hiring manager. It understands context, measures the impact of your bullet points, and suggests specific rewriting improvements.",
            icon: Cpu,
            features: [
                "Contextual Understanding",
                "Impact Analysis",
                "Smart Rewriting Suggestions",
                "Job Description Matching"
            ]
        }
    ]

    return (
        <div className="min-h-screen bg-secondary-50 dark:bg-black text-secondary-900 dark:text-white relative font-sans selection:bg-secondary-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
            <StarryBackground />
            <PublicNavbar />

            <main className="relative z-10 pt-24 sm:pt-32 pb-12">
                {/* Hero Section */}
                <section className="px-4 sm:px-6 lg:px-8 mb-20 sm:mb-32">
                    <div className="container mx-auto max-w-7xl text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-100 dark:bg-white/5 rounded-full border border-secondary-200 dark:border-white/10 mb-8"
                        >
                            <Zap className="w-4 h-4 text-secondary-900 dark:text-white" />
                            <span className="text-sm font-medium">Dual-Engine Technology</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-8"
                        >
                            Is Your Resume <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary-900 via-secondary-700 to-secondary-900 dark:from-white dark:via-gray-200 dark:to-white animate-gradient">
                                Blocking Your Career?
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg sm:text-xl text-secondary-600 dark:text-white/60 max-w-2xl mx-auto mb-12"
                        >
                            Don't let a bot decide your future. Our advanced ATS checker combines rigorous rule-based validation with cutting-edge AI analysis to ensure you get seen.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Link
                                to="/resumes"
                                className="px-8 py-4 bg-secondary-900 dark:bg-white text-white dark:text-black rounded-lg font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                Check My Score Free
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* Dual Engine Section */}
                <section className="px-4 sm:px-6 lg:px-8 mb-24 sm:mb-40">
                    <div className="container mx-auto max-w-7xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Two Engines. Zero Compromise.</h2>
                            <p className="text-secondary-600 dark:text-white/60 max-w-2xl mx-auto">
                                Most checkers only do one thing. We do both. Get the precision of code and the intuition of AI.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                            {engines.map((engine, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="bg-white dark:bg-white/5 backdrop-blur-xl border border-secondary-200 dark:border-white/10 rounded-2xl p-8 sm:p-10"
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-secondary-900 dark:bg-white text-white dark:text-black flex items-center justify-center">
                                            <engine.icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-bold">{engine.name}</h3>
                                    </div>
                                    <p className="text-secondary-600 dark:text-white/70 mb-8 leading-relaxed">
                                        {engine.description}
                                    </p>
                                    <ul className="space-y-3">
                                        {engine.features.map((feature, fIdx) => (
                                            <li key={fIdx} className="flex items-center gap-3 text-sm font-medium">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Scoring Breakdown */}
                <section className="px-4 sm:px-6 lg:px-8 mb-24">
                    <div className="container mx-auto max-w-5xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How We Calculate Your 100 Points</h2>
                            <p className="text-secondary-600 dark:text-white/60">
                                Our proprietary algorithm breaks down your resume into 5 critical dimensions.
                            </p>
                        </div>

                        <div className="grid gap-6">
                            {scoreBreakdown.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white dark:bg-white/5 border border-secondary-200 dark:border-white/10 rounded-xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 hover:border-secondary-300 dark:hover:border-white/20 transition-colors"
                                >
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${item.color}`}>
                                        <item.icon className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1 text-center sm:text-left">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 justify-center sm:justify-between">
                                            <h3 className="text-xl font-bold">{item.title}</h3>
                                            <span className="inline-block px-3 py-1 bg-secondary-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded-full">
                                                {item.score}
                                            </span>
                                        </div>
                                        <p className="text-secondary-600 dark:text-white/70 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Banner */}
                <section className="px-4 sm:px-6 lg:px-8">
                    <div className="container mx-auto max-w-5xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: '-100px' }}
                            className="relative bg-white dark:bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-8 sm:p-16 text-center border border-secondary-200 dark:border-white/10 overflow-hidden shadow-2xl dark:shadow-none"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-secondary-50/50 dark:from-white/10 via-transparent to-transparent" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />

                            <div className="relative z-10">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-100px' }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h2 className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight text-secondary-900 dark:text-white">
                                        Ready to beat the bots?
                                    </h2>
                                    <p className="text-lg text-secondary-600 dark:text-white/60 mb-10 max-w-2xl mx-auto font-light">
                                        Upload your resume now and get your detailed score analysis in under 30 seconds.
                                    </p>
                                    <Link
                                        to="/upload"
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-secondary-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg hover:scale-105 transition-transform"
                                    >
                                        Analyze My Resume
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    )
}
