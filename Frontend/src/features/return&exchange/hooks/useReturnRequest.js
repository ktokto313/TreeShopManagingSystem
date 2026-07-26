import { useState } from "react";
import {
    createReturnRequest,
    getOrderItems,
    getAvailableProducts,
    getPendingRequests,
    getRequestDetail,
    requestMoreInfo,
    updateRequestInfo,
    decideRequest,
    markReturning,
    confirmReturn,
    completePayment,
    getApprovedReturnRequests,
    cancelRequest
} from "../api/returnRequestApi";

export function useReturnRequest() {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = async (callback) => {
        try {
            setLoading(true);
            setError(null);

            return await callback();

        } catch (err) {
            setError(err.message || "Có lỗi xảy ra");
            throw err;

        } finally {
            setLoading(false);
        }
    };

    return {

        loading,
        error,

        createRequest: (customerId, data) =>
            execute(() =>
                createReturnRequest(customerId, data)
            ),

        fetchOrderItems: (orderId) =>
            execute(() =>
                getOrderItems(orderId)
            ),

        fetchExchangeProducts: () =>
            execute(() =>
                getAvailableProducts()
            ),

        fetchPendingRequests: () =>
            execute(() =>
                getPendingRequests()
            ),

        fetchRequestDetail: (id) =>
            execute(() =>
                getRequestDetail(id)
            ),

        sendMoreInfoRequest: (id) =>
            execute(() =>
                requestMoreInfo(id)
            ),

        updateInfo: (id, data) =>
            execute(() =>
                updateRequestInfo(id, data)
            ),

        approveRequest: (id) =>
            execute(() =>
                decideRequest(id, "APPROVE")
            ),

        rejectRequest: (id, reason) =>
            execute(() =>
                decideRequest(id, "DECLINE", reason)
            ),

        markItemReturning: (id) =>
            execute(() =>
                markReturning(id)
            ),

        confirmReceivedReturn: (id) =>
            execute(() =>
                confirmReturn(id)
            ),

        finishPayment: (id) =>
            execute(() =>
                completePayment(id)
            ),

        fetchApprovedRequests: (customerId) =>
            execute(() =>
                getApprovedReturnRequests(customerId)
            ),

        cancelPendingRequest: (id) =>
            execute(() =>
                cancelRequest(id)
            ),
    };
}