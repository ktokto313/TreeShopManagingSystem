import { useState } from "react";
import { IoReload, IoStarSharp } from "react-icons/io5";
import { MdBlock } from "react-icons/md";
import { Button } from "../../../components/ui/Button";
import { Form } from "../../../components/ui/Form";
import { Textarea } from "../../../components/ui/Textarea";
import { cn } from "../../../utils/cn";
import styles from "../assets/styles/review-form.module.css";

const ReviewForm = ({className, reviewState, orderId}) => {
	const placeholder = "Bạn thích hoặc không thích gì về sản phẩm này?";
	const [charCount, setCharCount] = useState(0);
	const MAX_CHARS = 500;

	const {
		handleReviewForm,
		handleStarOnClick,
		starValue,
		reviewValidationError,
		isReviewSubmitLoading,
	} = reviewState;

	if (!orderId) {
		return (
			<div className={cn("border border-gray-400 p-6 rounded-2xl", className)}>
				<h1 className="text-2xl font-semibold">Viết Đánh Giá</h1>
				<hr className="my-4" />
				<p className="text-gray-600 font-medium">Bạn có thể đánh giá sản phẩm trong lịch sử lí đơn hàng!</p>
			</div>
		);
	}

	return (
		<Form
			onSubmit={(e) => {handleReviewForm(e, orderId)}}
			onReset={() => setCharCount(0)}
			className={cn(
				"border border-gray-400 p-6 rounded-2xl",
				className,
				styles.reviewForm,
			)}
		>
			{/* Title */}
			{starValue && <input type="hidden" value={starValue} name="rating"></input>}

			<h1 className="text-2xl font-semibold">Viết Đánh Giá</h1>
			<hr></hr>

			{/* Stars */}
			<h5>Số sao</h5>
			<div className={cn("gap-1 text-2xl -mt-3", styles.starsContainer)}>
				{Array.from({ length: 5 }).map((_, index) => (
					<span
						className={cn(index === starValue - 1 && styles.selectedStar)}
						key={crypto.randomUUID()}
					>
						<IoStarSharp
							onClick={() => handleStarOnClick(index + 1)}
							data-value={index + 1}
						></IoStarSharp>
					</span>
				))}
			</div>

			{/* Comment */}
			<h5>Bình luận đánh giá của bạn</h5>
			<Textarea
				name="comment"
				placeholder={placeholder}
				maxLength={MAX_CHARS}
				onChange={(e) => setCharCount(e.target.value.length)}
			/>
			<div className="text-right text-xs text-gray-500 -mt-2.5">
				{charCount} / {MAX_CHARS} ký tự
			</div>
			<Button type="submit" className="hover:bg-green-400 flex gap-1 mt-1">
				{isReviewSubmitLoading && (
					<IoReload className="animate-spin text-white text-base"></IoReload>
				)}
				Gửi Đánh Giá
			</Button>

			{reviewValidationError && (
				<span className="flex gap-2 py-2 px-4 items-center rounded-xl bg-red-500 text-white">
					<MdBlock className="text-xl" />
					<p>{reviewValidationError}</p>
				</span>
			)}
		</Form>
	);
};

export default ReviewForm;
