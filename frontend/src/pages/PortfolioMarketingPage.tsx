import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
    Globe,
    Layout,
    Share2,
    Code,
    Image as ImageIcon,
    Palette,
    ArrowRight,
    Briefcase
} from 'lucide-react'
import { PublicNavbar } from '../components/layouts/PublicNavbar'
import { PublicFooter } from '../components/layouts/PublicFooter'
import { StarryBackground } from '../components/ui/StarryBackground'
import { useAuth } from '../context/AuthContext'

export default function PortfolioMarketingPage() {
    const navigate = useNavigate()
    const { user } = useAuth()

    const handleCtaClick = () => {
        if (user) {
            navigate('/portfolio')
        } else {
            navigate('/login?redirect=/portfolio')
        }
    }

    const features = [
        {
            title: "One-Click Generation",
            description: "Turn your existing resume into a stunning personal website instantly. No coding required.",
            icon: ZapIcon,
            color: "text-blue-500 bg-blue-500/10"
        },
        {
            title: "Custom Domain Ready",
            description: "Connect your own domain or use our free .prativeda.site subdomain for your professional brand.",
            icon: Globe,
            color: "text-purple-500 bg-purple-500/10"
        },
        {
            title: "Responsive Templates",
            description: "Choose from 10+ modern, mobile-first designs that look great on any device.",
            icon: Layout,
            color: "text-pink-500 bg-pink-500/10"
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
                            <Briefcase className="w-4 h-4 text-secondary-900 dark:text-white" />
                            <span className="text-sm font-medium">Personal Branding Suite</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-8"
                        >
                            Your Career, <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary-900 via-secondary-700 to-secondary-900 dark:from-white dark:via-gray-200 dark:to-white animate-gradient">
                                Showcased to the World.
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg sm:text-xl text-secondary-600 dark:text-white/60 max-w-2xl mx-auto mb-12"
                        >
                            Transform your resume data into a modern, high-performance portfolio website in seconds. Stand out from the stack with a live link.
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
                                Build My Site
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

                {/* Showcase */}
                <section className="px-4 sm:px-6 lg:px-8 mb-24">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Designed to Impress</h2>
                            <p className="text-secondary-600 dark:text-white/60">Professional themes for every career path.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <motion.div
                                whileHover={{ y: -10 }}
                                className="rounded-2xl overflow-hidden border border-secondary-200 dark:border-white/10 shadow-2xl"
                            >
                                <div className="h-64 bg-secondary-100 dark:bg-white/5 flex items-center justify-center">
                                    <span className="text-secondary-400 dark:text-white/20 font-bold text-2xl">Minimalist Theme Preview</span>
                                </div>
                            </motion.div>
                            <motion.div
                                whileHover={{ y: -10 }}
                                className="rounded-2xl overflow-hidden border border-secondary-200 dark:border-white/10 shadow-2xl"
                            >
                                <div className="h-64 bg-secondary-900 dark:bg-black flex items-center justify-center">
                                    <span className="text-white/20 dark:text-white/20 font-bold text-2xl">Dark Bold Theme Preview</span>
                                </div>
                            </motion.div>
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
                                        Ready to Launch?
                                    </h2>
                                    <p className="text-lg text-secondary-600 dark:text-white/60 mb-10 max-w-2xl mx-auto font-light">
                                        Your personal website is just one click away.
                                    </p>
                                    <button
                                        onClick={handleCtaClick}
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-secondary-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg hover:scale-105 transition-transform"
                                    >
                                        Create Free Portfolio
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

function ZapIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    )
}
