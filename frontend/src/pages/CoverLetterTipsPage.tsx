import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    PenTool,
    Target,
    Sparkles,
    MessageSquare,
    UserCheck,
    Zap,
    CheckCircle,
    XCircle,
    ArrowRight
} from 'lucide-react'
import PublicLayout from '../components/layouts/PublicLayout'
import { SEO } from '../components/SEO'

export default function CoverLetterTipsPage() {
    const navigate = useNavigate()

    const tips = [
        {
            icon: Target,
            title: 'Tailor It Specifically',
            description: 'Never use a generic "To Whom It May Concern". Research the hiring manager and address the company\'s specific needs.',
            color: 'blue'
        },
        {
            icon: Sparkles,
            title: 'Show, Don\'t Just Tell',
            description: 'Instead of listing skills, narrate a brief story of how you applied them to solve a real problem.',
            color: 'purple'
        },
        {
            icon: PenTool,
            title: 'Keep It Concise',
            description: 'Recruiters are busy. Aim for 3-4 short paragraphs that pack a punch. Quality over quantity.',
            color: 'pink'
        },
        {
            icon: MessageSquare,
            title: 'Match Their Tone',
            description: 'Analyze the job description. Is it formal? playful? Mirror their language to show cultural fit.',
            color: 'orange'
        },
        {
            icon: Zap,
            title: 'Strong Opening',
            description: 'Start with a hook. Mention a recent company achievement or why you are personally passionate about them.',
            color: 'yellow'
        },
        {
            icon: UserCheck,
            title: 'Call to Action',
            description: 'End confidently. Express enthusiasm for an interview and thank them for their time.',
            color: 'green'
        }
    ]

    const dos = [
        'Research the hiring manager\'s name',
        'Use keywords from the job description',
        'Quantify your achievements with numbers',
        'Proofread for grammar and typos',
        'Save as PDF unless asked otherwise'
    ]

    const donts = [
        'Repeat your resume word-for-word',
        'Use generic templates without editing',
        'Focus solely on what you want',
        'Exceed one page in length',
        'Discuss salary requirements too early'
    ]

    return (
        <>
            <SEO
                title="Cover Letter Tips - Prativeda | Career Advice"
                description="Expert tips and strategies to write compelling cover letters that get you hired. Learn structure, tone, and best practices."
                keywords="cover letter tips, write a cover letter, career advice, job application tips"
                url="https://prativeda.codetapasya.com/cover-letter-tips"
            />
            <PublicLayout>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
                    <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05] -z-10" />
                    <div className="absolute h-full w-full bg-white dark:bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] -z-10" />

                    <div className="container mx-auto max-w-7xl text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-100 dark:bg-white/10 text-secondary-800 dark:text-white mb-8 border border-secondary-200 dark:border-white/10 backdrop-blur-sm">
                                <PenTool className="w-4 h-4" />
                                <span className="text-sm font-medium">Career Resources</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-secondary-900 dark:text-white mb-8">
                                Master the Art of the <br className="hidden md:block" />
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Cover Letter</span>
                            </h1>
                            <p className="text-xl text-secondary-600 dark:text-white/60 max-w-2xl mx-auto leading-relaxed">
                                Your cover letter is your voice. Make it count with our expert strategies to stand out from the stack.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Tips Grid */}
                <section className="py-20 bg-secondary-50 dark:bg-zinc-900/50">
                    <div className="container mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {tips.map((tip, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-secondary-200 dark:border-white/10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
                                >
                                    <div className={`w-14 h-14 rounded-2xl bg-secondary-50 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        <tip.icon className="w-7 h-7 text-secondary-900 dark:text-white/90" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-3">{tip.title}</h3>
                                    <p className="text-secondary-600 dark:text-white/60 leading-relaxed">{tip.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Dos and Donts */}
                <section className="py-24 px-4 sm:px-6">
                    <div className="container mx-auto max-w-7xl">
                        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
                            {/* Do's */}
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="bg-green-50/50 dark:bg-green-900/10 rounded-3xl p-10 border border-green-100 dark:border-green-500/20"
                            >
                                <h3 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-8 flex items-center gap-3">
                                    <CheckCircle className="w-8 h-8" />
                                    The Do's
                                </h3>
                                <ul className="space-y-6">
                                    {dos.map((item, i) => (
                                        <li key={i} className="flex items-start gap-4">
                                            <div className="mt-1 w-6 h-6 rounded-full bg-green-200 dark:bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle className="w-4 h-4 text-green-700 dark:text-green-400" />
                                            </div>
                                            <span className="text-lg text-secondary-700 dark:text-white/80 font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>

                            {/* Don'ts */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="bg-red-50/50 dark:bg-red-900/10 rounded-3xl p-10 border border-red-100 dark:border-red-500/20"
                            >
                                <h3 className="text-3xl font-bold text-red-700 dark:text-red-400 mb-8 flex items-center gap-3">
                                    <XCircle className="w-8 h-8" />
                                    The Don'ts
                                </h3>
                                <ul className="space-y-6">
                                    {donts.map((item, i) => (
                                        <li key={i} className="flex items-start gap-4">
                                            <div className="mt-1 w-6 h-6 rounded-full bg-red-200 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                                <XCircle className="w-4 h-4 text-red-700 dark:text-red-400" />
                                            </div>
                                            <span className="text-lg text-secondary-700 dark:text-white/80 font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 px-4 sm:px-6">
                    <div className="container mx-auto max-w-5xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative rounded-3xl bg-gray-100 dark:bg-zinc-800 overflow-hidden text-center py-16 px-8 sm:px-16"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-zinc-800 dark:via-zinc-800 dark:to-zinc-900 opacity-90" />
                            <div className="absolute top-0 right-0 p-12 opacity-5 blur-3xl rounded-full bg-blue-500 w-64 h-64" />
                            <div className="absolute bottom-0 left-0 p-12 opacity-5 blur-3xl rounded-full bg-purple-500 w-64 h-64" />

                            <div className="relative z-10">
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mb-6">
                                    Ready to put these tips into practice?
                                </h2>
                                <p className="text-lg text-secondary-600 dark:text-white/70 mb-10 max-w-2xl mx-auto">
                                    Build your ATS-friendly resume and pair it with a compelling cover letter today.
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/login')}
                                    className="bg-secondary-900 dark:bg-white text-white dark:text-secondary-900 px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 mx-auto shadow-xl hover:shadow-2xl transition-all"
                                >
                                    Start Building Now <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </PublicLayout>
        </>
    )
}
