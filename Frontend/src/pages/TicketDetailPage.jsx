import { useParams } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";
import TicketDetailLoadError from "../features/tickets/components/ticket-detail/TicketDetailLoadError";
import TicketDetail from "../features/tickets/components/ticket-detail/TicketDetail";
import { useTicketDetail } from './../features/tickets/hooks/useTicketDetail';

const TicketDetailPage = () => {
	const { id: ticketId } = useParams();

	const detailState = useTicketDetail(ticketId);

	const {
		isFetchDetailLoadingError,
		isFetchDetailLoading,
		
	} = detailState;

	if (isFetchDetailLoading)
		return (
			<LoadingScreen></LoadingScreen>
		);

	if (isFetchDetailLoadingError)
		return (
			<TicketDetailLoadError detailState={detailState}></TicketDetailLoadError>
		);

	return (
		<TicketDetail detailState={detailState}></TicketDetail>
	);
};

export default TicketDetailPage;
