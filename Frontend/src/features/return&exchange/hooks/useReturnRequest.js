import { useState } from "react";
import {
    createReturnRequest,
    getAvailableOrders,
    getOrderItems,
    getAvailableProducts,
    getPendingRequests,
    getRequestDetail,
    requestMoreInfo as requestMoreInfoApi,
    updateRequestInfo,
    decideRequest,
    markReturning,
    confirmReturn,
    completePayment,
    confirmAdditionalPayment as confirmAdditionalPaymentApi,
    getApprovedReturnRequests,
    getMyReturnRequests,
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
                err?.message ||
                "Có lỗi xảy ra"
            );

            throw err;

        } finally {
            setLoading(false);
        }
    };

    return {loading, error,

        // ================= CUSTOMER CREATE REQUEST =================

        fetchAvailableOrders: (customerId) =>
            execute(() =>
                getAvailableOrders(customerId)
            ),


        fetchOrderItems: (orderId) =>
            execute(() =>
                getOrderItems(orderId)
            ),

        fetchExchangeProducts: () =>
            execute(() =>
                getAvailableProducts()
            ),

        createRequest: (customerId, data) =>
            execute(() =>
                createReturnRequest(
                    customerId,
                    data
                )
            ),

        // ================= REQUEST DETAIL =================

        fetchRequestDetail: (id) =>
            execute(() =>
                getRequestDetail(id)
            ),


        // ================= CUSTOMER UPDATE =================
        updateInfo: (id, data) =>
            execute(() =>
                updateRequestInfo(
                    id,
                    data
                )
            ),

        cancelPendingRequest: (id) =>
            execute(() =>
                cancelRequest(id)
            ),

        // ================= CUSTOMER HISTORY =================

        fetchMyRequests: (customerId) =>
            execute(() =>
                getMyReturnRequests(customerId)
            ),

        fetchApprovedRequests: (customerId) =>
            execute(() =>
                getApprovedReturnRequests(customerId)
            ),

        // ================= MANAGER REVIEW =================
        fetchPendingRequests: () =>
            execute(() =>
                getPendingRequests()
            ),

        fetchManagerRequests: () =>
            execute(() =>
                getManagerRequests()
            ),

        approveRequest: (id) =>
            execute(() =>
                decideRequest(
                    id,
                    "APPROVE"
                )
            ),

        rejectRequest: (id, reason) =>
            execute(() =>
                decideRequest(
                    id,
                    "DECLINE",
                    reason
                )
            ),

        requestMoreInfo: (id) =>
            execute(() =>
                requestMoreInfoApi(id)
            ),

        // ================= RETURN SHIPPING =================

        markItemReturning: (id) =>
            execute(() =>
                markReturning(id)
            ),

        confirmReceivedReturn: (id) =>
            execute(() =>
                confirmReturn(id)
            ),

        // ================= FINANCIAL FLOW =================
        // RECEIVED -> xử lý tài chính
        processPayment: (id) =>
            execute(() =>
                completePayment(id)
            ),

        // WAITING_PAYMENT -> customer xác nhận thanh toán thêm

        confirmAdditionalPayment: (id) =>
            execute(() =>
                confirmAdditionalPaymentApi(id)
            ),
        // WAITING_BANK_INFO -> customer gửi thông tin ngân hàng
        submitRefundInformation: (id, data) =>
            execute(() =>
                submitRefundInfo(
                    id,
                    data
                )
            ),

        // PROCESSING -> COMPLETED

        completeRequestByManager: (id) =>
            execute(() =>
                completeByManager(id)
            ),

        // ================= EXCHANGE =================
        fetchPriceDifference: (id) =>
            execute(() =>
                getPriceDifference(id)
            ),

        // ================= REPORT =================

        fetchReturnReport: () =>
            execute(() =>
                getReturnReport()
            ),

        fetchAllReturnRequests: () =>
            execute(() =>
                getAllReturnRequests()
            ),

        // ================= IMAGE =================
        uploadEvidence: (file) =>
            execute(() =>
                uploadEvidenceImage(file)
            )
    };
}