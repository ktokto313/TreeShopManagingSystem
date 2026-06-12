import { Navigate, Route, Routes } from "react-router-dom";
import { Header } from "./components/global/Header";
import TicketDashboard from "./features/tickets/TicketDashboard";
import TicketDetail from "./features/tickets/TicketDetail";
import { useAuth } from "./hooks/useAuth";
import Authentication from "./pages/Authentication";
import StaffAuthentication from "./pages/StaffAuthentication";
import UserManagement from "./pages/UserManagement";

function ProtectedAdminRoute({ element }) {
	const { isAdmin, isLoading } = useAuth();

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!isAdmin) {
		return <Navigate to="/staff-login" replace />;
	}

	return element;
}

function AppRoutes() {
	return (
		<Routes>
			<Route path="/login" element={<Authentication />} />
			<Route path="/register" element={<Authentication />} />
			<Route path="/staff-login" element={<StaffAuthentication />} />
			<Route path="/" element={<Navigate to="/admin/users" replace />} />
			<Route
				path="/admin/users"
				element={<ProtectedAdminRoute element={<UserManagement />} />}
			/>
			<Route path="/tickets" element={<TicketDashboard />} />
			<Route path="/tickets/:id" element={<TicketDetail />} />
			<Route path="*" element={<Navigate to="/admin/users" replace />} />
		</Routes>
	);
}

export default function App() {
	return (
		<>
			<Header />
			<AppRoutes />
		</>
	);
}
