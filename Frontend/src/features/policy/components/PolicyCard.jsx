import { useNavigate } from "react-router-dom";
import { Card, CardHeader } from "./../../../components/ui/Card";
import { LuClipboardList } from "react-icons/lu";
import { cn } from "../../../utils/cn";

const PolicyCard = ({ policy, ...props }) => {
	const navigate = useNavigate();
	const { id, title } = policy;

	const getPolicyStyles = () => {
		switch(policy.status.toLowerCase()){
			case "published":
				return "border-green-400 hover:border-blue-300 text-green-700"
			case "draft":
				return "border-gray-500 hover:border-gray-400 text-gray-700"
			case "archived":
				return "border-red-500 hover:border-red-400 text-red-700"
		}
	}

	return (
		<Card onClick={() => {navigate(`/policy/${id}`)}} className={cn	("bg-white w-full border-b-6 cursor-pointer hover:-translate-y-1 duration-200", getPolicyStyles())} {...props}>
			<CardHeader className="flex items-center justify-between pl-4">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <LuClipboardList className="text-sm sm:text-lg lg:text-xl"></LuClipboardList>
          <h1 className="text-xs sm:text-sm md:text-lg text-ellipsis overflow-hidden w-full inline-block min-w-0 whitespace-nowrap">
            {title}
          </h1>
        </div>
				<span className="text-xs sm:text-sm md:text-base text-green-500">#{id}</span>
			</CardHeader>
		</Card>
	);
};

export default PolicyCard;
