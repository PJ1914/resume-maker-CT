import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'

export function PublicFooter() {
    return (
        <footer className="relative z-10 w-full py-12 sm:py-16 px-4 sm:px-6 border-t border-secondary-200 dark:border-white/10 bg-white dark:bg-black text-secondary-900 dark:text-white transition-colors">
            <div className="container mx-auto max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
                    {/* Brand Column */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 bg-secondary-900 dark:bg-white rounded-lg flex items-center justify-center">
                                <FileText className="h-6 w-6 text-white dark:text-black" />
                            </div>
                            <span className="text-xl font-bold">prativeda</span>
                        </div>
                        <p className="text-secondary-600 dark:text-white/60 text-sm leading-relaxed mb-6 lg:mb-4">
                            Build your perfect resume with AI-powered optimization and ATS-friendly templates.
                        </p>
                    </div>

                    {/* Product Column */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:col-span-1 lg:col-span-3 lg:grid-cols-3 gap-8">
                        <div>
                            <h3 className="font-bold mb-4">Product</h3>
                            <ul className="space-y-2">
                                <li><Link to="/templates" className="text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white text-sm block transition">Templates</Link></li>
                                <li><Link to="/resumes" className="text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white text-sm block transition">My Resumes</Link></li>
                                <li><Link to="/templates" className="text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white text-sm block transition">ATS Checker</Link></li>
                                <li><Link to="/pricing" className="text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white text-sm block transition">Pricing</Link></li>
                            </ul>
                        </div>

                        {/* Resources Column */}
                        <div>
                            <h3 className="font-bold mb-4">Resources</h3>
                            <ul className="space-y-2">
                                <li><Link to="/features" className="text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white text-sm block transition">Resume Guide</Link></li>
                                <li><Link to="/features" className="text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white text-sm block transition">Cover Letter Tips</Link></li>
                                <li><Link to="/about" className="text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white text-sm block transition">Career Blog</Link></li>
                                <li><Link to="/contact" className="text-secondary-600 dark:text-white/60 hover:text-secondary-900 dark:hover:text-white text-sm block transition">Help Center</Link></li>
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
                    <div className="text-secondary-500 dark:text-white/50 text-sm text-center md:text-left">© 2025 prativeda. All rights reserved.</div>
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-secondary-500 dark:text-white/50">
                        <Link to="/privacy-policy" className="hover:text-secondary-900 dark:hover:text-white transition">Privacy</Link>
                        <Link to="/terms" className="hover:text-secondary-900 dark:hover:text-white transition">Terms</Link>

                    </div>
                </div>
            </div>
        </footer>
    )
}
