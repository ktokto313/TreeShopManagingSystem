import { NavLink } from 'react-router-dom';
import { Container } from './Container';
import { AuthContext } from "../../context/AuthContext";
import { useContext, useState } from 'react';
import { Button } from '../ui/Button';
import { HiMenuAlt3 } from "react-icons/hi";
import { cn } from '../../utils/cn';
import { RxCross1 } from "react-icons/rx";

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
    { label: 'Tickets', to: '/tickets/' },
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
    { label: 'Orders', to: '/orders' },
    { label: 'Profile', to: '/profile' },
  ],
};

export function Header({ className = '', ...props }) {
  const { user, logout } = useContext(AuthContext);
  const role = user?.roleName ?? user?.role;
  const navItems = navItemsByRole[role] ?? navItemsByRole.anonymous;

  const [isNavOpen, setIsNavOpen] = useState(false);

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
          <div className="md:flex flex items-center gap-5">
            <span className="text-sm text-stone-600 hidden sm:block">
              {user.fullName ?? user.email}
            </span>
            <button
              onClick={logout}
              className="hidden sm:block text-sm font-medium px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
            >
              Logout
            </button>

            <Button className="text-lg sm:hidden inline-block" onClick={() => setIsNavOpen(true)}>
              <HiMenuAlt3/>
            </Button>
          </div>
        )}

        <div className={cn("fixed h-screen w-screen left-full top-0 bottom-0", 
          "bg-bg-surface/70 backdrop-blur-sm transition-[left] duration-300", 
          {"left-0": isNavOpen})}
          >
            <div className="flex text-green-600 flex-col p-10 mt-10 gap-2">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={cn(linkClass, "bg-green-300/40 p-5 text-center hover:scale-125 text-3xl hover:w-full duration-500")} onClick={() => setIsNavOpen(false)} end={item.to === '/'}>
                  {item.label}
                </NavLink>
              ))}
            </div>
            <Button className="all-revert hover:bg-green-300/50 bg-transparent cursor-pointer p-3 absolute top-5 right-5" onClick={() => setIsNavOpen(false)}>
              <RxCross1 className="text-3xl text-black"/>
            </Button>
        </div>
      </Container>
    </header>
  );
}
