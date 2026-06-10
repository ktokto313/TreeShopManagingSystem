import { Container } from './Container';
import { useAuth } from '../../hooks/useAuth';

export function Header({ className = '', ...props }) {
  const { user, logout } = useAuth();

  return (
    <header
      className={`bg-bg-base border-b border-border sticky top-0 z-50 ${className}`}
      {...props}
    >
      <Container className="flex items-center justify-between h-16">
        {/* Logo Area */}
        <div className="flex items-center gap-2 font-bold text-lg text-black">
          <div className="w-8 h-8 rounded-md bg-interactive flex items-center justify-center text-white">
            ★
          </div>
          <span>TreeShop</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex gap-6">
          <a href="/admin/users" className="text-sm font-medium text-black hover:text-interactive transition-colors">
            Dashboard
          </a>
          <a href="/tickets" className="text-sm font-medium text-black hover:text-interactive transition-colors">
            Tickets
          </a>
        </nav>

        {/* User Info & Logout */}
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-600 hidden sm:block">
              {user.fullName ?? user.email}
            </span>
            <button
              onClick={logout}
              className="text-sm font-medium px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </Container>
    </header>
  );
}