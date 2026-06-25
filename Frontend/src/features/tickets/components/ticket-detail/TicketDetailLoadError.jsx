import { useNavigate } from "react-router-dom";
import { Container } from "../../../../components/global/Container";
import { Button } from "../../../../components/ui/Button";
import sadPlant from "../../assets/images/sadPlant.gif";

const TicketDetailLoadError = ({ detailState }) => {
	const navigate = useNavigate();

	const { isFetchDetailLoadingError } = detailState;

	return (
		<Container className="mt-10 font-semibold text-5xl">
			<h1
				className="border-5 text-2xl py-5 px-8 mx-auto rounded-full max-w-80 min-w-50 text-red-500 border-red-300"
				style={{ boxShadow: "15px 15px 0 5px" }}
			>
				{isFetchDetailLoadingError ? (
					<span>Không tìm thấy Ticket!</span>
				) : (
					<span>Lỗi Khi Tải Ticket</span>
				)}
			</h1>
			<div
				className="bg-bg-surface min-w-50 max-w-90 flex items-center mx-auto mt-20 justify-center rounded-full aspect-square w-[20%] p-5 text-green-500"
				style={{ boxShadow: "15px 15px 0 5px" }}
			>
				<img
					className="object-cover aspect-square w-[80%]"
					src={sadPlant}
					alt="Sad plant"
				/>
			</div>
			<Button
				onClick={() => navigate("/tickets/")}
				className="w-fit mb-4 hover:bg-green-400 text-lg mx-auto block mt-20 pr-8"
			>
				<h2>← Quay Lại</h2>
			</Button>
		</Container>
	);
};

export default TicketDetailLoadError;
