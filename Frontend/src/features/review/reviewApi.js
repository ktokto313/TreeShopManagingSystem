import { requestJson } from "../../utils/api";

export const getProductReviews = (productId, page, size) => {
	const params = new URLSearchParams();
	if (page !== undefined && page !== null) params.append("page", page);
	if (size !== undefined && size !== null) params.append("size", size);

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
