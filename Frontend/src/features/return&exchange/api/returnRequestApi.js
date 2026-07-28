import { requestJson } from "../../../utils/api";

const BASE_URL = "/api/return-requests";


export function getAvailableOrders(customerId) {
    return requestJson(
        `${BASE_URL}/orders?customerId=${customerId}`
    );
}


export function getOrderItems(orderId) {
    return requestJson(
        `${BASE_URL}/orders/${orderId}/items`
    );
}


export function getAvailableProducts() {
    return requestJson(
        `${BASE_URL}/products`
    );
}


export function createReturnRequest(customerId, data) {
    return requestJson(
        `${BASE_URL}?customerId=${customerId}`,
        {
            method: "POST",
            body: data
        }
    );
}


export function getPendingRequests() {
    return requestJson(
        `${BASE_URL}/pending`
    );
}


export function getRequestDetail(id) {
    return requestJson(
        `${BASE_URL}/detail/${id}`
    );
}


export function requestMoreInfo(id) {
    return requestJson(
        `${BASE_URL}/${id}/request-more-info`,
        {
            method: "POST"
        }
    );
}


export function updateRequestInfo(id, data) {
    return requestJson(
        `${BASE_URL}/${id}/info`,
        {
            method: "PUT",
            body: data
        }
    );
}


export function decideRequest(id, decision, reason = "") {
    return requestJson(
        `${BASE_URL}/${id}/decision`,
        {
            method: "POST",
            body: {
                decision,
                reason
            }
        }
    );
}


export function markReturning(id) {
    return requestJson(
        `${BASE_URL}/${id}/return`,
        {
            method: "POST"
        }
    );
}


export function confirmReturn(id) {
    return requestJson(
        `${BASE_URL}/${id}/confirm-return`,
        {
            method: "POST"
        }
    );
}


// Manager: RECEIVED -> PROCESSING, computes additionalPayment/refundAmount
export function completePayment(id) {
    return requestJson(
        `${BASE_URL}/${id}/complete-payment`,
        {
            method: "POST"
        }
    );
}

// Customer: confirms they paid the additional amount for an exchange
export function confirmAdditionalPayment(id) {
    return requestJson(
        `${BASE_URL}/${id}/confirm-payment`,
        {
            method: "POST"
        }
    );
}

export function getMyReturnRequests(customerId) {
    return requestJson(
        `/api/return-requests/customer/${customerId}`
    );
}

export function getApprovedReturnRequests(customerId) {
    return requestJson(
        `${BASE_URL}/customer/${customerId}/approved`
    );
}

export function submitRefundInfo(id, data) {
    return requestJson(
        `${BASE_URL}/${id}/refund-info`,
        {
            method: "PUT",
            body: data
        }
    );
}

export function completeByManager(id) {
    return requestJson(
        `${BASE_URL}/${id}/complete-by-manager`,
        {
            method: "POST"
        }
    );
}

export function getPriceDifference(id) {
    return requestJson(
        `${BASE_URL}/${id}/price-difference`
    );
}

export function getReturnReport() {
    return requestJson(
        `${BASE_URL}/manager/report`
    );
}

export function getManagerRequests() {
    return requestJson(
        `${BASE_URL}/manager/active`
    );
}

export function cancelRequest(id) {
    return requestJson(
        `${BASE_URL}/${id}/cancel`,
        {
            method: "POST"
        }
    );
}

export function uploadEvidenceImage(file) {

    const formData = new FormData();

    formData.append(
        "file",
        file
    );

    return requestJson(
        `${BASE_URL}/images/upload`,
        {
            method: "POST",
            body: formData
        }
    );
}

export function getAllReturnRequests() {

    return requestJson(
        `${BASE_URL}`
    );
}