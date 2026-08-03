import { useEffect, useState } from "react";
import {confirmAdditionalPayment, getPaymentInfo } from "../api/returnRequestApi";

export default function PaymentModal({
                                         request,
                                         onClose,
                                         onSuccess
                                     }) {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [loadingInfo, setLoadingInfo] = useState(true);
    const returnedValue = calculateReturnedValue();
    const exchangeValue = calculateExchangeValue();
    const additionalPayment =
        Number(request?.additionalPayment || 0);
    const isPayable =
        request?.status === "WAITING_PAYMENT";

    function formatCurrency(amount) {

        return new Intl.NumberFormat("en-US")
            .format(Number(amount || 0));

    }

    function calculateReturnedValue() {

        const rate =
            request?.reason === "DAMAGED" ||
            request?.reason === "WRONG_ITEM"
                ? 1
                : 0.85;

        return request?.items?.reduce(
            (total, item) => {

                const price =
                    Number(
                        item.orderDetail?.product?.price || 0
                    );

                return total +
                    price *
                    Number(item.quantity || 0) *
                    rate;

            },
            0
        ) || 0;
    }

    function calculateExchangeValue() {

        return request?.exchangeProducts?.reduce(
            (total, item) => {

                const price =
                    Number(
                        item.product?.price || 0
                    );

                return total +
                    price *
                    Number(item.quantity || 0);

            },
            0
        ) || 0;
    }

    useEffect(() => {

        const loadPaymentInfo = async () => {

            try {

                setLoadingInfo(true);
                setPaymentInfo(null);
                setError("");

                const data =
                    await getPaymentInfo(request.id);

                setPaymentInfo(data);

            } catch (error) {

                console.error(error);

                setError(
                    "Không thể tải thông tin thanh toán"
                );

            } finally {

                setLoadingInfo(false);

            }
        };

        if (request?.id) {
            loadPaymentInfo();
        }

    }, [request?.id]);

    async function handlePay() {

        if (!isPayable) {

            setError(
                "Không đúng trạng thái thanh toán"
            );

            return;
        }

        try {
            setLoading(true);
            setError("");

            await confirmAdditionalPayment(
                request.id
            );


            alert(
                "Thanh toán thành công"
            );


            onSuccess?.();

        } catch (e) {

            setError(
                e?.message ||
                "Thanh toán thất bại"
            );


        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="
            fixed inset-0
            bg-black/40
            flex items-center justify-center
        ">

            <div className="
                bg-white
                p-6
                rounded-xl
                w-[480px]
                max-h-[75vh]
                overflow-y-auto
                space-y-4
            ">

                <h2 className="
                    text-lg
                    font-semibold
                ">
                    Thanh toán chênh lệch đổi hàng
                </h2>

                <div className="
                    bg-gray-50
                    rounded-lg
                    p-4
                    space-y-3
                ">

                    <div className="
                        flex justify-between
                    ">

                        <span>
                            Giá trị sản phẩm trả lại
                        </span>

                        <span className="
                            text-green-600
                        ">
                            - {
                                formatCurrency(
                                    returnedValue
                                )
                            } VND
                        </span>

                    </div>

                    <div className="
                        flex justify-between
                    ">

                        <span>
                            Giá trị sản phẩm đổi
                        </span>

                        <span>
                            {
                                formatCurrency(
                                    exchangeValue
                                )
                            } VND
                        </span>

                    </div>

                    <hr />

                    <div className="
                        flex justify-between
                        font-semibold
                    ">

                        <span>
                            Cần thanh toán thêm
                        </span>


                        <span className="
                            text-red-500
                        ">
                            {
                                formatCurrency(
                                    additionalPayment
                                )
                            } VND
                        </span>
                    </div>
                </div>

                {
                    loadingInfo ? (

                        <p className="
                            text-center
                        ">
                            Đang tải QR thanh toán...
                        </p>

                    ) : paymentInfo?.qrImageUrl && (

                        <div className="
                            bg-gray-50
                            rounded-lg
                            p-4
                            space-y-3
                            text-center
                        ">
                            <p className="
                                font-semibold
                            ">
                                Quét QR để thanh toán
                            </p>

                            <img
                                src={paymentInfo.qrImageUrl}
                                alt="Payment QR"
                                className="
                                    w-52
                                    h-52
                                    mx-auto
                                "
                            />
                            <p>
                                Tên tài khoản
                                <b>
                                    {" "}
                                    {
                                        paymentInfo.bankAccountName
                                    }
                                </b>
                            </p>
                            <p>
                                Số tài khoản:
                                <b>
                                    {" "}
                                    {
                                        paymentInfo.bankAccountNumber
                                    }
                                </b>
                            </p>

                            <p>
                                Nội dung:
                                <b>
                                    {" "}
                                    {
                                        paymentInfo.transferContent
                                    }
                                </b>
                            </p>
                        </div>
                    )
                }

                {
                    error && (

                        <p className="
                            text-red-500
                        ">
                            {error}
                        </p>

                    )
                }

                <div className="
                    flex gap-3
                ">

                    <button
                        onClick={handlePay}
                        disabled={
                            loading ||
                            !isPayable
                        }
                        className="
                            px-4 py-2
                            bg-green-500
                            text-white
                            rounded
                        "
                    >
                        {
                            loading
                                ?
                                "Đang xử lý..."
                                :
                                "Thanh toán"
                        }

                    </button>

                    <button
                        onClick={onClose}
                        className="
                            border
                            px-4 py-2
                            rounded
                        "
                    >
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
}