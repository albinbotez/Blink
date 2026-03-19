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

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center py-32 text-txt-muted">
      <Spinner /> <span className="ml-3">Laster...</span>
    </div>
  )
}

// Protected route wrapper
function ProtectedRoute({ children, allowedTypes }) {
  const { user, userType, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />

  // If user is logged in but userType hasn't loaded yet, show loading
  if (allowedTypes && !userType) return <LoadingScreen />

  // If user has wrong type, send to landing (not a redirect loop since HomePage handles null userType)
  if (allowedTypes && !allowedTypes.includes(userType)) {
    return userType === 'influencer' ? <Navigate to="/dashboard" replace />
         : userType === 'business' ? <Navigate to="/discover" replace />
         : <Navigate to="/" replace />
  }

  return children
}

// Smart home route
function HomePage() {
  const { user, userType, loading } = useAuth()

  if (loading) return <LoadingScreen />

  // Only redirect if we actually know the userType
  if (user && userType === 'influencer') return <Navigate to="/dashboard" replace />
  if (user && userType === 'business') return <Navigate to="/discover" replace />

  // Not logged in OR logged in without a type yet — show landing
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

          <Route path="/discover" element={
            <ProtectedRoute allowedTypes={['business']}>
              <DiscoverPage />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute allowedTypes={['influencer']}>
              <DashboardPage />
            </ProtectedRoute>
          } />

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

