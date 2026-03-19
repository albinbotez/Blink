import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { useMessages } from './hooks/useMessages'
import Navigation from './components/Navigation'
import { Spinner } from './components/ui'

// Pages
import LandingPage from './pages/LandingPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import DiscoverPage from './pages/DiscoverPage'
import ProfilePage from './pages/ProfilePage'
import DashboardPage from './pages/DashboardPage'
import MessagesPage from './pages/MessagesPage'
import CompanyProfilePage from './pages/CompanyProfilePage'

// Protected route wrapper
function ProtectedRoute({ children, allowedTypes }) {
  const { user, userType, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-txt-muted">
        <Spinner /> <span className="ml-3">Laster...</span>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (allowedTypes && !allowedTypes.includes(userType)) return <Navigate to="/" replace />

  return children
}

function AppContent() {
  const { user } = useAuth()
  const { unreadCount } = useMessages(user?.id)

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navigation unreadCount={unreadCount} />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />

          {/* Business-only routes */}
          <Route path="/discover" element={
            <ProtectedRoute allowedTypes={['business']}>
              <DiscoverPage />
            </ProtectedRoute>
          } />

          {/* Influencer-only routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedTypes={['influencer']}>
              <DashboardPage />
            </ProtectedRoute>
          } />

          {/* Authenticated routes */}
          <Route path="/messages" element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          } />
          <Route path="/company-profile" element={
            <ProtectedRoute allowedTypes={['business']}>
              <CompanyProfilePage />
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}
