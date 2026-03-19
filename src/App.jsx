import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { useMessages } from './hooks/useMessages'
import Navigation from './components/Navigation'
import { Spinner } from './components/ui'

import LandingPage from './pages/LandingPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import DiscoverPage from './pages/DiscoverPage'
import ProfilePage from './pages/ProfilePage'
import DashboardPage from './pages/DashboardPage'
import MessagesPage from './pages/MessagesPage'
import CompanyProfilePage from './pages/CompanyProfilePage'

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center py-32 text-txt-muted">
      <Spinner /> <span className="ml-3">Laster...</span>
    </div>
  )
}

function ProtectedRoute({ children, allowedTypes }) {
  const { user, userType, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />

  // If allowedTypes specified and userType is known but wrong, redirect
  if (allowedTypes && userType && !allowedTypes.includes(userType)) {
    if (userType === 'influencer') return <Navigate to="/dashboard" replace />
    if (userType === 'business') return <Navigate to="/discover" replace />
    return <Navigate to="/" replace />
  }

  // If userType is still null (incomplete registration), just render anyway
  return children
}

function HomePage() {
  const { user, userType, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (user && userType === 'influencer') return <Navigate to="/dashboard" replace />
  if (user && userType === 'business') return <Navigate to="/discover" replace />

  return <LandingPage />
}

function AppContent() {
  const { user } = useAuth()
  const { unreadCount } = useMessages(user?.id)

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navigation unreadCount={unreadCount} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/discover" element={<ProtectedRoute allowedTypes={['business']}><DiscoverPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute allowedTypes={['influencer']}><DashboardPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/company-profile" element={<ProtectedRoute allowedTypes={['business']}><CompanyProfilePage /></ProtectedRoute>} />
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
