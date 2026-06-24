import { IoStarSharp } from "react-icons/io5";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "../../../../components/ui/Card";
import { cn } from "../../../../utils/cn";
import { timeFormat } from "../../../../utils/timeFormat";
import plantPfp from "../../assets/images/plantPfp.png";

const ReviewCommentCard = ({ review = {}, className }) => {
	const { user, rating = null, comment = null, createdAt = null } = review;
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
			<CardFooter>
				<h4 className="text-xs text-gray-600">{timeFormat(createdAt)}</h4>
			</CardFooter>
		</Card>
	);
};

export default ReviewCommentCard;
