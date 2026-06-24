import { requestJson } from "../../utils/api";
import { PRODUCT_API_BASE } from "./productApi";

export const getProductReviews = (productId) => {
	return requestJson(PRODUCT_API_BASE + `/${productId}/review`, {
		method: "GET",
	});
};

export const createProductReview = (productId, payload) => {
	return requestJson(PRODUCT_API_BASE + `/${productId}/review`, {
		method: "POST",
		body: payload,
	});
};
