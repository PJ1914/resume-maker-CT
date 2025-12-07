import { useAuth } from '@/context/AuthContext'
import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

export default function AdminGuard() {
    const { user, loading, isAdmin } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-950">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        )
    }

    if (!user || !isAdmin) {
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}
