import { Routes, Route } from "react-router-dom";
import TicketDashboard from "./features/tickets/TicketDashboard";
import TicketDetail from "./features/tickets/TicketDetail";

const App = () => {
	return (
		<>
			<Routes>
				<Route
					path="/tickets"
					element={<TicketDashboard className={"w-[75%]"} />}
				/>
				<Route path="/tickets/:id" element={<TicketDetail />} />{" "}
				
			</Routes>
		</>
	);
};

export default App;
