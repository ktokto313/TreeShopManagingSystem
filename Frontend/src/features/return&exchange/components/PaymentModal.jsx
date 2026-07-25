import { useState } from "react";
import { confirmAdditionalPayment } from "../api/returnRequestApi";

export default function PaymentModal({ request, onClose, onSuccess }) {

    const [loading, setLoading] = useState(false);

    async function handlePay() {
        try {
            setLoading(true);

            await confirmAdditionalPayment(request.id);

            alert("Thanh toán thành công. Đơn hàng đổi sản phẩm mới đã được tạo (Đang xử lý)");
            onSuccess();

        } catch (e) {
            console.error(e);
            alert("Thanh toán thất bại");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-[400px]">

                <h2 className="text-lg font-semibold mb-4">
                    Thanh toán thêm
                </h2>

                <p>
                    Số tiền cần thanh toán:
                    <strong className="ml-2 text-red-500">
                        {request.additionalPayment} VND
                    </strong>
                </p>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handlePay}
                        disabled={loading}
                        className="px-4 py-2 bg-green-500 text-white rounded"
                    >
                        Xác nhận thanh toán
                    </button>

                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded"
                    >
                        Hủy
                    </button>
                </div>

            </div>
        </div>
    );
}