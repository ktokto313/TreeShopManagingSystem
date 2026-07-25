/*
 * Created By: MinhLTHE200133
 * Created At: 2026-06-25
 * Last Modified: 2026-07-15
 */
import { useCallback, useContext, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { createProductReview, getProductReviews, toggleReviewHideApi, toggleReviewCurateApi } from "../reviewApi";
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
	
	const { user, canManage } = useContext(AuthContext);

	const loadReviews = useCallback(
	async (page = 1) => {
		try {
			setIsReviewsLoading(true);
			const backendPage = Math.max(0, page - 1);

			let cleanRating = null;
			if (ratingFilter !== undefined && ratingFilter !== null && ratingFilter !== "" && ratingFilter !== "null") {
				cleanRating = Number(ratingFilter);
			}

			const result = await getProductReviews(productId, backendPage, REVIEWS_PER_PAGE, cleanRating, canManage);

			setReviews(result.content || []);
			setTotalPages(result.totalPages || 1);
			setTotalElements(result.totalElements || 0);
			setCurrentPage((result.number ?? 0) + 1);
		} catch (error) {
			console.error("Lỗi tải đánh giá:", error);
		} finally {
			setIsReviewsLoading(false);
		}
	}, [productId, setIsReviewsLoading, ratingFilter, canManage]);

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
				comment,
			};

			await createProductReview(orderId, productId, payload);
			await loadReviews(1);

			e.target.reset();
			setStarValue(null);
			if (onSuccess) onSuccess();
		} catch (error) {
			let errorMsg = error.message;
			if (errorMsg && errorMsg.includes("For input string")) {
				errorMsg = "Dữ liệu gửi lên không hợp lệ. Vui lòng tải lại trang và thử lại.";
			}
			setReviewValidationError(
				errorMsg || "Có lỗi xảy ra khi gửi đánh giá.",
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

		if (!rating) {
			setReviewValidationError("Vui lòng chọn số sao để gửi đánh giá.");
			return false;
		}

		return true;
	};

	const toggleReviewHide = async (reviewId) => {
		// Updates optimistically so we dont have to reload everything for this small change
		try {
			await toggleReviewHideApi(reviewId);
			setReviews(reviews.map(r => {
				if (r.id === reviewId) {
					const newHidden = !r.hidden;
					return { ...r, hidden: newHidden, curated: newHidden ? false : r.curated };
				}
				return r;
			}));
		} catch (err) {
			console.error('Lỗi ẩn đánh giá:', err);
			alert(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi ẩn đánh giá.');
		}
	};

	const toggleReviewCurate = async (reviewId) => {
		try {
			await toggleReviewCurateApi(reviewId);
			setReviews(reviews.map(r => r.id === reviewId ? { ...r, curated: !r.curated } : r));
		} catch (err) {
			console.error('Lỗi curate đánh giá:', err);
			alert(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi chọn tiêu biểu đánh giá.');
		}
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
		canManage,
		toggleReviewHide,
		toggleReviewCurate,
	};
};
