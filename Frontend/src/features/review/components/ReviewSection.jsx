import { useEffect } from "react";
import { cn } from "../../../utils/cn";
import ReviewCommentCard from "./ReviewCommentCard";
import ReviewCommentSection from "./ReviewCommentSection";
import ReviewForm from "./ReviewForm";
import { useProductReview } from "../hooks/useProductReview";
import { Button } from "../../../components/ui/Button";
import { Skeleton } from "../../../components/ui/Skeleton";

function getPageNumbers(currentPage, totalPages) {
	const startPage = Math.max(1, currentPage - 2);
	const endPage = Math.min(totalPages, currentPage + 2);

	return Array.from({ length: Math.max(0, endPage - startPage + 1) }, (_, index) => startPage + index);
}

const ReviewSection = ({ className, productId, orderId, onReviewSubmitted }) => {
	const reviewState = useProductReview(productId, onReviewSubmitted);

	const {
		reviews,
		loadReviews,
		currentPage,
		totalPages,
		isReviewsLoading,
	} = reviewState;

	useEffect(() => {
		loadReviews(1);
	}, [productId, loadReviews]);

	const pageNumbers = getPageNumbers(currentPage, totalPages);

	return (
		<div className={cn(className)}>
			<ReviewForm
				reviewState={reviewState}
				orderId={orderId}
			></ReviewForm>

			<ReviewCommentSection className="mt-5">
				<div className="space-y-3">
					{isReviewsLoading ? (
						Array.from({ length: 3 }).map((_, idx) => (
							<div key={idx} className="p-4 border border-gray-200 rounded-xl bg-white space-y-3">
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
								<ReviewCommentCard key={r.id} review={r}></ReviewCommentCard>
							))}

							{reviews.length === 0 && <h2>Chưa có đánh giá nào</h2>}
						</>
					)}
				</div>

				{totalPages > 1 ? (
					<div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 mt-6 pt-4">
						<div className="text-sm flex-1 text-green-800 font-medium">
							Trang {currentPage} / {totalPages}
						</div>
						<div className="flex flex-nowrap flex-1 items-center justify-center gap-2">
							<Button
								className="px-3 py-1 text-xs"
								disabled={currentPage === 1}
								onClick={() => loadReviews(currentPage - 1)}
							>
								Trước
							</Button>
							{pageNumbers.map((pageNumber) => (
								<Button
									key={pageNumber}
									variant={pageNumber === currentPage ? 'primary' : 'secondary'}
									className="px-3 py-1 text-xs"
									onClick={() => loadReviews(pageNumber)}
								>
									{pageNumber}
								</Button>
							))}
							<Button
								className="px-3 py-1 text-xs"
								disabled={currentPage === totalPages}
								onClick={() => loadReviews(currentPage + 1)}
							>
								Sau
							</Button>
						</div>
						<div className="flex-1"></div>
					</div>
				) : null}
			</ReviewCommentSection>
		</div>
	);
};

export default ReviewSection;
