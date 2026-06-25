import { requestJson } from "../../utils/api";

export const getProductReviews = (productId) => {
	return requestJson(`/api/orders/products/${productId}/reviews`, {
		method: "GET",
	});
};

export const createProductReview = (orderId, productId, payload) => {
	return requestJson(`/api/orders/${orderId}/details/${productId}/review`, {
		method: "POST",
		body: payload,
	});
};
