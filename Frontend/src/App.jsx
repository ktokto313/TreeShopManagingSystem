import { Routes, Route } from "react-router-dom";
import TicketDashboard from "./features/tickets/TicketDashboard";
import TicketDetail from "./features/tickets/TicketDetail";
import OrderManagement from "./features/orders/OrderManagement"

const App = () => {
	return (
		<>
			<Routes>
				<Route
					path="/tickets"
					element={<TicketDashboard className={"w-[75%]"} />}
				/>
				<Route path="/tickets/:id" element={<TicketDetail />} />{" "}
				<Route path="/orders" element={<OrderManagement />} />
			</Routes>
		</>
	);
};

export default App;
