import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import AppLayout from '../components/AppLayout'
import LoginPage from '../pages/LoginPage'
import DashboardPage from '../pages/DashboardPage'
import ResumesPage from '../pages/ResumesPage'
import UploadPage from '../pages/UploadPage'
import ResumeDetailPage from '../pages/ResumeDetailPage'
import { ResumeEditorPage } from '../pages/ResumeEditorPage'
import ResumeWizardPage from '../pages/ResumeWizardPage'
import TemplateSelectionPage from '../pages/TemplateSelectionPage'
import { TemplatesPage } from '../pages/TemplatesPage'
import CreditPurchasePage from '../pages/CreditPurchasePage'
import CreditHistoryPage from '../pages/CreditHistoryPage'
import ProfilePage from '../pages/ProfilePage'
import { useAuth } from '../context/AuthContext'
import AdminGuard from '../components/admin/AdminGuard'
import AdminLayout from '../components/layouts/AdminLayout'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import UsersPage from '../pages/admin/UsersPage'
import UserDetailsPage from '../pages/admin/UserDetailsPage'
import AdminResumesPage from '../pages/admin/ResumesPage'
import ResumeDetailsPage from '../pages/admin/ResumeDetailsPage'
import AdminTemplatesPage from '../pages/admin/TemplatesPage'
import PortfoliosPage from '../pages/admin/PortfoliosPage'
import PaymentsPage from '../pages/admin/PaymentsPage'
import AIMonitoringPage from '../pages/admin/AIMonitoringPage'
import AnnouncementsPage from '../pages/admin/AnnouncementsPage'
import SettingsPage from '../pages/admin/SettingsPage'

export default function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/resumes"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ResumesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <AppLayout>
              <UploadPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/templates"
        element={
          <ProtectedRoute>
            <AppLayout>
              <TemplatesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/resume/create"
        element={
          <ProtectedRoute>
            <TemplateSelectionPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/resume/wizard"
        element={
          <ProtectedRoute>
            <ResumeWizardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/resumes/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ResumeDetailPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/editor/:resumeId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ResumeEditorPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/credits/purchase"
        element={
          <ProtectedRoute>
            <CreditPurchasePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/credits/history"
        element={
          <ProtectedRoute>
            <CreditHistoryPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route element={<AdminGuard />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:uid" element={<UserDetailsPage />} />
          <Route path="resumes" element={<AdminResumesPage />} />
          <Route path="resumes/:id" element={<ResumeDetailsPage />} />
          <Route path="templates" element={<AdminTemplatesPage />} />
          <Route path="portfolios" element={<PortfoliosPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="ai" element={<AIMonitoringPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="support" element={<div className="p-8">Support Tickets (Coming Soon)</div>} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Catch all - redirect to login or dashboard */}
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
