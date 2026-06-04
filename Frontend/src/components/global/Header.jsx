import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Container from './Container'

export default function Header() {
  const { user, isAuthenticated, canManage, logout } = useAuth()

  return (
    <header className="border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur">
      <Container className="flex min-h-16 items-center justify-between gap-4 py-4">
        <div className="space-y-0.5">
          <Link to="/" className="block text-base font-semibold text-[var(--text-h)]">
            Tree Shop Managing System
          </Link>
          <p className="text-xs text-[var(--text)]">About the project</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <nav className="flex items-center gap-2">
          <Link
            to="/"
            className="rounded-md px-3 py-2 text-[var(--text-h)] transition hover:bg-[var(--social-bg)]"
          >
            Trang chủ
          </Link>
          <Link
            to={isAuthenticated ? '/catalog' : '/login'}
            className="rounded-md px-3 py-2 text-[var(--text-h)] transition hover:bg-[var(--social-bg)]"
          >
            Sản phẩm
          </Link>
          <Link
            to={canManage ? '/manage' : '/login'}
            className="rounded-md px-3 py-2 text-[var(--text-h)] transition hover:bg-[var(--social-bg)]"
          >
            Quản lý
          </Link>
          </nav>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--social-bg)] px-3 py-1.5">
              <Link
                  to="/profile"
                  className="text-xs text-[var(--text)] hover:underline"
              >
                {user?.fullName || user?.email || 'Đã đăng nhập'}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[var(--text-h)] transition hover:bg-[var(--border)]"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </Container>
    </header>
  )
}
