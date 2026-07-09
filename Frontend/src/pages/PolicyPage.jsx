import { usePolicy } from "../features/policy/hooks/usePolicy";
import PolicyList from "../features/policy/components/PolicyList";

const PolicyPage = () => {
	const state = usePolicy();

	return (
		<div className="p-6 sm:p-10 lg:pt-10 lg:px-25">
			<PolicyList state={state}></PolicyList>
		</div>
	);
};
export default PolicyPage;
