import { createContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

const AUTH_STORAGE_KEYS = ['treeshop-auth-user', 'currentUser'];

function clearStoredAuth() {
  if (typeof window === 'undefined') {
    return;
  }

  AUTH_STORAGE_KEYS.forEach((key) => {
    window.localStorage.removeItem(key);
  });
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/users/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else if (response.status === 401) {
          setUser(null);
        } else {
          setError('Failed to fetch user profile');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const isAdmin = user?.roleName === 'SYSTEM_ADMIN';

  const logout = async () => {
    const wasStaffSession =
      user?.roleName === 'SYSTEM_ADMIN' ||
      location.pathname.startsWith('/admin') ||
      location.pathname.startsWith('/staff-login');

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setUser(null);
        clearStoredAuth();
        navigate(wasStaffSession ? '/staff-login' : '/login', { replace: true });
      } else {
        setError('Failed to logout');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, error, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
<<<<<<< HEAD
<<<<<<< HEAD

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
=======
>>>>>>> 3961c7a (fix: fix ESLint errors)
=======
>>>>>>> ff49b2c (chore: added comments block for version control)
