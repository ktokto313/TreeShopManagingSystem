import { useEffect } from "react";
import { cn } from "../../../utils/cn";
import ReviewCommentCard from "./ReviewCommentCard";
import ReviewCommentSection from "./ReviewCommentSection";
import ReviewForm from "./ReviewForm";
import { useProductReview } from "../hooks/useProductReview";

const ReviewSection = ({ className, productId, orderId, onReviewSubmitted }) => {
	const reviewState = useProductReview(productId, onReviewSubmitted);

	const {
		reviews,
		loadReviews,
	} = reviewState;

	useEffect(() => {
		loadReviews(productId);
	}, [productId, loadReviews]);

	return (
		<div className={cn(className)}>
			<ReviewForm
				reviewState={reviewState}
				orderId={orderId}
			></ReviewForm>

			<ReviewCommentSection className="mt-5">
				<div className="space-y-3">
					{reviews.map((r) => (
						<ReviewCommentCard key={r.id} review={r}></ReviewCommentCard>
					))}

					{reviews.length == 0 && <h2>Chưa có đánh giá nào</h2>}
				</div>
			</ReviewCommentSection>
		</div>
	);
};

export default ReviewSection;
