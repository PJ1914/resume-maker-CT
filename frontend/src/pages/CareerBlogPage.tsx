import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    BookOpen,
    TrendingUp,
    Target,
    Briefcase,
    Users,
    Lightbulb,
    Calendar,
    ArrowRight,
    Clock,
    Tag
} from 'lucide-react'
import PublicLayout from '../components/layouts/PublicLayout'
import { SEO } from '../components/SEO'

export default function CareerBlogPage() {
    const navigate = useNavigate()

    const featuredPost = {
        title: '10 Resume Mistakes That Cost You Interviews in 2025',
        excerpt: 'Learn the most common resume pitfalls that prevent qualified candidates from landing interviews, and how to avoid them.',
        category: 'Resume Tips',
        readTime: '8 min read',
        date: 'Dec 20, 2024',
        image: '📄',
        slug: 'resume-mistakes-2025'
    }

    const blogPosts = [
        {
            title: 'How to Optimize Your Resume for ATS Systems',
            excerpt: 'Applicant Tracking Systems filter 75% of resumes. Here\'s how to make sure yours gets through.',
            category: 'ATS Optimization',
            readTime: '6 min read',
            date: 'Dec 18, 2024',
            icon: Target,
            slug: 'ats-optimization-guide'
        },
        {
            title: 'The Psychology of Hiring: What Recruiters Really Look For',
            excerpt: 'Understanding the recruiter mindset can transform your job search strategy.',
            category: 'Career Strategy',
            readTime: '10 min read',
            date: 'Dec 15, 2024',
            icon: Users,
            slug: 'psychology-of-hiring'
        },
        {
            title: 'Mastering the STAR Method for Interview Success',
            excerpt: 'Structure your interview responses to showcase your achievements effectively.',
            category: 'Interview Prep',
            readTime: '7 min read',
            date: 'Dec 12, 2024',
            icon: Briefcase,
            slug: 'star-method-interviews'
        },
        {
            title: 'Career Transitions: How to Pivot Industries Successfully',
            excerpt: 'Changing careers? Learn how to position your transferable skills and experience.',
            category: 'Career Growth',
            readTime: '12 min read',
            date: 'Dec 10, 2024',
            icon: TrendingUp,
            slug: 'career-transitions-guide'
        },
        {
            title: 'Building Your Personal Brand on LinkedIn',
            excerpt: 'Transform your LinkedIn profile into a powerful career asset that attracts opportunities.',
            category: 'Personal Branding',
            readTime: '9 min read',
            date: 'Dec 8, 2024',
            icon: Lightbulb,
            slug: 'linkedin-personal-branding'
        },
        {
            title: 'Salary Negotiation: Get What You Deserve',
            excerpt: 'Evidence-based strategies to negotiate higher compensation with confidence.',
            category: 'Negotiation',
            readTime: '11 min read',
            date: 'Dec 5, 2024',
            icon: TrendingUp,
            slug: 'salary-negotiation-guide'
        }
    ]

    const categories = [
        'All Posts',
        'Resume Tips',
        'Interview Prep',
        'Career Strategy',
        'ATS Optimization',
        'Personal Branding',
        'Negotiation'
    ]

    return (
        <>
            <SEO
                title="Career Blog - Prativeda | Expert Career Advice & Tips"
                description="Get expert career advice, resume tips, interview strategies, and job search insights from industry professionals."
                keywords="career blog, resume tips, interview advice, job search, career development, professional growth"
                url="https://prativeda.codetapasya.com/career-blog"
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
                                <BookOpen className="w-4 h-4" />
                                <span className="text-sm font-medium">Career Insights</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-secondary-900 dark:text-white mb-8">
                                Career Blog
                            </h1>
                            <p className="text-xl text-secondary-600 dark:text-white/60 max-w-2xl mx-auto leading-relaxed">
                                Expert advice, actionable strategies, and insider tips to accelerate your career growth.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Categories */}
                <section className="py-8 px-4 sm:px-6 border-b border-secondary-200 dark:border-white/10">
                    <div className="container mx-auto max-w-7xl">
                        <div className="flex flex-wrap gap-3 justify-center">
                            {categories.map((category, index) => (
                                <motion.button
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${index === 0
                                            ? 'bg-secondary-900 dark:bg-white text-white dark:text-secondary-900'
                                            : 'bg-secondary-100 dark:bg-white/10 text-secondary-700 dark:text-white/70 hover:bg-secondary-200 dark:hover:bg-white/20'
                                        }`}
                                >
                                    {category}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Featured Post */}
                <section className="py-16 px-4 sm:px-6 bg-secondary-50 dark:bg-zinc-900/50">
                    <div className="container mx-auto max-w-7xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-secondary-200 dark:border-white/10 hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                            onClick={() => navigate(`/blog/${featuredPost.slug}`)}
                        >
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="p-8 md:p-12 flex flex-col justify-center">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold mb-4 w-fit">
                                        <Tag className="w-3 h-3" />
                                        Featured
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {featuredPost.title}
                                    </h2>
                                    <p className="text-secondary-600 dark:text-white/60 mb-6 leading-relaxed">
                                        {featuredPost.excerpt}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-secondary-500 dark:text-white/50">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {featuredPost.date}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {featuredPost.readTime}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center text-9xl p-12">
                                    {featuredPost.image}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Blog Posts Grid */}
                <section className="py-20 px-4 sm:px-6">
                    <div className="container mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {blogPosts.map((post, index) => (
                                <motion.article
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-secondary-200 dark:border-white/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                                    onClick={() => navigate(`/blog/${post.slug}`)}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-secondary-50 dark:bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <post.icon className="w-6 h-6 text-secondary-900 dark:text-white" />
                                    </div>

                                    <span className="inline-block px-3 py-1 rounded-full bg-secondary-100 dark:bg-white/10 text-secondary-700 dark:text-white/70 text-xs font-medium mb-3">
                                        {post.category}
                                    </span>

                                    <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {post.title}
                                    </h3>

                                    <p className="text-secondary-600 dark:text-white/60 text-sm mb-4 leading-relaxed">
                                        {post.excerpt}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-secondary-500 dark:text-white/50 pt-4 border-t border-secondary-100 dark:border-white/10">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {post.date}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {post.readTime}
                                        </span>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Newsletter CTA */}
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
                                    Ready to level up your career?
                                </h2>
                                <p className="text-lg text-secondary-600 dark:text-white/70 mb-10 max-w-2xl mx-auto">
                                    Start building your professional resume today and put these insights into action.
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/login')}
                                    className="bg-secondary-900 dark:bg-white text-white dark:text-secondary-900 px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 mx-auto shadow-xl hover:shadow-2xl transition-all"
                                >
                                    Get Started Free <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </PublicLayout>
        </>
    )
}
