import { Container } from "../components/global/Container";
import { CgSpinner } from "react-icons/cg";

const LoadingScreen = () => {
	return (
		<Container className="flex items-center justify-content-center h-screen">
			<h1 className="flex gap-4 items-center text-3xl mx-auto w-max text-green-600">
				<CgSpinner className="animate-spin" /> Đang tải...
			</h1>
		</Container>
	);
};

export default LoadingScreen;
