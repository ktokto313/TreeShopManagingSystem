import { Navigate, Route, Routes } from "react-router-dom";
import { Footer } from "./components/global/Footer";
import { Header } from "./components/global/Header";
import ChangePasswordPage from "./features/auth/pages/ChangePasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";
import LoginPage from "./features/auth/pages/LoginPage";
import ProfilePage from "./features/auth/pages/ProfilePage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import OrderManagement from "./features/orders/OrderManagement";
import CartPage from "./pages/CartPage";
import CatalogPage from "./pages/CatalogPage";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import ReviewCheckoutPage from "./pages/ReviewCheckoutPage";
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
import TicketDetailPage from "./pages/TicketDetailPage";
import BlogPage from './features/blog/pages/BlogPage';
import MyBlogPage from './features/blog/pages/MyBlogPage';
import BlogDetailPage from './features/blog/pages/BlogDetailPage';
import BlogPendingPage from './features/blog/pages/BlogPendingPage';
import WishlistPage from "./pages/WishlistPage";
import ProfitDashboard from "./features/statistic/ProfitDashboard";
import PolicyPage from "./pages/PolicyPage";
import PolicyDetailsPage from "./pages/PolicyDetailsPage";
import CreatePolicyPage from "./pages/CreatePolicyPage";
import CustomerReturnRequestPage from "./features/return&exchange/pages/CustomerReturnRequestPage";
import ManagerReturnRequestPage from "./features/return&exchange/pages/ManagerReturnRequestPage";
import ManagerReturnReportPage from "./features/return&exchange/pages/ManagerReturnReportPage";
function ProtectedRoute({ element, roles = [] }) {
	const { user, isLoading } = useContext(AuthContext);
	if (isLoading) return <LoadingScreen></LoadingScreen>;
	if (!hasAllowedRole(user, roles)) return <Navigate to="/login" replace />;
	return element;
}

function AppRoutes() {
	return (
		<Routes>
			{/* Others */}
			<Route path="/" element={<HomePage />} />

			<Route path="/policy" element={<PolicyPage />} />
			<Route
				path="/policy/create"
				element={
					<ProtectedRoute
						roles={["MANAGER", "SYSTEM_ADMIN"]}
						element={<CreatePolicyPage />}
					/>
				}
			/>
			<Route path="/policy/:id" element={<PolicyDetailsPage />} />

			{/* Auth and Account */}
			<Route path="/login" element={<LoginPage />} />
			<Route path="/register" element={<RegisterPage />} />
			<Route path="/staff-login" element={<StaffAuthentication />} />

			<Route
				path="/profile"
				element={<ProtectedRoute element={<ProfilePage />} />}
			/>

			<Route
				path="/change-password"
				element={<ProtectedRoute element={<ChangePasswordPage />} />}
			/>
			<Route
				path="/reset-password"
				element={<ResetPasswordPage />}
			/>

			{/* Catalog */}
			<Route path="/catalog" element={<CatalogPage />} />
			<Route path="/catalog/category/:categoryId" element={<CatalogPage />} />
			<Route path="/catalog/:productId" element={<ProductDetailPage />} />
			<Route
				path="/wishlist"
				element={
					<ProtectedRoute
						roles={["CUSTOMER"]}
						element={<WishlistPage />}
					/>
				}
			/>
			
			{/* Cart and Checkout */}
			<Route
				path="/cart"
				element={<ProtectedRoute roles={["CUSTOMER"]} element={<CartPage />} />}
			/>
			<Route
				path="/checkout"
				element={<ProtectedRoute roles={["CUSTOMER"]} element={<CheckoutPage />} />}
			/>
			<Route
				path="/checkout/success/:orderId"
				element={
					<ProtectedRoute
						roles={["CUSTOMER"]}
						element={<CheckoutSuccessPage />}
					/>
				}
			/>
			<Route
				path="/checkout/review"
				element={
					<ProtectedRoute
						roles={["CUSTOMER"]}
						element={<ReviewCheckoutPage />}
					/>
				}
			/>

			{/* Admin and Manager */}
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
			<Route
				path="/tickets/"
				element={
					<ProtectedRoute
						roles={["SUPPORT_AGENT", "CUSTOMER"]}
						element={<TicketManagement />}
					/>
				}
			/>
			<Route
				path="/tickets/:id"
				element={
					<ProtectedRoute
						roles={["SUPPORT_AGENT", "CUSTOMER"]}
						element={<TicketDetailPage />}
					/>
				}
			/>

			{/* Orders */}
			<Route
				path="/orders"
				element={
					<ProtectedRoute
						roles={["SHIPPER", "MANAGER", "CUSTOMER", "SYSTEM_ADMIN"]}
						element={<OrderManagement />}
					/>
				}
			/>

			{/* Blogs */}
			<Route
				path="/blogs"
				element={<BlogPage />} />
			<Route
				path="/blogs/my"
				element={<ProtectedRoute roles={['CUSTOMER', 'MANAGER']} element={<MyBlogPage />} />}
			/>
			<Route
				path="/blogs/pending"
				element={<ProtectedRoute roles={['MANAGER']} element={<BlogPendingPage />} />}
			/>
			<Route path="/blogs/:id"
				   element={<BlogDetailPage />} />

			{/* Statistics */}
			<Route
				path="/statistic"
				element={
					<ProtectedRoute
						roles={["MANAGER", "SYSTEM_ADMIN"]}
						element={<ProfitDashboard />}
					/>
				}
			/>
			{/* Return and Exchange */}
			<Route
				path="/return-requests"
				element={
					<ProtectedRoute
						roles={["CUSTOMER"]}
						element={<CustomerReturnRequestPage />}
					/>
				}
			/>
			<Route
				path="/return-requests/manage"
				element={
					<ProtectedRoute
						roles={["MANAGER"]}
						element={<ManagerReturnRequestPage />}
					/>
				}
			/>
			<Route
				path="/return-requests/report"
				element={
					<ProtectedRoute
						roles={["MANAGER"]}
						element={<ManagerReturnReportPage />}
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
