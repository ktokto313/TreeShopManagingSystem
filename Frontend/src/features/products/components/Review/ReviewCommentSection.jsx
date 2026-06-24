import { cn } from "../../../../utils/cn";
import styles from "../../assets/styles/commentSection.module.css";

const ReviewCommentSection = ({ className, children }) => {
	return (
		<div
			className={cn(
				"p-5.5 px-6 border border-gray-400 rounded-2xl",
				className,
				styles.commentSection,
			)}
		>
			<h1 className="text-2xl mb-4 font-semibold">Đánh Giá Của Khách Hàng</h1>
			<hr className="mb-4.5"></hr>

			{children}
		</div>
	);
};

export default ReviewCommentSection;
