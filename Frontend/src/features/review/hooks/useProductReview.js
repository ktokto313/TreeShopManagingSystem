/*
 * Created By: AnhLV
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
	
	const { canManage } = useContext(AuthContext);

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

				if (result && Array.isArray(result.content)) {
					const pages = result.totalPages ?? result.page?.totalPages ?? 1;
					const elements = result.totalElements ?? result.page?.totalElements ?? 0;
					const pageNum = result.number ?? result.page?.number ?? backendPage;

					setReviews(result.content);
					setTotalPages(Math.max(1, pages));
					setTotalElements(elements);
					setCurrentPage(pageNum + 1);
				} else if (Array.isArray(result)) {
					setReviews(result);
					setTotalPages(1);
					setTotalElements(result.length);
					setCurrentPage(1);
				} else {
					setReviews([]);
					setTotalPages(1);
					setTotalElements(0);
					setCurrentPage(1);
				}
			} catch {
				setReviews([]);
				setTotalPages(1);
				setTotalElements(0);
				setCurrentPage(1);
			} finally {
				setIsReviewsLoading(false);
			}
		},
		[productId, setIsReviewsLoading, ratingFilter, canManage],
	);

	const handleStarOnClick = (starValue) => {
		setStarValue(starValue);
	};

	const handleReviewForm = async (e, orderId) => {
		e.preventDefault();

		setReviewValidationError("");
		const formData = new FormData(e.currentTarget);

		const rating = formData.get("rating");
		const comment = formData.get("comment");

		try {
			setIsReviewSubmitLoading(true);

			const payload = {
				rating: parseInt(rating, 10) || 0,
				comment,
			};

			await createProductReview(orderId, productId, payload);
			await loadReviews(1);

			e.target.reset();
			setStarValue(null);
			if (onSuccess) onSuccess();
		} catch (error) {
			setReviewValidationError(error.message);
		} finally {
			setIsReviewSubmitLoading(false);
		}
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
			alert(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi ẩn đánh giá.');
		}
	};

	const toggleReviewCurate = async (reviewId) => {
		try {
			await toggleReviewCurateApi(reviewId);
			setReviews(reviews.map(r => r.id === reviewId ? { ...r, curated: !r.curated } : r));
		} catch (err) {
			alert(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi chọn tiêu biểu đánh giá.');
		}
	};

	return {
		handleReviewForm,
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
