<<<<<<< HEAD
import { Routes, Route, Navigate } from "react-router-dom";
import TicketDashboard from "./features/tickets/TicketDashboard";
import TicketDetail from "./features/tickets/TicketDetail";
import { AuthProvider, useAuth } from "./context/AuthContext";
=======
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
>>>>>>> a916de3 (fix: fix ESLint errors (again))
import UserManagement from "./pages/UserManagement";
import Authentication from "./pages/Authentication";
<<<<<<< HEAD
=======
import StaffAuthentication from "./pages/StaffAuthentication";
import TicketDashboard from "./features/tickets/TicketDashboard";
import TicketDetail from "./features/tickets/TicketDetail";
import { Header } from "./components/global/Header";
>>>>>>> ff49b2c (chore: added comments block for version control)

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
<<<<<<< HEAD
	return (
		<Routes>
			<Route path="/login" element={<Authentication />} />
			<Route path="/register" element={<Authentication />} />
			<Route path="/" element={<Navigate to="/admin/users" replace />} />
			<Route
				path="/admin/users"
				element={<ProtectedAdminRoute element={<UserManagement />} />}
			/>
			<Route path="/tickets" element={<TicketDashboard className={"w-[75%]"} />} />
			<Route path="/tickets/:id" element={<TicketDetail />} />
			<Route path="*" element={<Navigate to="/admin/users" replace />} />
		</Routes>
	);
=======
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
                element={<TicketDashboard />}
            />

            <Route
                path="/tickets/:id"
                element={<TicketDetail />}
            />

            <Route
                path="*"
                element={<Navigate to="/admin/users" replace />}
            />
        </Routes>
    );
>>>>>>> ff49b2c (chore: added comments block for version control)
}

export default function App() {
    return (
        <>
            <Header />
            <AppRoutes />
        </>
    );
}