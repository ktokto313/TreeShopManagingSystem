import { requestJson } from "../../utils/api";

export const getProductReviews = (productId, page, size, rating, canManage) => {
	const params = new URLSearchParams();
	if (page !== undefined && page !== null) params.append("page", page);
	if (size !== undefined && size !== null) params.append("size", size);
	if(rating !== undefined && rating !== null) params.append("rating", rating);

	const queryString = params.toString();
	const basePath = canManage ? `/api/orders/products/${productId}/reviews/all` : `/api/orders/products/${productId}/reviews`;
	const url = `${basePath}${queryString ? `?${queryString}` : ""}`;

	return requestJson(url, {
		method: "GET",
	});
};

export const toggleReviewHideApi = (reviewId) => {
	return requestJson(`/api/orders/reviews/${reviewId}/hide`, { method: "PUT" });
};

export const toggleReviewCurateApi = (reviewId) => {
	return requestJson(`/api/orders/reviews/${reviewId}/curate`, { method: "PUT" });
};

export const createProductReview = (orderId, productId, payload) => {
	return requestJson(`/api/orders/${orderId}/details/${productId}/review`, {
		method: "POST",
		body: payload,
	});
};
