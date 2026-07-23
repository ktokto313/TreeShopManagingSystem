import { useEffect } from "react";
import { PageBar } from "../../../components/ui/PageBar";
import { Select } from "../../../components/ui/Select";
import { Skeleton } from "../../../components/ui/Skeleton";
import { cn } from "../../../utils/cn";
import { getRatingsOptions } from "../data/reviewsData";
import { useProductReview } from "../hooks/useProductReview";
import ReviewCommentCard from "./ReviewCommentCard";
import ReviewCommentSection from "./ReviewCommentSection";
import ReviewForm from "./ReviewForm";

const ReviewSection = ({
	className,
	productId,
	orderId,
	onReviewSubmitted,
}) => {
	const reviewState = useProductReview(productId, onReviewSubmitted);

	const {
		reviews,
		loadReviews,
		setRatingFilter,
		currentPage,
		totalPages,
		isReviewsLoading,
		pageSize,
		ratingFilter,
	} = reviewState;

	useEffect(() => {
		loadReviews(1);
	}, [productId, loadReviews, ratingFilter]);

	return (
		<div className={cn(className)}>
			{!reviewState.canManage && (
				<ReviewForm reviewState={reviewState} orderId={orderId}></ReviewForm>
			)}

			<ReviewCommentSection className="mt-5">
				<div className="w-full mb-3">
					<Select label="Số sao" options={getRatingsOptions()} onChange={(e) => setRatingFilter(e.target.value)} className="w-23"></Select>
				</div>
				<div className="space-y-3">
					{isReviewsLoading ? (
						Array.from({ length: pageSize }).map((_, idx) => (
							<div
								key={idx}
								className="p-4 border border-gray-200 rounded-xl bg-white space-y-3"
							>
								<div className="flex justify-between items-center">
									<div className="flex items-center gap-2">
										<Skeleton className="w-7 h-7 rounded-full" />
										<Skeleton className="w-24 h-4" />
									</div>
									<Skeleton className="w-12 h-4" />
								</div>
								<Skeleton className="w-full h-10" />
								<Skeleton className="w-20 h-3" />
							</div>
						))
					) : (
						<>
							{reviews.map((r) => (
								<ReviewCommentCard 
									key={r.id} 
									review={r} 
									canManage={reviewState.canManage}
									onHideToggle={() => reviewState.toggleReviewHide(r.id)}
									onCurateToggle={() => reviewState.toggleReviewCurate(r.id)}
								/>
							))}

							{reviews.length === 0 && <h2>Chưa có đánh giá nào</h2>}
						</>
					)}
				</div>

				{reviews.length > 0 && (
					<PageBar
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={(newPage) => loadReviews(newPage)}
						className="mt-6"
					/>
				)}
			</ReviewCommentSection>
		</div>
	);
};

export default ReviewSection;
