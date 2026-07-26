import { useContext, useEffect, useState } from "react";
import { Container } from "../../../components/global/Container";
import { Button } from "../../../components/ui/Button";
import { AuthContext } from "../../../context/AuthContext";

import {
    getMyReturnRequests,
    markReturning,
    cancelRequest
} from "../api/returnRequestApi";

import CreateReturnRequestModal from "../components/CreateReturnRequestModal";
import PaymentModal from "../components/PaymentModal";
import RefundInfoModal from "../components/RefundInfoModal";

export default function CustomerReturnRequestPage() {

    const { user, isLoading: authLoading } = useContext(AuthContext);

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [showPayment, setShowPayment] = useState(null);
    const [showRefund, setShowRefund] = useState(null);
    const [cancelingId, setCancelingId] = useState(null);

    async function loadRequests() {

        if (!user?.id) return;

        try {

            setLoading(true);

            const data = await getMyReturnRequests(user.id);

            setRequests(Array.isArray(data) ? data : []);

        } catch (error) {

            console.error("LOAD RETURN ERROR:", error);
            setRequests([]);

        } finally {

            setLoading(false);

        }
    }

    useEffect(() => {

        if (user?.id) {
            loadRequests();
        }

    }, [user?.id]);

    async function handleReturnItem(id) {

        try {

            await markReturning(id);

            alert("Đã xác nhận gửi hàng hoàn trả");

            await loadRequests();

        } catch (error) {

            console.error("RETURN ITEM ERROR:", error);

            alert("Không thể xác nhận trả hàng");

        }

    }

    async function handleCancelRequest(id) {

        if (!window.confirm("Bạn có chắc muốn hủy yêu cầu này?")) {
            return;
        }

        try {

            setCancelingId(id);

            await cancelRequest(id);

            alert("Đã hủy yêu cầu");

            await loadRequests();

        } catch (error) {

            console.error("CANCEL REQUEST ERROR:", error);

            alert("Không thể hủy yêu cầu");

        } finally {

            setCancelingId(null);

        }

    }

    function getStatusLabel(status) {

        const map = {
            PENDING: "Chờ duyệt",
            APPROVED: "Đã duyệt",
            REJECTED: "Từ chối",
            RETURNING: "Đang hoàn trả",
            RECEIVED: "Đã nhận hàng",
            PROCESSING: "Đang xử lý",
            COMPLETED: "Hoàn thành"
        };

        return map[status] ?? status;
    }

    return (

        <main className="bg-gradient-to-br from-green-50 to-white min-h-screen">

            {/* HEADER */}
            <section className="bg-gradient-to-r from-green-700 to-green-500 text-white py-12">
                <Container className="space-y-3">

                    <p className="text-green-200 text-sm uppercase tracking-widest">
                        Dịch vụ khách hàng
                    </p>

                    <h1 className="text-4xl font-bold">
                        Yêu cầu đổi trả
                    </h1>

                    <p className="text-green-100">
                        Theo dõi các yêu cầu hoàn trả hoặc đổi sản phẩm của bạn.
                    </p>

                </Container>
            </section>

            {/* BODY */}
            <Container className="py-10 space-y-6">

                <div className="flex justify-between items-center">

                    <h2 className="text-2xl font-semibold text-green-800">
                        Yêu cầu của tôi
                    </h2>

                    <Button
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => setShowCreate(true)}
                    >
                        + Tạo yêu cầu
                    </Button>

                </div>

                {(authLoading || loading) && (
                    <div className="text-center py-10 text-stone-500">
                        Đang tải...
                    </div>
                )}

                {!authLoading && !loading && requests.length === 0 && (
                    <div className="text-center py-16 border-2 border-dashed border-stone-200 rounded-2xl text-stone-400">
                        Bạn chưa có yêu cầu đổi trả nào.
                    </div>
                )}

                {!authLoading && !loading && requests.length > 0 && (

                    <div className="grid gap-5">

                        {requests.map(request => (

                            <div
                                key={request.id}
                                className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm flex justify-between items-center"
                            >

                                {/* INFO */}
                                <div className="space-y-2">

                                    <h3 className="font-semibold text-green-800">
                                        Yêu cầu #{request.id}
                                    </h3>

                                    <p className="text-sm text-stone-600">
                                        Đơn hàng: #{request.order?.id}
                                    </p>

                                    <p className="text-sm text-stone-600">
                                        Loại: {request.returnType === "RETURN"
                                        ? "Hoàn trả"
                                        : "Đổi sản phẩm"}
                                    </p>

                                    <p className="text-sm text-stone-600">
                                        Lý do: {request.reason}
                                    </p>

                                </div>

                                {/* ACTION */}
                                <div className="flex flex-col items-end gap-3">

                                    <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                                        {getStatusLabel(request.status)}
                                    </span>

                                    {/* Hủy yêu cầu */}
                                    {request.status === "PENDING" && (
                                        <Button
                                            className="bg-gray-500 hover:bg-gray-600 text-white"
                                            disabled={cancelingId === request.id}
                                            onClick={() => handleCancelRequest(request.id)}
                                        >
                                            {cancelingId === request.id ? "Đang hủy..." : "Hủy yêu cầu"}
                                        </Button>
                                    )}

                                    {/* Trả hàng */}
                                    {request.status === "APPROVED" && (
                                        <Button
                                            className="bg-blue-500 hover:bg-blue-600 text-white"
                                            onClick={() => handleReturnItem(request.id)}
                                        >
                                            Trả hàng
                                        </Button>
                                    )}

                                    {/* Thanh toán thêm */}
                                    {request.status === "PROCESSING"
                                        && request.additionalPayment
                                        && request.additionalPayment > 0 && (
                                            <Button
                                                className="bg-red-500 hover:bg-red-600 text-white"
                                                onClick={() => setShowPayment(request)}
                                            >
                                                Thanh toán thêm
                                            </Button>
                                        )}

                                    {/* Nhập thông tin nhận tiền */}
                                    {request.status === "PROCESSING"
                                        && request.refundAmount
                                        && request.refundAmount > 0
                                        && !request.accountNumber && (
                                            <Button
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                                                onClick={() => setShowRefund(request)}
                                            >
                                                Nhập thông tin nhận tiền
                                            </Button>
                                        )}

                                </div>

                            </div>

                        ))}

                    </div>
                )}

            </Container>

            {/* CREATE MODAL */}
            {showCreate && (
                <CreateReturnRequestModal
                    customerId={user.id}
                    onClose={() => setShowCreate(false)}
                    onSubmitted={() => {
                        setShowCreate(false);
                        loadRequests();
                    }}
                />
            )}

            {/* PAYMENT MODAL */}
            {showPayment && (
                <PaymentModal
                    request={showPayment}
                    onClose={() => setShowPayment(null)}
                    onSuccess={() => {
                        setShowPayment(null);
                        loadRequests();
                    }}
                />
            )}

            {/* REFUND MODAL */}
            {showRefund && (
                <RefundInfoModal
                    request={showRefund}
                    onClose={() => setShowRefund(null)}
                    onSuccess={() => {
                        setShowRefund(null);
                        loadRequests();
                    }}
                />
            )}

        </main>
    );
}