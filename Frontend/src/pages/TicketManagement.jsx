import { Outlet } from "react-router-dom";
import { Button } from "../components/ui/Button";
import useAuthUser from "../hooks/useAuthUser";

const TicketManagement = () => {
  const {executeAuth} = useAuthUser()
	return (
		<div className="ticket-management-layout">
			<Button variant="secondary" size="sm" onClick={() => executeAuth()}>
				Login
			</Button>
			<Outlet />
		</div>
	);
};

export default TicketManagement;
