export default function ReturnReasonSelector({
                                                 reason,
                                                 setReason
                                             }) {

    return (
        <div className="space-y-2">

            <label className="text-sm font-medium text-stone-700">
                Lý do trả hàng
            </label>

            <select
                value={reason || ""}
                onChange={(e) => setReason(e.target.value)}
                className="
                    w-full rounded-lg border border-stone-300
                    px-3 py-2 text-sm
                    focus:outline-none focus:ring-2
                    focus:ring-green-500
                "
            >

                <option value="">
                    Chọn lý do
                </option>

                <option value="DAMAGED">
                    Sản phẩm bị hỏng
                </option>

                <option value="WRONG_ITEM">
                    Nhận sai sản phẩm
                </option>

                <option value="OTHER">
                    Lý do khác
                </option>

            </select>

        </div>
    );
}