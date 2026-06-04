import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

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
