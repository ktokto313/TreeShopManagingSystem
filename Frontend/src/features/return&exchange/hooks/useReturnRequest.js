import { useState } from "react";
import {
    createReturnRequest,
    getAvailableOrders,
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
    confirmAdditionalPayment,
    getApprovedReturnRequests,
    cancelRequest,
    submitRefundInfo,
    completeByManager,
    getReturnReport,
    getManagerRequests,
    uploadEvidenceImage,
    getAllReturnRequests,
    getPriceDifference
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

            setError(
                err.message || "Có lỗi xảy ra"
            );

            throw err;

        } finally {
            setLoading(false);
        }
    };

    return {

        loading,
        error,

        // Customer gets orders available for return/exchange
        fetchAvailableOrders: (customerId) =>
            execute(() =>
                getAvailableOrders(customerId)
            ),

        // Customer creates return/exchange request
        createRequest: (customerId, data) =>
            execute(() =>
                createReturnRequest(customerId, data)
            ),

        // Customer gets order items
        fetchOrderItems: (orderId) =>
            execute(() =>
                getOrderItems(orderId)
            ),

        // Customer selects exchange product
        fetchExchangeProducts: () =>
            execute(() =>
                getAvailableProducts()
            ),

        // Manager gets pending requests
        fetchPendingRequests: () =>
            execute(() =>
                getPendingRequests()
            ),

        // Get request detail
        fetchRequestDetail: (id) =>
            execute(() =>
                getRequestDetail(id)
            ),

        // Manager requests more information
        sendMoreInfoRequest: (id) =>
            execute(() =>
                requestMoreInfo(id)
            ),

        // Customer updates additional information
        updateInfo: (id, data) =>
            execute(() =>
                updateRequestInfo(id, data)
            ),

        // Manager approves request
        approveRequest: (id) =>
            execute(() =>
                decideRequest(id, "APPROVE")
            ),

        // Manager rejects request
        rejectRequest: (id, reason) =>
            execute(() =>
                decideRequest(id, "DECLINE", reason)
            ),

        // Customer confirms shipping return item
        markItemReturning: (id) =>
            execute(() =>
                markReturning(id)
            ),

        // Manager confirms received return item
        confirmReceivedReturn: (id) =>
            execute(() =>
                confirmReturn(id)
            ),

        // Manager processes refund/payment
        finishPayment: (id) =>
            execute(() =>
                completePayment(id)
            ),

        // Customer confirms additional payment
        confirmPayment: (id) =>
            execute(() =>
                confirmAdditionalPayment(id)
            ),

        // Customer gets approved requests
        fetchApprovedRequests: (customerId) =>
            execute(() =>
                getApprovedReturnRequests(customerId)
            ),

        // Customer cancels pending request
        cancelPendingRequest: (id) =>
            execute(() =>
                cancelRequest(id)
            ),

        // Customer submits refund bank information
        submitRefundInformation: (id, data) =>
            execute(() =>
                submitRefundInfo(id, data)
            ),

        // Manager completes request
        completeRequestByManager: (id) =>
            execute(() =>
                completeByManager(id)
            ),

        // Manager report
        fetchReturnReport: () =>
            execute(() =>
                getReturnReport()
            ),

        // Manager active requests
        fetchManagerRequests: () =>
            execute(() =>
                getManagerRequests()
            ),

        // Get all requests
        fetchAllReturnRequests: () =>
            execute(() =>
                getAllReturnRequests()
            ),

        // Calculate exchange price difference
        fetchPriceDifference: (id) =>
            execute(() =>
                getPriceDifference(id)
            ),

        // Upload evidence image
        uploadEvidence: (file) =>
            execute(() =>
                uploadEvidenceImage(file)
            )
    };
}