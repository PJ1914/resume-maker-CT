import React from 'react'
import { PublicNavbar } from './PublicNavbar'
import { PublicFooter } from './PublicFooter'
import { StarryBackground } from '../ui/StarryBackground'

interface PublicLayoutProps {
    children: React.ReactNode
    onMobileMenuClick?: () => void
}

export default function PublicLayout({ children, onMobileMenuClick }: PublicLayoutProps) {
    return (
        <div className="min-h-screen bg-secondary-50 dark:bg-black text-secondary-900 dark:text-white relative">
            <StarryBackground />
            <PublicNavbar onMobileMenuClick={onMobileMenuClick} />
            <main className="relative z-10">
                {children}
            </main>
            <PublicFooter />
        </div>
    )
}
