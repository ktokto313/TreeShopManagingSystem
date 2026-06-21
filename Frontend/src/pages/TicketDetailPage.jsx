import { useParams } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";
import TicketDetailLoadError from "../features/tickets/components/ticket-detail/TicketDetailLoadError";
import TicketDetail from "../features/tickets/components/ticket-detail/TicketDetail";
import { useTicketDetail } from './../features/tickets/hooks/useTicketDetail';

const TicketDetailPage = () => {
	const { id: ticketId } = useParams();

	const detailState = useTicketDetail(ticketId);

	const {
		ticket,
		isFetchDetailLoading
	} = detailState;

	if (isFetchDetailLoading)
		return (
			<LoadingScreen></LoadingScreen>
		);

	if (!ticket)
		return (
			<TicketDetailLoadError></TicketDetailLoadError>
		);

	return (
		<TicketDetail></TicketDetail>
	);
};

export default TicketDetailPage;
