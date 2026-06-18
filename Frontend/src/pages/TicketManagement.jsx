import TicketDashboard from "../features/tickets/components/ticket-dashboard/TicketDashboard";
import { TicketDashboardFilterBoard } from "../features/tickets/components/ticket-dashboard/TicketDashboardFilter";
import { useTicketDashboard } from "../features/tickets/hooks/useTicketDashboard";
import { cn } from "../utils/cn";

const TicketManagement = () => {
	const dashboardState = useTicketDashboard();

	return (
		<div className="flex flex-row gap-2 w-full p-4">
			<TicketDashboardFilterBoard
				classNames="hidden md:flex flex-2 max-w-70 top-4"
				dashboardState={dashboardState}
			/>
			<TicketDashboard
				className={cn(
					"border-2 border-border mx-auto w-full rounded-2xl min-h-180 flex flex-col flex-5",
				)}
				dashboardState={dashboardState}
			/>
		</div>
	);
};

export default TicketManagement;
