import { useRef, useState } from "react";
import OrderSelector from "./OrderSelector";
import ReturnItemSelector from "./ReturnItemSelector";
import ReturnReasonSelector from "./ReturnReasonSelector";
import EvidenceUploader from "./EvidenceUploader";
import ExchangeProductSelector from "./ExchangeProductSelector";
import { createReturnRequest } from "../api/returnRequestApi";

const MIN_DAMAGED_EVIDENCE = 2;

export default function CreateReturnRequestModal({
                                                     customerId,
                                                     onClose,
                                                     onSubmitted
                                                 }) {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [reason, setReason] = useState("");
    const [evidenceImages, setEvidenceImages] = useState([]);
    const [returnType, setReturnType] = useState("");
    const [exchangeProductId, setExchangeProductId] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const evidenceUploaderRef = useRef(null);

    function handleSelectOrder(order) {
        setSelectedOrder(order);
        setSelectedItems([]);
    }

    function handleClose() {
        evidenceUploaderRef.current?.revokeAll();
        onClose?.();
    }

    function validate() {
        if (!selectedOrder) {
            return "Vui lòng chọn đơn hàng.";
        }
        if (selectedItems.length === 0) {
            return "Vui lòng chọn ít nhất 1 sản phẩm để trả/đổi.";
        }
        if (!reason) {
            return "Vui lòng chọn lý do.";
        }
        if (reason === "DAMAGED" && evidenceImages.length < MIN_DAMAGED_EVIDENCE) {
            return `Lý do "Sản phẩm bị hỏng" cần tối thiểu ${MIN_DAMAGED_EVIDENCE} hình ảnh bằng chứng.`;
        }
        if (!returnType) {
            return "Vui lòng chọn phương thức xử lý (Trả hàng / Đổi hàng).";
        }
        if (returnType === "EXCHANGE" && !exchangeProductId) {
            return "Vui lòng chọn sản phẩm muốn đổi.";
        }
        return "";
    }

    async function handleSubmit() {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError("");
        setSubmitting(true);

        try {

            let finalEvidenceUrls = [];
            if (reason === "DAMAGED") {
                finalEvidenceUrls = await evidenceUploaderRef.current.uploadPending();
            }

            const dto = {
                orderId: selectedOrder.id,
                items: selectedItems.map(item => ({
                    orderDetailId: item.orderDetailId,
                    quantity: item.quantity
                })),
                reason,
                evidenceImageUrls: finalEvidenceUrls,
                returnType,
                exchangeProductId: returnType === "EXCHANGE" ? exchangeProductId : null
            };

            const created = await createReturnRequest(customerId, dto);
            onSubmitted?.(created);
            onClose?.();
        } catch (err) {
            setError(
                err?.message ||
                "Không thể gửi yêu cầu, vui lòng thử lại."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div
            className="
                fixed inset-0 z-50
                flex items-center justify-center
                bg-black/40 p-4
            "
        >
            <div
                className="
                    w-full max-w-xl
                    max-h-[90vh] overflow-y-auto
                    bg-white rounded-2xl shadow-lg
                    p-6 space-y-5
                "
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-green-800">
                        Tạo yêu cầu trả/đổi hàng
                    </h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-stone-400 hover:text-stone-600"
                    >
                        ✕
                    </button>
                </div>

                <OrderSelector
                    customerId={customerId}
                    selectedOrder={selectedOrder}
                    setSelectedOrder={handleSelectOrder}
                />

                {selectedOrder && (
                    <ReturnItemSelector
                        order={selectedOrder}
                        selectedItems={selectedItems}
                        setSelectedItems={setSelectedItems}
                    />
                )}

                <ReturnReasonSelector
                    reason={reason}
                    setReason={setReason}
                />

                {reason === "DAMAGED" && (
                    <EvidenceUploader
                        ref={evidenceUploaderRef}
                        value={evidenceImages}
                        onChange={setEvidenceImages}
                    />
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-700">
                        Phương thức xử lý
                    </label>
                    <select
                        value={returnType}
                        onChange={(e) => setReturnType(e.target.value)}
                        className="
                            w-full rounded-lg border border-stone-300
                            px-3 py-2 text-sm
                            focus:outline-none focus:ring-2
                            focus:ring-green-500
                        "
                    >
                        <option value="">Chọn phương thức</option>
                        <option value="RETURN">Trả hàng (hoàn tiền)</option>
                        <option value="EXCHANGE">Đổi hàng</option>
                    </select>
                </div>

                {returnType === "EXCHANGE" && (
                    <ExchangeProductSelector
                        product={exchangeProductId}
                        setProduct={setExchangeProductId}
                    />
                )}

                {error && (
                    <p className="text-sm text-red-500">
                        {error}
                    </p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="
                            px-4 py-2 rounded-lg
                            border border-stone-300
                            text-stone-600 hover:bg-stone-50
                        "
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="
                            px-4 py-2 rounded-lg
                            bg-green-500 text-white
                            hover:bg-green-600
                            disabled:opacity-50
                        "
                    >
                        {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
                    </button>
                </div>
            </div>
        </div>
    );
}