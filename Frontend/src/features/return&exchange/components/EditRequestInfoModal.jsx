import { useRef, useState } from "react";
import EvidenceUploader from "./EvidenceUploader";
import { updateRequestInfo } from "../api/returnRequestApi";

export default function EditRequestInfoModal({ request, onClose, onSuccess }) {

    const [note, setNote] = useState(request?.managerNote ?? "");
    const [evidenceImages, setEvidenceImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const evidenceUploaderRef = useRef(null);

    function handleClose() {
        evidenceUploaderRef.current?.revokeAll();
        onClose?.();
    }

    async function handleSubmit() {

        setError("");
        setSubmitting(true);

        try {

            const additionalImageUrls =
                await evidenceUploaderRef.current.uploadPending();

            await updateRequestInfo(request.id, {
                note,
                additionalImageUrls
            });

            alert("Đã cập nhật thông tin yêu cầu");
            onSuccess?.();

        } catch (err) {
            setError(
                err?.message ||
                "Không thể cập nhật thông tin, vui lòng thử lại."
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
                    w-full max-w-lg
                    max-h-[90vh] overflow-y-auto
                    bg-white rounded-2xl shadow-lg
                    p-6 space-y-4
                "
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-green-800">
                        Chỉnh sửa yêu cầu #{request?.id}
                    </h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-stone-400 hover:text-stone-600"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-700">
                        Ghi chú bổ sung
                    </label>
                    <textarea
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        placeholder="Nhập ghi chú hoặc thông tin bổ sung"
                        className="
                            w-full rounded-lg border border-stone-300
                            px-3 py-2 text-sm
                            focus:outline-none focus:ring-2
                            focus:ring-green-500
                        "
                        rows={3}
                    />
                </div>

                <EvidenceUploader
                    ref={evidenceUploaderRef}
                    value={evidenceImages}
                    onChange={setEvidenceImages}
                />

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
                        {submitting ? "Đang gửi..." : "Gửi"}
                    </button>
                </div>
            </div>
        </div>
    );
}