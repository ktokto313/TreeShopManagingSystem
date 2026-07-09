import PolicyDetails from "../features/policy/components/PolicyDetails";
import { useParams } from "react-router-dom";
import { usePolicy } from "../features/policy/hooks/usePolicy";
import LoadingScreen from "./LoadingScreen";

const PolicyDetailsPage = () => {
	const { id } = useParams();
	const { policy, loading, handleUpdatePolicy, updateLoading } = usePolicy(id);

	if (loading) {
		return <LoadingScreen className={"h-[75vh]"}></LoadingScreen>
	}

	return (
		<div className="mx-auto mt-8 w-[90%] sm:w-[80%] max-w-230">
			<PolicyDetails 
				policy={policy}
				onUpdate={handleUpdatePolicy}
				updateLoading={updateLoading}
			></PolicyDetails>
		</div>
	);
};
export default PolicyDetailsPage;
