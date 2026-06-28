import { useCallback, useContext, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { createProductReview, getProductReviews } from "../reviewApi";

export const useProductReview = (productId, onSuccess) => {
	const {
		isReviewsLoading,
		setIsReviewsLoading,
		starValue,
		setStarValue,
		reviewValidationError,
		setReviewValidationError,
		isReviewSubmitLoading,
		setIsReviewSubmitLoading
	} = useReviewForm();

	const [reviews, setReviews] = useState([]);
	const [reviewValidationError, setReviewValidationError] = useState("");
	const [isReviewSubmitLoading, setIsReviewSubmitLoading] = useState(false);
	const [isReviewsLoading, setIsReviewsLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalElements, setTotalElements] = useState(0);

	const pageSize = 5;
	const { user } = useContext(AuthContext);

	const loadReviews = useCallback(async (page = 1) => {
		try {
			setIsReviewsLoading(true);
			const backendPage = Math.max(0, page - 1);
			const result = await getProductReviews(productId, backendPage, pageSize);

			setReviews(result.content || []);
			setTotalPages(result.totalPages || 1);
			setTotalElements(result.totalElements || 0);
			setCurrentPage((result.number ?? 0) + 1);
		} catch (error) {
			console.error("Lỗi tải đánh giá:", error);
		} finally {
			setIsReviewsLoading(false);
		}
	}, [productId]);

	const handleStarOnClick = (starValue) => {
		setStarValue(starValue);
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
				comment: comment,
			};

			await createProductReview(orderId, productId, payload);
			await loadReviews(1);

			e.target.reset();
			setStarValue(null);
			if (onSuccess) onSuccess();
		} catch (error) {
			setReviewValidationError(
				error.message || "Có lỗi xảy ra khi gửi đánh giá.",
			);
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
			setReviewValidationError(
				"Vui lòng chọn số sao và nhập bình luận để gửi đánh giá.",
			);
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
		reviews,
		isReviewSubmitLoading,
		starValue,
		reviewValidationError,
		currentPage,
		totalPages,
		totalElements,
		isReviewsLoading,
		pageSize,
	};
};
