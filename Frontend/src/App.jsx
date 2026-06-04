<<<<<<< HEAD
﻿import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import UserManagement from "./pages/UserManagement";
import Authentication from "./pages/Authentication";
import TicketDashboard from "./features/tickets/TicketDashboard";
import TicketDetail from "./features/tickets/TicketDetail";

function ProtectedAdminRoute({ element }) {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 rounded-full border-4 border-stone-200 border-t-[#283C1D] animate-spin mx-auto mb-4" />
          <p className="text-stone-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return element;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Authentication />} />
      <Route path="/register" element={<Authentication />} />
      <Route path="/tickets" element={<TicketDashboard />} />
      <Route path="/tickets/:id" element={<TicketDetail />} />
      <Route path="/" element={<Navigate to="/admin/users" replace />} />
      <Route path="/admin/users" element={<ProtectedAdminRoute element={<UserManagement />} />} />
      <Route path="*" element={<Navigate to="/admin/users" replace />} />
    </Routes>
  );
}

const App = () => {
  return <AppRoutes />;
=======
import { Route, Routes } from "react-router-dom";
import OrderManagement from "./pages/OrderManagement";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<OrderManagement />} />
      <Route path="/orders/*" element={<OrderManagement />} />
    </Routes>
  );
>>>>>>> upstream/LKT
};

export default App;
