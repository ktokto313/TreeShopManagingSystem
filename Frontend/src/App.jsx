import {  Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/global/Footer'
import Header from './components/global/Header'
import { useAuth } from './context/AuthContext'
import CatalogPage from './pages/CatalogPage'
import HomePage from './pages/HomePage'
import ManagementPage from './pages/ManagementPage'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import ProfilePage from './features/auth/pages/ProfilePage'
function RequireAuth({ children, managerOnly = false }) {
  const { isAuthenticated, canManage } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (managerOnly && !canManage) {
    return <Navigate to="/catalog" replace />
  }

  return children
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, canManage } = useAuth()

  if (isAuthenticated && canManage) {
    return <Navigate to="/manage" replace />
  }

  if (isAuthenticated) {
    return <Navigate to="/catalog" replace />
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
            path="/register"
            element={
            <PublicOnlyRoute>
                <RegisterPage />
            </PublicOnlyRoute>
        }
        />
      <Route
        path="/catalog"
        element={
          <RequireAuth>
            <CatalogPage />
          </RequireAuth>
        }
      />
      <Route
          path="/profile"
          element={
              <RequireAuth>
                  <ProfilePage />
              </RequireAuth>
          }
      />
      <Route
        path="/manage"
        element={
          <RequireAuth managerOnly>
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
    <div className="min-h-screen bg-[var(--social-bg)]/50 text-[var(--text-h)]">
      <Header />
      <AppRoutes />
      <Footer />
    </div>
  )
}

export default App
