/*
 * Created By: MinhLTHE200133
 * Created At: 2026-06-25
 * Last Modified: 2026-07-15
 */
import { useCallback, useContext, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { createProductReview, getProductReviews } from "../reviewApi";
import { useReviewForm } from "./useReviewForm";
import { REVIEWS_PER_PAGE } from "../data/reviewsData";

export const useProductReview = (productId, onSuccess) => {
	const {
		isReviewsLoading,
		setIsReviewsLoading,
		starValue,
		setStarValue,
		reviewValidationError,
		setReviewValidationError,
		isReviewSubmitLoading,
		setIsReviewSubmitLoading,
	} = useReviewForm();

	const [reviews, setReviews] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalElements, setTotalElements] = useState(0);
	const [ratingFilter, setRatingFilter] = useState(null);

	const { user } = useContext(AuthContext);

	const loadReviews = useCallback(
		async (page = 1) => {
			try {
				setIsReviewsLoading(true);
				const backendPage = Math.max(0, page - 1);

				let cleanRating = null;
				if (ratingFilter !== undefined && ratingFilter !== null && ratingFilter !== "" && ratingFilter !== "null") {
					cleanRating = Number(ratingFilter);
				}

				const result = await getProductReviews(productId, backendPage, REVIEWS_PER_PAGE, cleanRating);

				setReviews(result.content || []);
				setTotalPages(result.totalPages || 1);
				setTotalElements(result.totalElements || 0);
				setCurrentPage((result.number ?? 0) + 1);
			} catch (error) {
				console.error("Lỗi tải đánh giá:", error);
			} finally {
				setIsReviewsLoading(false);
			}
		},
		[productId, setIsReviewsLoading, ratingFilter],
	);

	const handleStarOnClick = (selectedStar) => {
		setStarValue(selectedStar);
	};

	const handleReviewForm = async (e, orderId) => {
		e.preventDefault();

		setReviewValidationError("");
		const formData = new FormData(e.currentTarget);

		const rating = formData.get("rating");
		const comment = formData.get("comment");

		const isValid = handleReviewValidation({ rating, comment, user });
		if (!isValid) return;

		try {
			setIsReviewSubmitLoading(true);

			const payload = {
				rating: parseInt(rating, 10),
				comment,
			};

			await createProductReview(orderId, productId, payload);
			await loadReviews(1);

			e.target.reset();
			setStarValue(null);
			if (onSuccess) onSuccess();
		} catch (error) {
			setReviewValidationError(error.message || "Có lỗi xảy ra khi gửi đánh giá.");
		} finally {
			setIsReviewSubmitLoading(false);
		}
	};

	const handleReviewValidation = ({ rating, comment, user }) => {
		if (!user) {
			setReviewValidationError("Bạn cần đăng nhập để được đánh giá sản phẩm.");
			return false;
		}

		if (!rating || !comment) {
			setReviewValidationError("Vui lòng chọn số sao và nhập bình luận để gửi đánh giá.");
			return false;
		}

		return true;
	};

	return {
		handleReviewForm,
		handleReviewValidation,
		handleStarOnClick,
		setIsReviewSubmitLoading,
		loadReviews,
		setRatingFilter,
		ratingFilter,
		reviews,
		currentPage,
		totalPages,
		totalElements,
		REVIEWS_PER_PAGE,
		isReviewsLoading,
		starValue,
		reviewValidationError,
		isReviewSubmitLoading,
		pageSize: REVIEWS_PER_PAGE,
	};
};
