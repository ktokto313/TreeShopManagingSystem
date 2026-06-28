import { requestJson } from "../../utils/api";

export const getProductReviews = (productId, page, size, rating) => {
	const params = new URLSearchParams();
	if (page !== undefined && page !== null) params.append("page", page);
	if (size !== undefined && size !== null) params.append("size", size);
	if(rating !== undefined && rating !== null) params.append("rating", rating);

	const queryString = params.toString();
	const url = `/api/orders/products/${productId}/reviews${queryString ? `?${queryString}` : ""}`;

	return requestJson(url, {
		method: "GET",
	});
};

export const createProductReview = (orderId, productId, payload) => {
	return requestJson(`/api/orders/${orderId}/details/${productId}/review`, {
		method: "POST",
		body: payload,
	});
};
