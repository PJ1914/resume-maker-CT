import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import AppLayout from '../components/AppLayout'
import LoginPage from '../pages/LoginPage'
import LandingPage from '../pages/LandingPage'
import FeaturesPage from '../pages/FeaturesPage'
import PricingPage from '../pages/PricingPage'
import ContactPage from '../pages/ContactPage'
import AboutPage from '../pages/AboutPage'
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage'
import TermsPage from '../pages/TermsPage'
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

      {/* Landing Page - Root */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />

      {/* Public Pages */}
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
