import { Navigate, Route, Routes } from "react-router-dom";
import { Footer } from "./components/global/Footer";
import { Header } from "./components/global/Header";
import ChangePasswordPage from "./features/auth/pages/ChangePasswordPage";
import LoginPage from "./features/auth/pages/LoginPage";
import ProfilePage from "./features/auth/pages/ProfilePage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import OrderManagement from "./features/orders/OrderManagement";
import TicketDashboard from "./features/tickets/components/TicketDashboard";
import TicketDetail from "./features/tickets/components/TicketDetail";
import CatalogPage from "./pages/CatalogPage";
import HomePage from "./pages/HomePage";
import ManagementPage from "./pages/ManagementPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import StaffAuthentication from "./pages/StaffAuthentication";
import UserManagement from "./pages/UserManagement";
import LoadingScreen from "./pages/LoadingScreen";
import TicketManagement from "./pages/TicketManagement";
import { useContext } from "react";
import { hasAllowedRole } from "./utils/authRoutes";
import { AuthContext } from "./context/AuthContext";

function ProtectedRoute({ element, roles = [] }) {
	const { user, isLoading } = useContext(AuthContext);
	if (isLoading) return <LoadingScreen></LoadingScreen>;
	if (!hasAllowedRole(user, roles)) return <Navigate to="/login" replace />;
	return element;
}

function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<HomePage />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/register" element={<RegisterPage />} />
			<Route path="/staff-login" element={<StaffAuthentication />} />
			<Route path="/catalog" element={<CatalogPage />} />
			<Route path="/catalog/category/:categoryId" element={<CatalogPage />} />
			<Route path="/catalog/:productId" element={<ProductDetailPage />} />
			<Route
				path="/profile"
				element={<ProtectedRoute element={<ProfilePage />} />}
			/>
			<Route
				path="/change-password"
				element={<ProtectedRoute element={<ChangePasswordPage />} />}
			/>
			<Route
				path="/manage"
				element={
					<ProtectedRoute
						roles={["MANAGER", "SYSTEM_ADMIN"]}
						element={<ManagementPage />}
					/>
				}
			/>
			<Route
				path="/admin/users"
				element={
					<ProtectedRoute
						roles={["SYSTEM_ADMIN"]}
						element={<UserManagement />}
					/>
				}
			/>

			{/* Tickets */}
			<Route path="/tickets" element={<TicketManagement />} />
			<Route path="/tickets/:id" element={<TicketDetail />} />

			{/* Orders */}
			<Route
				path="/tickets"
				element={<Navigate to="/tickets/dashboard" replace />}
			/>
			<Route
				path="/tickets/dashboard"
				element={
					<ProtectedRoute
						roles={["SUPPORT_AGENT", "CUSTOMER", "SYSTEM_ADMIN"]}
						element={<TicketDashboard />}
					/>
				}
			/>
			<Route
				path="/tickets/:id"
				element={
					<ProtectedRoute
						roles={["SUPPORT_AGENT", "CUSTOMER", "SYSTEM_ADMIN"]}
						element={<TicketDetail />}
					/>
				}
			/>
			<Route
				path="/orders"
				element={
					<ProtectedRoute
						roles={["SHIPPER", "MANAGER", "CUSTOMER", "SYSTEM_ADMIN"]}
						element={<OrderManagement />}
					/>
				}
			/>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

export default function App() {
	return (
		<div className="flex min-h-screen flex-col">
			<Header />
			<div className="flex-1">
				<AppRoutes />
			</div>
			<Footer />
		</div>
	);
}
