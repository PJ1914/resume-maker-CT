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
      
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
