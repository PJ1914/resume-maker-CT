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
import { useAuth } from '../context/AuthContext'
import LandingPage from '../pages/public/LandingPage'
import FeaturesPage from '../pages/public/FeaturesPage'
import TemplatesMarketingPage from '../pages/public/TemplatesMarketingPage'
import PricingPage from '../pages/public/PricingPage'
import BlogIndexPage from '../pages/public/BlogIndexPage'
import ContactPage from '../pages/public/ContactPage'
import AboutPage from '../pages/public/AboutPage'
import PrivacyPolicyPage from '../pages/public/PrivacyPolicyPage'
import TermsPage from '../pages/public/TermsPage'

export default function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public marketing routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route
        path="/templates"
        element={
          user ? (
            <ProtectedRoute>
              <AppLayout>
                <TemplatesPage />
              </AppLayout>
            </ProtectedRoute>
          ) : (
            <TemplatesMarketingPage />
          )
        }
      />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/blog" element={<BlogIndexPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />

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

      {/* In-app templates route handled above based on auth */}

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
      
      {/* Catch all - redirect to homepage */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
