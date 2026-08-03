export default function ReturnRequestCard({
                                              request,
                                              onView,
                                              onApprove,
                                              onConfirmReceived,
                                              onProcessPayment,
                                              onComplete
                                          }) {
    const isReturn =
        request.returnType === "RETURN";

    function formatCurrency(amount) {

        return new Intl.NumberFormat("en-US")
            .format(Number(amount || 0));

    }

    function getReasonLabel(reason) {

        const map = {
            DAMAGED: "Sản phẩm bị hỏng",
            WRONG_ITEM: "Giao sai sản phẩm",
            UNHEALTHY: "Sản phẩm không đạt chất lượng",
            OTHER: "Lý do khác"
        };

        return map[reason] ?? reason;
    }

    function getStatusLabel(status){

        const map = {

            PENDING:
                "Chờ duyệt",

            WAITING_CUSTOMER_INFO:
                "Chờ khách hàng bổ sung thông tin",

            APPROVED:
                "Đã duyệt - Chờ khách gửi hàng",

            REJECTED:
                "Từ chối",

            RETURNING:
                "Đang vận chuyển hàng trả",

            RECEIVED:
                "Shop đã nhận hàng",

            PROCESSING:
                "Đang xử lý",

            WAITING_PAYMENT:
                "Chờ khách thanh toán thêm",

            WAITING_BANK_INFO:
                "Chờ khách cung cấp thông tin ngân hàng",

            COMPLETED:
                "Hoàn thành",

            FAILED:
                "Thất bại"
        };

        return map[status] ?? status;
    }

    return (

        <div className="
            bg-white
            rounded-xl
            border
            p-5
            shadow-sm
            space-y-3
        ">

            <div>

                <h3 className="
                    font-semibold
                    text-green-800
                ">
                    Request #{request.id}
                </h3>

                <p>
                    Customer:
                    {" "}
                    {request.customer?.fullName}
                </p>

                <p>
                    Loại:
                    {" "}
                    {isReturn
                        ? "Hoàn trả"
                        : "Đổi sản phẩm"
                    }
                </p>

                <p>
                    Lý do: {getReasonLabel(request.reason)}
                </p>

                {
                    Number(request.refundAmount) > 0
                    &&
                    (
                        <p>
                            Hoàn tiền:
                            {" "}
                            {
                                formatCurrency(
                                    request.refundAmount
                                )
                            }
                            {" "}VND
                        </p>
                    )
                }

                {
                    Number(request.additionalPayment) > 0
                    &&
                    (
                        <p>
                            Cần thanh toán thêm:
                            {" "}
                            {
                                formatCurrency(
                                    request.additionalPayment
                                )
                            }
                            {" "}VND
                        </p>
                    )
                }

            </div>
            <div>

                <span className="
                    inline-block
                    px-3
                    py-1
                    rounded-full
                    bg-green-100
                    text-green-700
                    text-sm
                ">
                    {getStatusLabel(request.status)}
                </span>

            </div>

            <div className="
                flex
                gap-3
                flex-wrap
                mt-3
            ">

                {/* VIEW */}
                <button
                    onClick={() =>
                        onView(request)
                    }
                    className="
                        px-4
                        py-2
                        rounded-lg
                        bg-green-500
                        text-white
                    "
                >
                    Xem chi tiết
                </button>

                {/* MANAGER APPROVE */}
                {
                    request.status === "PENDING"
                    &&
                    onApprove
                    &&
                    (
                        <button
                            onClick={() =>
                                onApprove(request)
                            }
                            className="
                                px-4
                                py-2
                                rounded-lg
                                bg-emerald-600
                                text-white
                            "
                        >
                            Duyệt yêu cầu
                        </button>
                    )
                }

                {/* RETURNING */}
                {
                    request.status === "RETURNING"
                    &&
                    onConfirmReceived
                    &&
                    (
                        <button
                            onClick={() =>
                                onConfirmReceived(request)
                            }
                            className="
                                px-4
                                py-2
                                rounded-lg
                                bg-purple-500
                                text-white
                            "
                        >
                            Đã nhận hàng
                        </button>
                    )
                }

                {/* RECEIVED */}
                {
                    request.status === "RECEIVED"
                    &&
                    onProcessPayment
                    &&
                    (
                        <button
                            onClick={() =>
                                onProcessPayment(request)
                            }
                            className="
                                px-4
                                py-2
                                rounded-lg
                                bg-indigo-500
                                text-white
                            "
                        >
                            Xử lý thanh toán
                        </button>
                    )
                }

                {/* PROCESSING */}
                {
                    request.status === "PROCESSING"
                    &&
                    onComplete
                    &&
                    (
                        <button
                            onClick={() =>
                                onComplete(request)
                            }
                            className="
                                px-4
                                py-2
                                rounded-lg
                                bg-red-500
                                text-white
                            "
                        >
                            Hoàn tất
                        </button>
                    )
                }

            </div>
        </div>
    );
}