import { IoStarSharp } from "react-icons/io5";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { cn } from "../../../utils/cn";
import { timeFormat } from "../../../utils/timeFormat";
import plantPfp from "../../products/assets/images/plantPfp.png";

const ReviewCommentCard = ({ review = {}, className, canManage, onHideToggle, onCurateToggle }) => {
	const { user, rating = null, comment = null, createdAt = null, hidden = false, curated = false } = review;
	const maxRating = 5;
	
	return (
		<Card className={cn(className)}>
			{/* Header */}
			<CardHeader className="flex bg-white justify-between">
				<div className="flex gap-2.5 items-center">
					<img
						src={plantPfp}
						className="aspect-square object-cover w-7 min-h-0 min-w-0 border-2 border-green-200 rounded-full"
					></img>
					<h3 className="text-sm">{user?.fullName}</h3>
				</div>
				<div className="flex items-center gap-1">
					<IoStarSharp className="text-amber-400 text-lg"></IoStarSharp>
					<h3>
						{rating} / {maxRating}
					</h3>
				</div>
			</CardHeader>

			{/* Content */}
			<CardContent className="bg-white min-h-20">
				<p className="text-sm">{comment}</p>
			</CardContent>

			{/* Footer */}
			<CardFooter className="flex justify-between items-center">
				<h4 className="text-xs text-gray-600">{timeFormat(createdAt)}</h4>
				{canManage && (
					<div className="flex gap-2">
						<Button 
							size="sm" 
							variant={hidden ? "primary" : "secondary"}
							onClick={onHideToggle}
							className={hidden ? "bg-gray-600 hover:bg-gray-700 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-100"}
						>
							{hidden ? 'Đã ẩn' : 'Ẩn'}
						</Button>
						<Button 
							size="sm" 
							variant={curated ? "primary" : "secondary"}
							onClick={onCurateToggle}
							disabled={hidden}
							className={hidden 
								? "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200" 
								: (curated ? "bg-green-600 hover:bg-green-700 text-white" : "border-green-300 text-green-700 hover:bg-green-50")}
						>
							{curated ? 'Đã chọn tiêu biểu' : 'Chọn tiêu biểu'}
						</Button>
					</div>
				)}
			</CardFooter>
		</Card>
	);
};

export default ReviewCommentCard;
