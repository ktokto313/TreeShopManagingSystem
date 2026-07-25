import { useState } from "react";
import { submitRefundInfo } from "../api/returnRequestApi";

export default function RefundInfoModal({ request, onClose, onSuccess }) {

    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountHolder, setAccountHolder] = useState("");

    async function handleSubmit() {
        try {

            await submitRefundInfo(request.id, {
                bankName,
                accountNumber,
                accountHolder
            });

            alert("Đã gửi thông tin nhận tiền");
            onSuccess();

        } catch (e) {
            console.error(e);
            alert("Lỗi gửi thông tin");
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-[400px]">

                <h2 className="text-lg font-semibold mb-4">
                    Nhập thông tin nhận tiền
                </h2>

                <input
                    placeholder="Tên ngân hàng"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full border p-2 mb-2"
                />

                <input
                    placeholder="Số tài khoản"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    className="w-full border p-2 mb-2"
                />

                <input
                    placeholder="Chủ tài khoản"
                    value={accountHolder}
                    onChange={e => setAccountHolder(e.target.value)}
                    className="w-full border p-2"
                />

                <div className="flex gap-3 mt-4">
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-green-500 text-white rounded"
                    >
                        Gửi
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