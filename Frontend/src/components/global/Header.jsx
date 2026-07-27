import { NavLink, useNavigate } from 'react-router-dom';
import { Container } from './Container';
import { AuthContext } from "../../context/AuthContext";
import { useContext, useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { HiMenuAlt3 } from "react-icons/hi";
import { cn } from '../../utils/cn';
import { RxCross1 } from "react-icons/rx";
import { RiPlantFill } from "react-icons/ri";
import NotificationBell from '../../features/notification/components/NotificationBell';

const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-interactive' : 'text-black hover:text-interactive'
    }`;

const navItemsByRole = {
  anonymous: [
    { label: 'Trang chủ', to: '/' },
    { label: 'Cửa hàng', to: '/catalog' },
    { label: 'Đăng nhập', to: '/login' },
    { label: 'Đăng ký', to: '/register' },
    { label: 'Blog', to: '/blogs' },
  ],
  CUSTOMER: [
    { label: 'Trang chủ', to: '/' },
    { label: 'Cửa hàng', to: '/catalog' },
    { label: 'Yêu thích', to: '/wishlist' },
    { label: 'Tài khoản', to: '/profile' },
    { label: 'Đơn hàng', to: '/orders' },
    { label: 'Hỗ trợ', to: '/tickets/' },
    { label: 'Blog', to: '/blogs' },
    { label: 'Đổi trả', to: '/return-requests'},
  ],
  MANAGER: [
    { label: 'Trang chủ', to: '/' },
    { label: 'Cửa hàng', to: '/catalog' },
    { label: 'Quản lý sản phẩm', to: '/manage' },
    { label: 'Đơn hàng', to: '/orders' },
    { label: 'Thống kê', to: '/statistic' },
    { label: 'Tài khoản', to: '/profile' },
    { label: 'Blog', to: '/blogs' },
    { label: 'Yêu cầu đổi trả', to: '/return-requests/manage'},
  ],
  SUPPORT_AGENT: [
    { label: 'Trang chủ', to: '/' },
    { label: 'Hỗ trợ', to: '/tickets/' },
    { label: 'Tài khoản', to: '/profile' },
  ],
  SHIPPER: [
    { label: 'Trang chủ', to: '/' },
    { label: 'Đơn hàng', to: '/orders' },
    { label: 'Tài khoản', to: '/profile' },
  ],
  SYSTEM_ADMIN: [
    { label: 'Trang chủ', to: '/' },
    { label: 'Cửa hàng', to: '/catalog' },
    { label: 'Quản lý người dùng', to: '/admin/users' },
    { label: 'Quản lý sản phẩm', to: '/manage' },
    { label: 'Đơn hàng', to: '/orders' },
    { label: 'Thống kê', to: '/statistic' },
  ],
};

export function Header({ className = '', ...props }) {
  const { user, logout } = useContext(AuthContext);
  const role = user?.roleName ?? user?.role;
  const navItems = navItemsByRole[role] ?? navItemsByRole.anonymous;
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (role !== 'CUSTOMER') return;

    let cancelled = false;

    const loadCartCount = async () => {
      try {
        const response = await fetch('/api/cart', {
          credentials: 'include',
        });

        if (!response.ok) {
          setCartCount(0);
          return;
        }

        const cart = await response.json();
        const totalQuantity =
            cart.items?.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0) ?? 0;

        if (!cancelled) {
          setCartCount(totalQuantity);
        }
      } catch {
        if (!cancelled) {
          setCartCount(0);
        }
      }
    };

    loadCartCount();

    window.addEventListener('cart-updated', loadCartCount);

    return () => {
      cancelled = true;
      window.removeEventListener('cart-updated', loadCartCount);
    };
  }, [role]);

  const navigate = useNavigate();

  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
      <header
          className={`bg-bg-base border-b border-border sticky top-0 z-50 ${className}`}
          {...props}
      >
        <Container className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-1 font-bold text-lg select-none cursor-pointer" onClick={() => navigate("/")}>
            <RiPlantFill className='text-xl -mt-0.5 text-green-500'></RiPlantFill>
            <span className='text-green-600'>Greenshop</span>
          </div>

          <nav className="hidden lg:flex gap-5">
            {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/'}>
                  {item.label}
                </NavLink>
            ))}
          </nav>

          {user && (
              <div className="flex items-center gap-3">
                {role === 'CUSTOMER' && (
                    <NavLink
                        to="/cart"
                        className="text-sm font-medium px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-green-50 hover:text-interactive hover:border-interactive transition-colors"
                    >
                      Giỏ hàng{cartCount > 0 ? ` (${cartCount})` : ''}
                    </NavLink>
                )}
                <NotificationBell />
                <span className="text-sm text-stone-600 hidden sm:block">
              {user.fullName ?? user.email}
            </span>
                <button
                    onClick={logout}
                    className="hidden sm:block cursor-pointer text-sm font-medium px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
                >
                  Đăng xuất
                </button>

              </div>
          )}

          <Button className="text-lg lg:hidden inline-block" onClick={() => setIsNavOpen(true)}>
            <HiMenuAlt3 />
          </Button>

          <div className={cn("fixed h-screen w-screen left-full top-0 bottom-0 overflow-y-scroll",
              "bg-bg-surface/70 backdrop-blur-sm transition-[left] duration-300",
              { "left-0": isNavOpen })}
          >
            <div className="flex text-green-600 flex-col p-10 mt-5 gap-2 max-w-125 m-auto relative">
              {navItems.map((item) => (
                  <NavLink key={item.to} to={item.to} className={cn(linkClass, "p-5 text-left hover:translate-x-2 text-3xl hover:w-full duration-400")} onClick={() => setIsNavOpen(false)} end={item.to === '/'}>
                    {item.label}
                  </NavLink>
              ))}

              {user && (
                  <div className="ps-5 text-green-700 mt-2 flex flex-col items-start gap-3">
                <span className="text-2xl text-stone-600">
                  {user.fullName ?? user.email}
                </span>
                    <button
                        onClick={logout}
                        className="cursor-pointer text-2xl font-medium px-3 py-1.5 rounded-lg border-2 border-stone-400 text-stone-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
                    >
                      Đăng xuất
                    </button>
                  </div>
              )}
              <Button className="all-revert hover:bg-green-300/50 bg-transparent cursor-pointer p-3 absolute top-0 right-5" onClick={() => setIsNavOpen(false)}>
                <RxCross1 className="text-3xl text-black" />
              </Button>
            </div>
          </div>
        </Container>
      </header>
  );
}