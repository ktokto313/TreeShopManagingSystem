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

    const isPending = request?.status === "PENDING";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-green-800">
                        Yêu cầu #{request?.id}
                    </h2>
                    <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-600">
                        ✕
                    </button>
                </div>

                <div className="space-y-1 text-sm text-stone-600">
                    <p>Khách hàng: {request?.customer?.fullName}</p>
                    <p>Đơn hàng: #{request?.order?.id}</p>
                    <p>
                        Loại:{" "}
                        {request?.returnType === "RETURN" ? "Hoàn trả" : "Đổi sản phẩm"}
                    </p>
                    <p>Lý do: {request?.reason}</p>
                    {request?.expectedFee != null && <p>Phí ước tính: {request.expectedFee}</p>}
                    {request?.managerNote && <p>Ghi chú: {request.managerNote}</p>}
                </div>

                {request?.evidences?.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                        {request.evidences.map((ev) => (
                            <img
                                key={ev.id}
                                src={ev.imageUrl}
                                alt="evidence"
                                className="w-full h-24 object-cover rounded-lg border"
                            />
                        ))}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-700">
                        Lý do từ chối (nếu từ chối)
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value);
                            if (reasonError && e.target.value.trim()) setReasonError(false);
                        }}
                        placeholder="Nhập lý do từ chối"
                        className={`
                            w-full rounded-lg border px-3 py-2 text-sm
                            focus:outline-none focus:ring-2
                            ${reasonError
                            ? "border-red-400 focus:ring-red-400"
                            : "border-stone-300 focus:ring-green-500"}
                        `}
                        rows={3}
                    />
                    {reasonError && (
                        <p className="text-xs text-red-500">
                            Vui lòng nhập lý do trước khi từ chối
                        </p>
                    )}
                </div>

                {!isPending && (
                    <p className="text-xs text-stone-400">
                        Yêu cầu này không còn ở trạng thái chờ duyệt — chỉ có thể từ chối.
                    </p>
                )}

                <div className="flex justify-end gap-3 pt-2 flex-wrap">
                    {isPending && onRequestMoreInfo && (
                        <button
                            type="button"
                            onClick={handleRequestMoreInfo}
                            disabled={requestingInfo}
                            className="px-4 py-2 rounded-lg border border-blue-300 text-blue-500 hover:bg-blue-50 disabled:opacity-50"
                        >
                            {requestingInfo ? "Đang gửi..." : "Yêu cầu thêm thông tin"}
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleReject}
                        className="px-4 py-2 rounded-lg border border-red-300 text-red-500 hover:bg-red-50"
                    >
                        Từ chối
                    </button>
                    {isPending && (
                        <button
                            type="button"
                            onClick={onApprove}
                            className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
                        >
                            Duyệt
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}