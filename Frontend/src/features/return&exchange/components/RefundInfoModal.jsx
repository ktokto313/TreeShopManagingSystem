import { useState } from "react";
import { submitRefundInfo } from "../api/returnRequestApi";

export default function RefundInfoModal({ request, onClose, onSuccess }) {

    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountHolder, setAccountHolder] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isEditable = request?.status === "WAITING_BANK_INFO";

    async function handleSubmit() {

        if (!bankName || !accountNumber || !accountHolder) {
            setError("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        if (!isEditable) {
            setError("Không đúng trạng thái");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await submitRefundInfo(request.id, {
                bankName,
                accountNumber,
                accountHolder
            });

            alert("Đã gửi thông tin");
            onSuccess?.();

        } catch {
            setError("Gửi thất bại");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-[400px] space-y-3">

                <h2 className="text-lg font-semibold">
                    Thông tin hoàn tiền
                </h2>

                <input
                    placeholder="Ngân hàng"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full border p-2"
                />

                <input
                    placeholder="Số tài khoản"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    className="w-full border p-2"
                />

                <input
                    placeholder="Chủ tài khoản"
                    value={accountHolder}
                    onChange={e => setAccountHolder(e.target.value)}
                    className="w-full border p-2"
                />

                {error && <p className="text-red-500">{error}</p>}

                <div className="flex gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !isEditable}
                        className="px-4 py-2 bg-green-500 text-white rounded"
                    >
                        {loading ? "Đang gửi..." : "Gửi"}
                    </button>

                    <button onClick={onClose} className="border px-4 py-2 rounded">
                        Hủy
                    </button>
                </div>

            </div>
        </div>
    );
}