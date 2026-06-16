import { Navigate, Route, Routes } from "react-router-dom";
import { Header } from "./components/global/Header";
import TicketDetail from "./features/tickets/components/TicketDetail";
import { useAuth } from "./hooks/useAuth";
import Authentication from "./pages/StaffAuthentication";
import StaffAuthentication from "./pages/StaffAuthentication";
import UserManagement from "./pages/UserManagement";
import TicketManagement from "./pages/TicketManagement";
import HomePage from "./pages/HomePage";
import LoadingScreen from "./pages/LoadingScreen";

function ProtectedAdminRoute({ element }) {
	const { isAdmin, isLoading } = useAuth();

	if (isLoading) {
		return <LoadingScreen></LoadingScreen>
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
			<Route
				path="/tickets"
				element={<TicketManagement />}
			/>
			<Route 
                path="/tickets/:id" 
                element={<TicketDetail />} 
            />

			<Route path="/home" element={<HomePage></HomePage>}></Route>

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
