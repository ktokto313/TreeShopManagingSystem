import { useState } from "react";

export default function ReturnDecisionModal({
                                                request,
                                                onApprove,
                                                onReject,
                                                onRequestMoreInfo,
                                                onClose
                                            }) {
    const [reason, setReason] = useState("");
    const [requestingInfo, setRequestingInfo] = useState(false);
    const [reasonError, setReasonError] = useState(false);

    const canDecision =
        request?.status === "PENDING" ||
        request?.status === "WAITING_CUSTOMER_INFO";

    const canRequestInfo =
        request?.status === "PENDING";

    function formatCurrency(amount) {

        return new Intl.NumberFormat("en-US")
            .format(Number(amount || 0));
    }

    function handleReject() {
        const trimmed = reason.trim();
        if (!trimmed) {
            setReasonError(true);
            return;
        }
        setReasonError(false);
        onReject(trimmed);
    }

    async function handleRequestMoreInfo() {
        try {
            setRequestingInfo(true);
            await onRequestMoreInfo();
        } finally {
            setRequestingInfo(false);
        }
    }

    return (

        <div className="
            fixed inset-0
            z-50
            flex items-center justify-center
            bg-black/40
            p-4
        ">
            <div className="
                w-full
                max-w-lg
                bg-white
                rounded-2xl
                shadow-lg
                p-6
                space-y-4
            ">

                <div className="
                    flex
                    items-center
                    justify-between
                ">
                    <h2 className="
                        text-lg
                        font-semibold
                        text-green-800
                    ">
                        Yêu cầu #{request?.id}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            text-stone-400
                            hover:text-stone-600
                        "
                    >
                        ✕
                    </button>
                </div>



                <div className="
                    space-y-1
                    text-sm
                    text-stone-600
                ">

                    <p>
                        Khách hàng:
                        {" "}
                        {request?.customer?.fullName}
                    </p>

                    <p>
                        Đơn hàng:
                        {" "}
                        #{request?.order?.id}
                    </p>

                    <p>
                        Loại:
                        {" "}
                        {
                            request?.returnType === "RETURN"
                                ? "Hoàn trả"
                                : "Đổi sản phẩm"
                        }
                    </p>


                    <p>
                        Lý do:
                        {" "}
                        {request?.reason}
                    </p>


                    {
                        Number(request?.refundAmount) > 0 && (

                            <p>
                                Tiền hoàn khách:
                                {" "}
                                {
                                    formatCurrency(
                                        request.refundAmount
                                    )
                                } VND
                            </p>

                        )
                    }

                    {
                        Number(request?.additionalPayment) > 0 && (

                            <p>
                                Khách cần thanh toán thêm:
                                {" "}
                                {
                                    formatCurrency(
                                        request.additionalPayment
                                    )
                                } VND
                            </p>

                        )
                    }

                    {
                        request?.managerNote && (

                            <p>
                                Ghi chú:
                                {" "}
                                {request.managerNote}
                            </p>

                        )
                    }

                    {
                        request?.accountNumber && (

                            <div className="
                                mt-3
                                p-3
                                rounded-lg
                                bg-stone-50
                                space-y-1
                                border
                            ">
                                <p className="
                                    font-semibold
                                    text-stone-700
                                ">
                                    Thông tin nhận tiền
                                </p>

                                <p>
                                    Ngân hàng:
                                    {" "}
                                    {request.bankName || "Chưa cập nhật"}
                                </p>

                                <p>
                                    Số tài khoản:
                                    {" "}
                                    {request.accountNumber}
                                </p>

                                <p>
                                    Chủ tài khoản:
                                    {" "}
                                    {request.accountHolder}
                                </p>

                            </div>

                        )
                    }

                </div>

                {
                    request?.evidences?.length > 0 && (

                        <div className="
                            grid
                            grid-cols-3
                            gap-2
                        ">

                            {
                                request.evidences.map((ev) => (

                                    <img
                                        key={ev.id}
                                        src={ev.imageUrl}
                                        alt="evidence"
                                        className="
                                            w-full
                                            h-24
                                            object-cover
                                            rounded-lg
                                            border
                                        "
                                    />

                                ))
                            }

                        </div>

                    )
                }
                {
                    canDecision && (

                        <div className="
                            space-y-2
                        ">
                            <label className="
                                text-sm
                                font-medium
                                text-stone-700
                            ">
                                Lý do từ chối (nếu từ chối)
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => {

                                    setReason(
                                        e.target.value
                                    );

                                    if (
                                        reasonError &&
                                        e.target.value.trim()
                                    ) {

                                        setReasonError(false);

                                    }

                                }}

                                placeholder="
                                    Nhập lý do từ chối
                                "
                                className={`

                                    w-full
                                    rounded-lg
                                    border
                                    px-3
                                    py-2
                                    text-sm

                                    focus:outline-none
                                    focus:ring-2

                                    ${
                                    reasonError
                                        ?
                                        "border-red-400 focus:ring-red-400"
                                        :
                                        "border-stone-300 focus:ring-green-500"
                                }
                                `}
                                rows={3}
                            />

                            {
                                reasonError && (

                                    <p className="
                                        text-xs
                                        text-red-500
                                    ">
                                        Vui lòng nhập lý do trước khi từ chối
                                    </p>

                                )
                            }
                        </div>
                    )
                }

                {
                    !canDecision && (

                        <p className="
                            text-xs
                            text-stone-400
                        ">
                            Yêu cầu này đã qua bước duyệt.
                        </p>

                    )
                }

                <div className="
                    flex
                    justify-end
                    gap-3
                    pt-2
                    flex-wrap
                ">
                    {
                        canRequestInfo &&
                        onRequestMoreInfo && (
                            <button
                                type="button"
                                onClick={handleRequestMoreInfo}
                                disabled={requestingInfo}
                                className="
                                    px-4
                                    py-2
                                    rounded-lg
                                    border
                                    border-blue-300
                                    text-blue-500
                                    hover:bg-blue-50
                                    disabled:opacity-50
                                "
                            >

                                {
                                    requestingInfo
                                        ?
                                        "Đang gửi..."
                                        :
                                        "Yêu cầu thêm thông tin"
                                }

                            </button>

                        )
                    }
                    {
                        canDecision && (
                            <button
                                type="button"
                                onClick={handleReject}
                                className="
                                    px-4
                                    py-2
                                    rounded-lg
                                    border
                                    border-red-300
                                    text-red-500
                                    hover:bg-red-50
                                "
                            >
                                Từ chối
                            </button>

                        )
                    }
                    {
                        canDecision && (

                            <button
                                type="button"
                                onClick={onApprove}
                                className="
                                    px-4
                                    py-2
                                    rounded-lg
                                    bg-green-500
                                    text-white
                                    hover:bg-green-600
                                "
                            >
                                Duyệt
                            </button>

                        )
                    }


                </div>
            </div>
        </div>
    );
}