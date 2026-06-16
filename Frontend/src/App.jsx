import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Header } from "./components/global/Header";
import { useAuth } from "./context/AuthContext.jsx";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import StaffAuthentication from "./pages/StaffAuthentication";
import UserManagement from "./pages/UserManagement";

function ProtectedAdminRoute({ element }) {
	const { isAdmin, isLoading } = useAuth();
	if (isLoading) return <div>Loading...</div>;
	if (!isAdmin) return <Navigate to="/staff-login" replace />;
	return element;
}

function AppRoutes() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route path="/register" element={<RegisterPage />} />
			<Route path="/staff-login" element={<StaffAuthentication />} />
			<Route path="/" element={<Navigate to="/admin/users" replace />} />
			<Route
				path="/admin/users"
				element={<ProtectedAdminRoute element={<UserManagement />} />}
			/>
			<Route path="*" element={<Navigate to="/admin/users" replace />} />
		</Routes>
	);
}

export default function App() {
	const location = useLocation();
	const showHeader = location.pathname !== "/staff-login";
	return (
		<>
			{showHeader && (
				<div className="[&_nav]:hidden">
					<Header />
				</div>
			)}
			<AppRoutes />
		</>
	);
}
