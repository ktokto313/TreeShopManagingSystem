import { useState } from "react";

export const useReviewForm = () => {
	const [starValue, setStarValue] = useState(null);
	const [reviewValidationError, setReviewValidationError] = useState("");
	const [isReviewSubmitLoading, setIsReviewSubmitLoading] = useState(false);
	const [isReviewsLoading, setIsReviewsLoading] = useState(false);

	return {
		starValue,
		reviewValidationError,
		isReviewSubmitLoading,
		isReviewsLoading,
		setStarValue,
		setReviewValidationError,
		setIsReviewSubmitLoading,
		setIsReviewsLoading,
	};
};
