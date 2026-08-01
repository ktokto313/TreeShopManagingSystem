import { useNavigate } from "react-router-dom";
import LoadingScreen from "../../../../pages/LoadingScreen";
import { Container } from "../../../../components/global/Container";
import { Button } from "../../../../components/ui/Button";
import TicketDetailHeader from './TicketDetailHeader';
import TicketDetailStatusWrapper from './TicketDetailStatusWrapper';
import TicketDetailCommentSection from './TicketDetailCommentSection';
import { IoReload } from "react-icons/io5";
import { cn } from "../../../../utils/cn";

const TicketDetail = ({detailState}) => {
	const navigate = useNavigate();

	const { isFetchDetailLoading, loadData } = detailState;

	if (isFetchDetailLoading && !detailState.ticket) return <LoadingScreen></LoadingScreen>;

	return (
		<Container className="max-w-4xl mx-auto mt-10 p-5 flex flex-col gap-6">
			<div className="flex gap-2 mb-1">
				<Button
					onClick={() => navigate("/tickets/")}
					className="w-fit py-2 hover:bg-green-400 pr-6 text-xl"
				>
					← Quay Lại
				</Button>
				<Button
					onClick={loadData}
					className="w-fit py-2 hover:bg-green-400 px-4"
				>
					<IoReload className={cn("text-xl", { "animate-spin": isFetchDetailLoading })} />
				</Button>
			</div>

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
