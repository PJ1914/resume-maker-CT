import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
    Mic,
    Brain,
    MessageSquare,
    Video,
    Target,
    Users,
    ArrowRight,
    Zap,
    BarChart3,
    CheckCircle
} from 'lucide-react'
import { PublicNavbar } from '../components/layouts/PublicNavbar'
import { PublicFooter } from '../components/layouts/PublicFooter'
import { StarryBackground } from '../components/ui/StarryBackground'
import { useAuth } from '../context/AuthContext'

export default function InterviewPrepMarketingPage() {
    const navigate = useNavigate()
    const { user } = useAuth()

    const handleCtaClick = () => {
        if (user) {
            navigate('/interview-prep')
        } else {
            navigate('/login?redirect=/interview-prep')
        }
    }

    const features = [
        {
            title: "Voice & Text Coaching",
            description: "Practice your answers naturally with voice mode or type them out. No camera required, just focus on your content and delivery.",
            icon: Mic,
            color: "text-yellow-500 bg-yellow-500/10"
        },
        {
            title: "Industry-Specific Scenarios",
            description: "Practice with curated questions for Software Engineering, Product Management, Marketing, and more.",
            icon: Target,
            color: "text-blue-500 bg-blue-500/10"
        },
        {
            title: "Deep Content Analysis",
            description: "We analyze your answer's structure, clarity, and relevance to the question—ensuring you hit key impact points.",
            icon: Brain,
            color: "text-purple-500 bg-purple-500/10"
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
                            <Brain className="w-4 h-4 text-secondary-900 dark:text-white" />
                            <span className="text-sm font-medium">AI-Powered Coaching</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-8"
                        >
                            Master Your <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary-900 via-secondary-700 to-secondary-900 dark:from-white dark:via-gray-200 dark:to-white animate-gradient">
                                Next Interview
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg sm:text-xl text-secondary-600 dark:text-white/60 max-w-2xl mx-auto mb-12"
                        >
                            Refine your interview skills with our advanced Audio & Text AI coach. Get feedback on answer quality, speech clarity, and confidence—without the pressure of a camera.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <button
                                onClick={handleCtaClick}
                                className="px-8 py-4 bg-secondary-900 dark:bg-white text-white dark:text-black rounded-lg font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                Start Practicing
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    </div>
                </section>

                {/* Feature Grid */}
                <section className="px-4 sm:px-6 lg:px-8 mb-24 sm:mb-40">
                    <div className="container mx-auto max-w-6xl">
                        <div className="grid md:grid-cols-3 gap-8">
                            {features.map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white dark:bg-white/5 backdrop-blur-xl border border-secondary-200 dark:border-white/10 rounded-2xl p-8"
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.color}`}>
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                    <p className="text-secondary-600 dark:text-white/70 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="px-4 sm:px-6 lg:px-8 mb-24">
                    <div className="container mx-auto max-w-5xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How it works</h2>
                            <p className="text-secondary-600 dark:text-white/60">Three steps to interview confidence.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 relative">
                            {/* Connecting Line (Desktop) */}
                            <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-secondary-200 via-secondary-200 to-secondary-200 dark:from-white/10 dark:via-white/10 dark:to-white/10 -z-10" />

                            {[
                                { icon: MessageSquare, title: "Choose Your Mode", desc: "Select Voice Mode for realistic speaking practice or Text Mode to refine answer structure." },
                                { icon: Mic, title: "Speak or Type", desc: "Respond to questions naturally. Our AI listens to your content and delivery style." },
                                { icon: BarChart3, title: "Get Deep Insights", desc: "Receive immediate feedback on relevance, clarity, and pacing—driven by data, not video." }
                            ].map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.2 }}
                                    className="text-center bg-secondary-50 dark:bg-black p-4"
                                >
                                    <div className="w-24 h-24 mx-auto bg-white dark:bg-white/10 rounded-full border-4 border-secondary-50 dark:border-black flex items-center justify-center mb-6 shadow-xl">
                                        <step.icon className="w-10 h-10 text-secondary-900 dark:text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                                    <p className="text-sm text-secondary-600 dark:text-white/60">{step.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Banner - Reused Style */}
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
                                        Ready to Ace the Interview?
                                    </h2>
                                    <p className="text-lg text-secondary-600 dark:text-white/60 mb-10 max-w-2xl mx-auto font-light">
                                        Stop guessing. Start practicing with AI feedback today.
                                    </p>
                                    <button
                                        onClick={handleCtaClick}
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-secondary-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg hover:scale-105 transition-transform"
                                    >
                                        Start Mock Interview
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
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
