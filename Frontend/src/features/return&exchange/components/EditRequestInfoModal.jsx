import { useRef, useState } from "react";
import EvidenceUploader from "./EvidenceUploader";
import { updateRequestInfo } from "../api/returnRequestApi";

export default function EditRequestInfoModal({ request, onClose, onSuccess }) {

    const [reason, setReason] = useState(request?.reason ?? "OTHER");
    const [note, setNote] = useState(request?.customerNote ?? "");
    const [evidenceImages, setEvidenceImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const evidenceUploaderRef = useRef(null);

    const isEditable =
        request?.status === "PENDING" ||
        request?.status === "PROCESSING";

    function handleClose() {
        evidenceUploaderRef.current?.revokeAll();
        onClose?.();
    }

    async function handleSubmit() {

        if (!isEditable) {
            setError("Không thể chỉnh sửa ở trạng thái hiện tại");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const additionalImageUrls =
                await evidenceUploaderRef.current.uploadPending();

            await updateRequestInfo(request.id, {
                reason,
                note,
                additionalImageUrls
            });

            alert("Đã cập nhật thông tin yêu cầu");
            onSuccess?.();

        } catch (err) {
            setError(err?.message || "Lỗi cập nhật");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-[500px] space-y-4">

                <h2 className="text-lg font-semibold">
                    Chỉnh sửa yêu cầu #{request?.id}
                </h2>

                <select
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    disabled={!isEditable}
                    className="w-full border p-2 rounded"
                >
                    <option value="DAMAGED">Hàng bị hỏng</option>
                    <option value="WRONG_ITEM">Sai sản phẩm</option>
                    <option value="UNHEALTHY">Không đạt chất lượng</option>
                    <option value="OTHER">Khác</option>
                </select>

                <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    disabled={!isEditable}
                    className="w-full border p-2 rounded"
                    rows={3}
                />

                <EvidenceUploader
                    ref={evidenceUploaderRef}
                    value={evidenceImages}
                    onChange={setEvidenceImages}
                    disabled={!isEditable}
                />

                {error && <p className="text-red-500">{error}</p>}

                <div className="flex gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !isEditable}
                        className="px-4 py-2 bg-green-500 text-white rounded"
                    >
                        {submitting ? "Đang gửi..." : "Cập nhật"}
                    </button>

                    <button onClick={handleClose} className="border px-4 py-2 rounded">
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
}