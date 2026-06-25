import { useNavigate } from "react-router-dom";
import LoadingScreen from "../../../../pages/LoadingScreen";
import { Container } from "../../../../components/global/Container";
import { Button } from "../../../../components/ui/Button";
import TicketDetailHeader from './TicketDetailHeader';
import TicketDetailStatusWrapper from './TicketDetailStatusWrapper';
import TicketDetailCommentSection from './TicketDetailCommentSection';

const TicketDetail = ({detailState}) => {
	const navigate = useNavigate();

	const { isFetchDetailLoading } = detailState;

	if (isFetchDetailLoading) return <LoadingScreen></LoadingScreen>;

	return (
		<Container className="max-w-4xl mx-auto mt-10 p-5 flex flex-col gap-6">
			<Button
				onClick={() => navigate("/tickets/")}
				className="w-fit mb-1 py-2 hover:bg-green-400 pr-6 text-xl"
			>
				← Quay Lại
			</Button>

			<TicketDetailHeader detailState={detailState}></TicketDetailHeader>
			<TicketDetailStatusWrapper
				detailState={detailState}
			></TicketDetailStatusWrapper>
			<TicketDetailCommentSection
				detailState={detailState}
			></TicketDetailCommentSection>
		</Container>
	);
};

export default TicketDetail;
