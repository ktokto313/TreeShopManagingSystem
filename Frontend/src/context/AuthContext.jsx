import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

const AUTH_STORAGE_KEYS = ["treeshop-auth-user", "currentUser"];

function clearStoredAuth() {
	if (typeof window === "undefined") return;
	AUTH_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
}

function normalizeUser(user) {
	if (!user) return null;
	const roleName = user.roleName ?? user.role ?? null;
	const role = user.role ?? roleName;
	return { ...user, role, roleName };
}

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await fetch("/api/users/me", {
					method: "GET",
					credentials: "include",
				});
				if (response.ok) {
					setUser(normalizeUser(await response.json()));
				} else if (response.status === 401) {
					setUser(null);
				} else {
					setError("Failed to fetch user profile");
				}
			} catch (err) {
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		};
		fetchUser();
	}, []);

	const isAdmin = user?.roleName === "SYSTEM_ADMIN";
	const isAuthenticated = Boolean(user);
	const canManage = user?.roleName === "SYSTEM_ADMIN" || user?.roleName === "MANAGER";

	const login = async (emailOrCredentials, password) => {
		const credentials =
			typeof emailOrCredentials === "object"
				? emailOrCredentials
				: { email: emailOrCredentials, password };
		setIsLoading(true);
		setError(null);
		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(credentials),
			});
			if (!response.ok) {
				const loginError = new Error("Login failed. Check your credentials.");
				loginError.status = response.status;
				throw loginError;
			}
			const loggedInUser = normalizeUser(await response.json());
			setUser(loggedInUser);
			return loggedInUser;
		} catch (err) {
			setUser(null);
			setError(err.message);
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	const loginWithGoogle = (googleUser) => {
		const loggedInUser = normalizeUser(googleUser);
		setUser(loggedInUser);
		setError(null);
		return loggedInUser;
	};

	const register = async (fullName, email, password) => {
		setError(null);
		const response = await fetch("/api/auth/register", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ fullName, email, password }),
		});
		if (!response.ok) {
			const registerError = new Error(
				response.status === 409 ? "Email already registered" : "Registration failed",
			);
			registerError.status = response.status;
			setError(registerError.message);
			throw registerError;
		}
		return true;
	};

	const updateUser = (updates) => {
		setUser((current) => normalizeUser({ ...current, ...updates }));
	};

	const logout = async () => {
		try {
			const response = await fetch("/api/auth/logout", {
				method: "POST",
				credentials: "include",
			});
			if (response.ok) {
				setUser(null);
				clearStoredAuth();
			} else {
				setError("Failed to logout");
			}
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				isAdmin,
				isAuthenticated,
				canManage,
				isLoading,
				error,
				login,
				loginWithGoogle,
				register,
				updateUser,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
