import { useEffect, useState } from "react";
import {
    getManagerRequests,
    getRequestDetail,
    decideRequest,
    confirmReturn,
    completePayment,
    completeByManager,
    requestMoreInfo
} from "../api/returnRequestApi";

import ReturnRequestCard from "../components/ReturnRequestCard";
import ReturnDecisionModal from "../components/ReturnDecisionModal";

export default function ManagerReturnRequestPage() {

    const [requests, setRequests] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => {
        load();

        const interval = setInterval(load, 5000);
        return () => clearInterval(interval);
    }, []);

    async function load() {
        const data = await getManagerRequests();
        setRequests(Array.isArray(data) ? data : []);
    }

    async function openDetail(request) {
        try {
            setLoadingDetail(true);
            const detail = await getRequestDetail(request.id);
            setSelected(detail);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingDetail(false);
        }
    }

    function closeDetail() {
        setSelected(null);
    }

    async function approve() {
        await decideRequest(selected.id, "APPROVE");
        closeDetail();
        load();
    }

    async function reject(reason) {
        await decideRequest(selected.id, "DECLINE", reason);
        closeDetail();
        load();
    }

    async function handleRequestMoreInfo() {
        try {
            await requestMoreInfo(selected.id);
            alert("Đã gửi yêu cầu bổ sung thông tin đến khách hàng");
            closeDetail();
            load();
        } catch (error) {
            console.error(error);
            alert("Không thể gửi yêu cầu bổ sung thông tin");
        }
    }

    async function handleConfirmReceived(request) {
        try {
            await confirmReturn(request.id);

            alert("Đã xác nhận nhận hàng trả");
            load();

        } catch (error) {
            console.error(error);
            alert("Không thể xác nhận");
        }
    }

    async function handleProcessPayment(request) {
        try {
            await completePayment(request.id);
            alert("Đã xử lý thanh toán, chuyển sang xử lý tài chính");
            load();
        } catch (error) {
            console.error(error);
            alert("Không thể xử lý thanh toán");
        }
    }

    async function handleComplete(request) {
        try {
            await completeByManager(request.id);
            alert("Đã hoàn tất yêu cầu");
            load();
        } catch (e) {
            console.error(e);
            alert("Không thể hoàn tất");
        }
    }

    return (
        <main className="bg-gradient-to-br from-green-50 to-white min-h-screen">
            <div className="max-w-5xl mx-auto py-10">

                <h1 className="text-3xl font-bold text-green-800">
                    Quản lý yêu cầu đổi trả
                </h1>

                {loadingDetail && (
                    <p className="text-sm text-stone-500 mt-2">
                        Đang tải chi tiết...
                    </p>
                )}

                <div className="grid gap-5 mt-6">
                    {requests.map(r => (
                        <ReturnRequestCard
                            key={r.id}
                            request={r}
                            onView={openDetail}
                            onConfirmReceived={handleConfirmReceived}
                            onProcessPayment={handleProcessPayment}
                            onComplete={handleComplete}
                        />
                    ))}
                </div>

            </div>

            {selected && (
                <ReturnDecisionModal
                    request={selected}
                    onApprove={approve}
                    onReject={reject}
                    onRequestMoreInfo={handleRequestMoreInfo}
                    onClose={closeDetail}
                />
            )}
        </main>
    );
}