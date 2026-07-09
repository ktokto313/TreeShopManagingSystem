import PolicyDetails from "../features/policy/components/PolicyDetails";
import { usePolicy } from "../features/policy/hooks/usePolicy";

const CreatePolicyPage = () => {
	const { handleCreatePolicy, updateLoading } = usePolicy();

	return (
		<div className="mx-auto mt-8 w-[90%] sm:w-[80%] max-w-230">
            <h1 className="text-2xl font-bold text-green-700 mb-4">Thêm chính sách mới</h1>
			<PolicyDetails 
				policy={null}
                isCreate={true}
				onCreate={handleCreatePolicy}
				updateLoading={updateLoading}
			/>
		</div>
	);
};
export default CreatePolicyPage;
