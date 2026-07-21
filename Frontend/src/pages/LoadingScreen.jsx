import { Container } from "../components/global/Container";
import { CgSpinner } from "react-icons/cg";
import { cn } from "../utils/cn";

const LoadingScreen = ({className}) => {
	return (
		<Container className={cn("flex items-center justify-content-center h-screen", className)}>
			<h1 className="flex gap-4 items-center text-3xl mx-auto w-max text-green-600">
				<CgSpinner className="animate-spin" /> Đang tải...
			</h1>
		</Container>
	);
};

export default LoadingScreen;
