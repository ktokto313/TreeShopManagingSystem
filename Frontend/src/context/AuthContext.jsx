import { createContext, useEffect, useState } from "react";
import { loginApi, registerApi } from "../data/authApi";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("currentUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(user ? false : true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) return;

    const fetchUser = async () => {
      try {
        const response = await fetch("/api/users/me", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem("currentUser", JSON.stringify(userData));
        } else {
          setUser(null);
          localStorage.removeItem("currentUser");
        }
      } catch (err) {
        setError(err.message);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const executeAuth = async (authOption = "login", formData) => {
    setIsLoading(true);
    setError(null);
    try {
      let userData;
      if (authOption === "login") {
        userData = await loginApi(formData);
      } else if (authOption === "register") {
        userData = await registerApi(formData);
      }
      setUser(userData);
      localStorage.setItem("currentUser", JSON.stringify(userData));
      return userData;
    } catch (err) {
      setError(err.message || err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  const isAdmin = user?.roleName === "SYSTEM_ADMIN";

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, error, executeAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
