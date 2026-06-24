import { useCallback, useContext, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { createProductReview, getProductReviews } from "../reviewApi";

export const useProductReview = (productId) => {
	const [starValue, setStarValue] = useState(null);
	const [reviews, setReviews] = useState([]);
	const [reviewValidationError, setReviewValidationError] = useState("");
	const [isReviewSubmitLoading, setIsReviewSubmitLoading] = useState(false);

	const { user } = useContext(AuthContext);

	const loadReviews = useCallback(async () => {
		const loadedReviews = await getProductReviews(productId);

		setReviews(loadedReviews);
	}, [productId]);

	const handleStarOnClick = (starValue) => {
		setStarValue(starValue);
	};

	const handleReviewForm = async (e) => {
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
				user: {id: user.id, fullName: user.fullName},
				rating: parseInt(rating, 10),
				comment: comment,
			};

			await createProductReview(productId, payload);
			await loadReviews();

			e.target.reset();
			setStarValue(null);
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
	};
};
