import { NavLink } from 'react-router-dom';
import { Container } from './Container';
import { AuthContext } from "../../context/AuthContext";
import { useContext } from 'react';

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? 'text-interactive' : 'text-black hover:text-interactive'
  }`;

const navItemsByRole = {
  anonymous: [
    { label: 'Home', to: '/' },
    { label: 'Catalog', to: '/catalog' },
    { label: 'Login', to: '/login' },
    { label: 'Register', to: '/register' },
  ],
  CUSTOMER: [
    { label: 'Home', to: '/' },
    { label: 'Catalog', to: '/catalog' },
    { label: 'Profile', to: '/profile' },
  ],
  MANAGER: [
    { label: 'Home', to: '/' },
    { label: 'Manage', to: '/manage' },
    { label: 'Orders', to: '/orders' },
    { label: 'Profile', to: '/profile' },
  ],
  SUPPORT_AGENT: [
    { label: 'Home', to: '/' },
    { label: 'Tickets', to: '/tickets/' },
    { label: 'Profile', to: '/profile' },
  ],
  SHIPPER: [
    { label: 'Home', to: '/' },
    { label: 'Orders', to: '/orders' },
    { label: 'Profile', to: '/profile' },
  ],
  SYSTEM_ADMIN: [
    { label: 'Home', to: '/' },
    { label: 'User Management', to: '/admin/users' },
    { label: 'Manage', to: '/manage' },
    { label: 'Tickets', to: '/tickets/' },
    { label: 'Orders', to: '/orders' },
    { label: 'Profile', to: '/profile' },
  ],
};

export function Header({ className = '', ...props }) {
  const { user, logout } = useContext(AuthContext);
  const role = user?.roleName ?? user?.role;
  const navItems = navItemsByRole[role] ?? navItemsByRole.anonymous;

  return (
    <header
      className={`bg-bg-base border-b border-border sticky top-0 z-50 ${className}`}
      {...props}
    >
      <Container className="flex items-center justify-between h-16 gap-4">
        <div className="flex items-center gap-2 font-bold text-lg text-black">
          <div className="w-8 h-8 rounded-md bg-interactive flex items-center justify-center text-white text-sm">
            TS
          </div>
          <span>TreeShop</span>
        </div>

        <nav className="hidden md:flex gap-5">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/'}>
              {item.label}
            </NavLink>
          ))}
        </nav>

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
