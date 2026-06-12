import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const AUTH_STORAGE_KEYS = ["treeshop-auth-user", "currentUser"];

function clearStoredAuth() {
	if (typeof window === "undefined") {
		return;
	}

	AUTH_STORAGE_KEYS.forEach((key) => {
		window.localStorage.removeItem(key);
	});
}

function normalizeUser(user) {
	if (!user) {
		return null;
	}

	const roleName = user.roleName ?? user.role ?? null;
	return { ...user, roleName };
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

	const login = async (credentials) => {
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
				throw new Error("Login failed. Check your credentials.");
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

	const logout = async () => {
		const wasStaffSession =
			user?.roleName === "SYSTEM_ADMIN" ||
			location.pathname.startsWith("/admin") ||
			location.pathname.startsWith("/staff-login");

		try {
			const response = await fetch("/api/auth/logout", {
				method: "POST",
				credentials: "include",
			});

			if (response.ok) {
				setUser(null);
				clearStoredAuth();
				navigate(wasStaffSession ? "/staff-login" : "/login", {
					replace: true,
				});
			} else {
				setError("Failed to logout");
			}
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<AuthContext.Provider
			value={{ user, isAdmin, isLoading, error, login, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
}
