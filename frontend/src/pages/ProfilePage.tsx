import ProfileHeader from '@/components/profile/ProfileHeader'
import CreditsSection from '@/components/profile/CreditsSection'
import ResumeSection from '@/components/profile/ResumeSection'
import TemplateSection from '@/components/profile/TemplateSection'
import AIHistorySection from '@/components/profile/AIHistorySection'
import PortfolioSection from '@/components/profile/PortfolioSection'
import SettingsSection from '@/components/profile/SettingsSection'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-secondary-50 dark:bg-black text-secondary-900 dark:text-white transition-colors duration-200">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <ProfileHeader />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                    {/* Left Column - 4 cols */}
                    <div className="lg:col-span-4 space-y-6 sm:space-y-8">
                        <CreditsSection />
                        <AIHistorySection />
                        <SettingsSection />
                    </div>

                    {/* Right Column - 8 cols */}
                    <div className="lg:col-span-8 space-y-6 sm:space-y-8">
                        <ResumeSection />
                        <TemplateSection />
                        <PortfolioSection />
                    </div>
                </div>

                {/* Support Footer Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 text-center"
                >
                    <Link to="/help-center" className="text-sm text-secondary-500 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white transition-colors">
                        Need help? Visit our Support Center
                    </Link>
                </motion.div>
            </main>
        </div>
    )
}
