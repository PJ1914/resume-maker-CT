import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import AppRoutes from './routes'
import { LoaderProvider } from './context/LoaderContext'
import { TourProvider } from './context/TourContext'
import AppTour from './components/AppTour'
import { SEO, HomeSchema } from './components/SEO'
import { Analytics } from './components/Analytics'

import { useState } from 'react'
import Preloader from '@/components/ui/preloader'

function App() {
  const [loading, setLoading] = useState(true)

  return (
    <>
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <LoaderProvider>
            <TourProvider>
              {/* Global SEO defaults and homepage JSON-LD */}
              <SEO />
              <HomeSchema />
              <Analytics />

              {/* App routes and tour */}
              <AppRoutes />
              <AppTour />

              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#fff',
                    color: '#0f172a',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </TourProvider>
          </LoaderProvider>
        </AuthProvider>
      </BrowserRouter>
    </>
  )
}

export default App
