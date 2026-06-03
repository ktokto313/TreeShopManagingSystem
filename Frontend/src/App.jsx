import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/global/Footer'
import Header from './components/global/Header'
import { AuthProvider, useAuth } from './context/AuthContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ManagementPage from './pages/ManagementPage'

function RequireAuth({ children }) {
  const { isAuthenticated, canManage } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!canManage) {
    return <Navigate to="/" replace />
  }

  return children
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, canManage } = useAuth()

  if (isAuthenticated && canManage) {
    return <Navigate to="/manage" replace />
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/manage"
        element={
          <RequireAuth>
            <ManagementPage />
          </RequireAuth>
        }
      />
      <Route path="/admin" element={<Navigate to="/manage" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[var(--social-bg)]/50 text-[var(--text-h)]">
          <Header />
          <AppRoutes />
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
