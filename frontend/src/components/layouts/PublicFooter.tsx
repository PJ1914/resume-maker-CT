import { Link } from 'react-router-dom'
import { Linkedin, Twitter, Instagram } from 'lucide-react'
import { BrandLogo } from '../BrandLogo'

export function PublicFooter() {
    return (
        <footer className="relative z-10 w-full py-12 sm:py-16 px-4 sm:px-6 border-t border-secondary-200 dark:border-white/10 bg-white dark:bg-black text-secondary-900 dark:text-white transition-colors">
            <div className="container mx-auto max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
                    {/* Brand Column */}
                    <div>
                        <div className="mb-6">
                            <Link to="/" className="cursor-pointer inline-block">
                                <BrandLogo
                                    iconClassName="h-10 sm:h-12 w-auto"
                                    textClassName="text-2xl font-bold"
                                    subTextClassName="text-xs font-medium tracking-wider uppercase"
                                />
                            </Link>
                        </div>
                        <p className="text-secondary-600 dark:text-white/60 text-sm leading-relaxed mb-6 lg:mb-4">
                            Build your perfect resume with AI-powered optimization and ATS-friendly templates.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-secondary-500 dark:text-white/50 hover:text-[#0077b5] dark:hover:text-[#0077b5] transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-secondary-500 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                                    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                                </svg>
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-secondary-500 dark:text-white/50 hover:text-[#E4405F] dark:hover:text-[#E4405F] transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Product Column */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:col-span-1 lg:col-span-3 lg:grid-cols-3 gap-8">
                        <div>
                            <h3 className="font-bold mb-4">Product</h3>
                            <ul className="space-y-2">
                                <li><Link to="/resume/create" className="text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white text-sm block transition">Templates</Link></li>
                                <li><Link to="/resumes" className="text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white text-sm block transition">My Resumes</Link></li>
                                <li><Link to="/ats-checker" className="text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white text-sm block transition">ATS Checker</Link></li>
                                <li><Link to="/product/interview-prep" className="text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white text-sm block transition">AI Interview Prep</Link></li>
                                <li><Link to="/product/portfolio" className="text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white text-sm block transition">Portfolio Builder</Link></li>
                                <li><Link to="/pricing" className="text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white text-sm block transition">Pricing</Link></li>
                            </ul>
                        </div>

                        {/* Resources Column */}
                        <div>
                            <h3 className="font-bold mb-4">Resources</h3>
                            <ul className="space-y-2">
                                <li><Link to="/features" className="text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white text-sm block transition">Features</Link></li>
                                <li><Link to="/cover-letter-tips" className="text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white text-sm block transition">Cover Letter Tips</Link></li>
                                <li><Link to="/career-blog" className="text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white text-sm block transition">Career Blog</Link></li>
                                <li><Link to="/help" className="text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white text-sm block transition">Help Center</Link></li>
                            </ul>
                        </div>

                        {/* Company Column */}
                        <div>
                            <h3 className="font-bold mb-4">Company</h3>
                            <ul className="space-y-2">
                                <li><Link to="/about" className="text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white text-sm block transition">About Us</Link></li>
                                <li><Link to="/contact" className="text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white text-sm block transition">Contact</Link></li>
                                <li><Link to="/privacy-policy" className="text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white text-sm block transition">Privacy Policy</Link></li>
                                <li><Link to="/terms" className="text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white text-sm block transition">Terms of Service</Link></li>
                                <li><Link to="/refund-policy" className="text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white text-sm block transition">Refund Policy</Link></li>
                                <li><Link to="/shipping-policy" className="text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white text-sm block transition">Shipping Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-secondary-200 dark:border-white/10 flex flex-col-reverse md:flex-row justify-between items-center gap-4">
                    <div className="text-secondary-500 dark:text-white/50 text-sm text-center md:text-left">
                        © 2025 Prativeda. A product by{' '}
                        <a
                            href="https://www.codetapasya.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold hover:text-secondary-900 dark:hover:text-white transition-colors"
                        >
                            CodeTapasya
                        </a>
                        .
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-secondary-500 dark:text-white/50">
                        <Link to="/privacy-policy" className="hover:text-secondary-900 dark:hover:text-white transition">Privacy</Link>
                        <Link to="/terms" className="hover:text-secondary-900 dark:hover:text-white transition">Terms</Link>

                    </div>
                </div>
            </div>
        </footer>
    )
}
