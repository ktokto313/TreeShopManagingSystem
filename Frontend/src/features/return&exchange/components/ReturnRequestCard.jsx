export default function ReturnRequestCard({
                                              request,
                                              onView,
                                              onEdit,
                                              onCancel,
                                              onReturn,
                                              onConfirmReceived,
                                              onProcessPayment,
                                              onPay,
                                              onRefundInfo,
                                              onComplete
                                          }) {

    const isExchange = request.returnType === "EXCHANGE";
    const isReturn = request.returnType === "RETURN";

    return (
        <div className="bg-white rounded-xl border p-5 shadow-sm">

            <h3 className="font-semibold text-green-800">
                Request #{request.id}
            </h3>

            <p>
                Customer: {request.customer?.fullName}
            </p>

            <p>
                Loại: {request.returnType}
            </p>

            <p>
                Lý do: {request.reason}
            </p>

            <p>
                Trạng thái: {request.status}
            </p>

            <div className="flex gap-3 mt-3 flex-wrap">

                {/* VIEW */}
                <button
                    onClick={() => onView(request)}
                    className="px-4 py-2 rounded-lg bg-green-500 text-white"
                >
                    Xem chi tiết
                </button>

                {/* ================= CUSTOMER ================= */}

                {/* Edit request*/}
                {request.status === "PENDING" && onEdit && (
                    <button
                        onClick={() => onEdit(request)}
                        className="px-4 py-2 rounded-lg bg-teal-500 text-white"
                    >
                        Chỉnh sửa
                    </button>
                )}

                {/* PENDING to Cancel request*/}
                {request.status === "PENDING" && onCancel && (
                    <button
                        onClick={() => onCancel(request)}
                        className="px-4 py-2 rounded-lg bg-gray-500 text-white"
                    >
                        Hủy yêu cầu
                    </button>
                )}

                {/* APPROVED → Trả hàng */}
                {request.status === "APPROVED" && onReturn && (
                    <button
                        onClick={() => onReturn(request)}
                        className="px-4 py-2 rounded-lg bg-blue-500 text-white"
                    >
                        Trả hàng
                    </button>
                )}

                {/* RECEIVED + EXCHANGE → Thanh toán thêm */}
                {request.status === "PROCESSING" &&
                    isExchange &&
                    request.additionalPayment > 0 &&
                    onPay && (
                        <button
                            onClick={() => onPay(request)}
                            className="px-4 py-2 rounded-lg bg-yellow-500 text-white"
                        >
                            Thanh toán thêm
                        </button>
                    )}

                {/* RECEIVED + RETURN → Nhập thông tin ngân hàng */}
                {request.status === "PROCESSING" &&
                    isReturn &&
                    !request.bankName &&
                    onRefundInfo && (
                        <button
                            onClick={() => onRefundInfo(request)}
                            className="px-4 py-2 rounded-lg bg-orange-500 text-white"
                        >
                            Nhập thông tin nhận tiền
                        </button>
                    )}

                {/* ================= MANAGER ================= */}

                {/* RETURNING → Đã nhận hàng */}
                {request.status === "RETURNING" && onConfirmReceived && (
                    <button
                        onClick={() => onConfirmReceived(request)}
                        className="px-4 py-2 rounded-lg bg-purple-500 text-white"
                    >
                        Đã nhận hàng
                    </button>
                )}

                {/* RECEIVED → Xử lý thanh toán (tính additionalPayment/refundAmount, chuyển sang PROCESSING) */}
                {request.status === "RECEIVED" && onProcessPayment && (
                    <button
                        onClick={() => onProcessPayment(request)}
                        className="px-4 py-2 rounded-lg bg-indigo-500 text-white"
                    >
                        Xử lý thanh toán
                    </button>
                )}

                {/* PROCESSING → Hoàn tất */}
                {request.status === "PROCESSING" && onComplete && (
                    <button
                        onClick={() => onComplete(request)}
                        className="px-4 py-2 rounded-lg bg-red-500 text-white"
                    >
                        Hoàn tất
                    </button>
                )}

            </div>
        </div>
    );
}