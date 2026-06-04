import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

// Context hook - exported separately to satisfy fast refresh rules
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch current user profile from /api/users/me
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
          // Not authenticated
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

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}
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
