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
        <div className="bg-white rounded-xl border p-5 shadow-sm space-y-2">

            <h3 className="font-semibold text-green-800">
                Request #{request.id}
            </h3>

            <p>Customer: {request.customer?.fullName}</p>
            <p>Loại: {request.returnType}</p>
            <p>Lý do: {request.reason}</p>

            <p>
                Trạng thái:{" "}
                <span className="font-medium">
                    {request.status}
                </span>
            </p>

            {/* ACTIONS */}
            <div className="flex gap-3 mt-3 flex-wrap">

                {/* VIEW */}
                <button
                    onClick={() => onView(request)}
                    className="px-4 py-2 rounded-lg bg-green-500 text-white"
                >
                    Xem chi tiết
                </button>

                {/* ================= CUSTOMER ================= */}

                {/* PENDING → edit / cancel */}
                {request.status === "PENDING" && onEdit && (
                    <button
                        onClick={() => onEdit(request)}
                        className="px-4 py-2 rounded-lg bg-teal-500 text-white"
                    >
                        Chỉnh sửa
                    </button>
                )}

                {request.status === "PENDING" && onCancel && (
                    <button
                        onClick={() => onCancel(request)}
                        className="px-4 py-2 rounded-lg bg-gray-500 text-white"
                    >
                        Hủy yêu cầu
                    </button>
                )}

                {/* APPROVED → gửi hàng */}
                {request.status === "APPROVED" && onReturn && (
                    <button
                        onClick={() => onReturn(request)}
                        className="px-4 py-2 rounded-lg bg-blue-500 text-white"
                    >
                        Trả hàng
                    </button>
                )}

                {/* WAITING_PAYMENT → thanh toán thêm */}
                {request.status === "WAITING_PAYMENT" &&
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

                {/* WAITING_BANK_INFO → nhập bank */}
                {request.status === "WAITING_BANK_INFO" &&
                    isReturn &&
                    onRefundInfo && (
                        <button
                            onClick={() => onRefundInfo(request)}
                            className="px-4 py-2 rounded-lg bg-orange-500 text-white"
                        >
                            Nhập thông tin nhận tiền
                        </button>
                    )}

                {/* ================= MANAGER ================= */}

                {/* RETURNING → đã nhận hàng */}
                {request.status === "RETURNING" && onConfirmReceived && (
                    <button
                        onClick={() => onConfirmReceived(request)}
                        className="px-4 py-2 rounded-lg bg-purple-500 text-white"
                    >
                        Đã nhận hàng
                    </button>
                )}

                {/* RECEIVED → xử lý tài chính */}
                {request.status === "RECEIVED" && onProcessPayment && (
                    <button
                        onClick={() => onProcessPayment(request)}
                        className="px-4 py-2 rounded-lg bg-indigo-500 text-white"
                    >
                        Xử lý thanh toán
                    </button>
                )}

                {/* PROCESSING → đang xử lý */}
                {request.status === "PROCESSING" && (
                    <span className="px-4 py-2 rounded-lg bg-blue-100 text-blue-600">
                        Đang xử lý
                    </span>
                )}

                {/* PROCESSING → manager hoàn tất */}
                {request.status === "PROCESSING" && onComplete && (
                    <button
                        onClick={() => onComplete(request)}
                        className="px-4 py-2 rounded-lg bg-red-500 text-white"
                    >
                        Hoàn tất
                    </button>
                )}

                {/* COMPLETED */}
                {request.status === "COMPLETED" && (
                    <span className="px-4 py-2 rounded-lg bg-green-100 text-green-700">
                        Đã hoàn tất
                    </span>
                )}

            </div>
        </div>
    );
}