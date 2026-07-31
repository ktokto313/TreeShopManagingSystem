import { useState } from "react";
import { confirmAdditionalPayment } from "../api/returnRequestApi";

export default function PaymentModal({ request, onClose, onSuccess }) {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isPayable = request?.status === "WAITING_PAYMENT";

    function formatCurrency(amount) {
        if (!amount) return "0";
        return new Intl.NumberFormat("en-US").format(amount);
    }

    async function handlePay() {

        if (!isPayable) {
            setError("Không đúng trạng thái thanh toán");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await confirmAdditionalPayment(request.id);

            alert("Thanh toán thành công");
            onSuccess?.();

        } catch (e) {
            setError("Thanh toán thất bại");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-[400px] space-y-4">

                <h2 className="text-lg font-semibold">Thanh toán</h2>

                <p>
                    Số tiền:
                    <strong className="ml-2 text-red-500">
                        {formatCurrency(request?.additionalPayment)} VND
                    </strong>
                </p>

                {error && <p className="text-red-500">{error}</p>}

                <div className="flex gap-3">
                    <button
                        onClick={handlePay}
                        disabled={loading || !isPayable}
                        className="px-4 py-2 bg-green-500 text-white rounded"
                    >
                        {loading ? "Đang xử lý..." : "Thanh toán"}
                    </button>

                    <button onClick={onClose} className="border px-4 py-2 rounded">
                        Hủy
                    </button>
                </div>

            </div>
        </div>
    );
}