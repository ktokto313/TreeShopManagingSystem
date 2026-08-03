import { useContext, useEffect, useState } from "react";
import { Container } from "../../../components/global/Container";
import { Button } from "../../../components/ui/Button";
import { AuthContext } from "../../../context/AuthContext";

import {
    getMyReturnRequests,
    markReturning,
    cancelRequest
} from "../api/returnRequestApi";

import CreateReturnRequestModal from "../components/CreateReturnRequestModal";
import PaymentModal from "../components/PaymentModal";
import RefundInfoModal from "../components/RefundInfoModal";
import EditRequestInfoModal from "../components/EditRequestInfoModal";

export default function CustomerReturnRequestPage() {

    const { user, isLoading: authLoading } = useContext(AuthContext);

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [showPayment, setShowPayment] = useState(null);
    const [showRefund, setShowRefund] = useState(null);
    const [showEdit, setShowEdit] = useState(null);
    const [cancelingId, setCancelingId] = useState(null);


    function formatCurrency(amount) {
        return new Intl.NumberFormat("en-US")
            .format(Number(amount || 0));

    }

    async function loadRequests() {

        if (!user?.id) {
            return;
        }

        try {
            setLoading(true);

            const data =
                await getMyReturnRequests(user.id);

            setRequests(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch(error) {

            console.error(
                "LOAD RETURN ERROR:",
                error
            );

            setRequests([]);

        } finally {

            setLoading(false);

        }
    }

    useEffect(() => {

        if(user?.id){
            loadRequests();
        }

    },[user?.id]);

    async function handleReturnItem(id){

        try{

            await markReturning(id);

            alert(
                "Đã xác nhận gửi hàng hoàn trả"
            );

            loadRequests();


        }catch(error){

            console.error(
                "RETURN ITEM ERROR:",
                error
            );

            alert(
                "Không thể xác nhận trả hàng"
            );
        }
    }

    async function handleCancelRequest(id){

        if(!window.confirm(
            "Bạn có chắc muốn hủy yêu cầu này?"
        )){
            return;
        }
        try{

            setCancelingId(id);
            await cancelRequest(id);
            alert(
                "Đã hủy yêu cầu"
            );


            loadRequests();


        }catch(error){

            console.error(
                "CANCEL REQUEST ERROR:",
                error
            );

            alert(
                "Không thể hủy yêu cầu"
            );

        }finally{

            setCancelingId(null);

        }
    }
    function getReasonLabel(reason) {

        const map = {
            DAMAGED: "Sản phẩm bị hư hỏng",
            WRONG_ITEM: "Giao sai sản phẩm",
            UNHEALTHY: "Sản phẩm không đạt chất lượng",
            OTHER: "Lý do khác"
        };

        return map[reason] ?? reason;
    }

    function getStatusLabel(status){

        const map = {

            PENDING:
                "Chờ duyệt",

            WAITING_CUSTOMER_INFO:
                "Cần bổ sung thông tin",

            APPROVED:
                "Đã duyệt - Chờ gửi hàng",

            REJECTED:
                "Từ chối",

            RETURNING:
                "Đang vận chuyển hàng trả",

            RECEIVED:
                "Shop đã nhận hàng",

            PROCESSING:
                "Đang xử lý",

            WAITING_PAYMENT:
                "Chờ thanh toán thêm",

            WAITING_BANK_INFO:
                "Chờ nhập thông tin ngân hàng",

            COMPLETED:
                "Hoàn thành",

            FAILED:
                "Thất bại"
        };

        return map[status] ?? status;
    }

    return (

        <main className="
            bg-gradient-to-br from-green-50 to-white
            min-h-screen
        ">

            <section className="
                bg-gradient-to-r
                from-green-700 to-green-500
                text-white py-12
            ">

                <Container className="space-y-3">

                    <p className="
                        text-green-200
                        text-sm uppercase
                        tracking-widest
                    ">
                        Dịch vụ khách hàng
                    </p>

                    <h1 className="
                        text-4xl font-bold
                    ">
                        Yêu cầu đổi trả
                    </h1>

                    <p className="text-green-100">
                        Theo dõi các yêu cầu hoàn trả
                        hoặc đổi sản phẩm của bạn.
                    </p>

                </Container>
            </section>

            <Container className="
                py-10 space-y-6
            ">

                <div className="
                    flex justify-between items-center
                ">

                    <h2 className="
                        text-2xl font-semibold
                        text-green-800
                    ">
                        Yêu cầu của tôi
                    </h2>

                    <Button
                        className="
                            bg-green-500
                            hover:bg-green-600
                            text-white
                        "
                        onClick={() =>
                            setShowCreate(true)
                        }
                    >
                        + Tạo yêu cầu
                    </Button>
                </div>

                {
                    (authLoading || loading) && (

                        <div className="
                            text-center py-10
                            text-stone-500
                        ">
                            Đang tải...
                        </div>

                    )
                }

                {
                    !authLoading &&
                    !loading &&
                    requests.length === 0 && (

                        <div className="
                            text-center py-16
                            border-2 border-dashed
                            border-stone-200
                            rounded-2xl
                            text-stone-400
                        ">
                            Bạn chưa có yêu cầu đổi trả nào.
                        </div>

                    )
                }

                {
                    !authLoading &&
                    !loading &&
                    requests.length > 0 && (

                        <div className="
                            grid gap-5
                        ">

                            {
                                requests.map(request => (

                                    <div
                                        key={request.id}
                                        className="
                                            bg-white rounded-2xl
                                            border border-stone-100
                                            p-5 shadow-sm
                                            flex justify-between
                                            items-center
                                        "

                                    >
                                        <div className="space-y-2">


                                            <h3 className="
                                                font-semibold
                                                text-green-800
                                            ">
                                                Yêu cầu #{request.id}
                                            </h3>

                                            <p className="
                                                text-sm text-stone-600
                                            ">
                                                Đơn hàng:
                                                {" "}
                                                #{request.order?.id}
                                            </p>

                                            <p className="
                                                text-sm text-stone-600
                                            ">
                                                Loại:
                                                {" "}
                                                {
                                                    request.returnType === "RETURN"
                                                        ?
                                                        "Hoàn trả"
                                                        :
                                                        "Đổi sản phẩm"
                                                }
                                            </p>

                                            <p className="
                                                text-sm text-stone-600
                                            ">
                                                Lý do:
                                                {" "}
                                                {getReasonLabel(request?.reason)}
                                            </p>

                                            {
                                                Number(request.refundAmount) > 0 && (

                                                    <p className="
                                                        text-sm text-stone-600
                                                    ">
                                                        Hoàn tiền:
                                                        {" "}
                                                        {formatCurrency(
                                                            request.refundAmount
                                                        )}
                                                        {" "}VND
                                                    </p>

                                                )
                                            }
                                            {
                                                Number(request.additionalPayment) > 0 && (

                                                    <p className="
                                                        text-sm text-stone-600
                                                    ">
                                                        Cần thanh toán thêm:
                                                        {" "}
                                                        {formatCurrency(
                                                            request.additionalPayment
                                                        )}
                                                        {" "}VND
                                                    </p>

                                                )
                                            }
                                        </div>
                                        <div className="
                                            flex flex-col
                                            items-end gap-3
                                        ">
                                            <span className="
                                                px-3 py-1 rounded-full
                                                text-sm
                                                bg-green-100
                                                text-green-700
                                            ">
                                                {
                                                    getStatusLabel(
                                                        request.status
                                                    )
                                                }
                                            </span>
                                            {
                                                (
                                                    request.status === "PENDING"
                                                    ||
                                                    request.status === "WAITING_CUSTOMER_INFO"
                                                )
                                                && (

                                                    <Button

                                                        className="
                                                            bg-teal-500
                                                            hover:bg-teal-600
                                                            text-white
                                                        "
                                                        onClick={() =>
                                                            setShowEdit(request)
                                                        }
                                                    >
                                                        {
                                                            request.status === "PENDING"
                                                                ?
                                                                "Chỉnh sửa"
                                                                :
                                                                "Bổ sung thông tin"
                                                        }

                                                    </Button>

                                                )

                                            }
                                            {
                                                request.status === "PENDING"
                                                && (

                                                    <Button
                                                        className="
                                                            bg-gray-500
                                                            hover:bg-gray-600
                                                            text-white
                                                        "
                                                        disabled={
                                                            cancelingId === request.id
                                                        }
                                                        onClick={() =>
                                                            handleCancelRequest(
                                                                request.id
                                                            )
                                                        }
                                                    >
                                                        {
                                                            cancelingId === request.id
                                                                ?
                                                                "Đang hủy..."
                                                                :
                                                                "Hủy yêu cầu"
                                                        }

                                                    </Button>

                                                )
                                            }

                                            {
                                                request.status === "APPROVED"
                                                && (
                                                    <Button
                                                        className="
                                                            bg-blue-500
                                                            hover:bg-blue-600
                                                            text-white
                                                        "
                                                        onClick={() =>
                                                            handleReturnItem(
                                                                request.id
                                                            )
                                                        }
                                                    >
                                                        Trả hàng
                                                    </Button>
                                                )
                                            }
                                            {
                                                request.status === "WAITING_PAYMENT"
                                                &&
                                                Number(request.additionalPayment) > 0
                                                && (
                                                    <Button
                                                        className="
                                                            bg-red-500
                                                            hover:bg-red-600
                                                            text-white
                                                        "
                                                        onClick={() =>
                                                            setShowPayment(request)
                                                        }
                                                    >
                                                        Thanh toán thêm
                                                    </Button>
                                                )
                                            }
                                            {
                                                request.status === "WAITING_BANK_INFO"
                                                &&
                                                Number(request.refundAmount) > 0
                                                && (

                                                    <Button
                                                        className="
                                                            bg-yellow-500
                                                            hover:bg-yellow-600
                                                            text-white
                                                        "
                                                        onClick={() =>
                                                            setShowRefund(request)
                                                        }
                                                    >
                                                        {
                                                            request.accountNumber
                                                                ?
                                                                "Cập nhật thông tin nhận tiền"
                                                                :
                                                                "Nhập thông tin nhận tiền"
                                                        }


                                                    </Button>
                                                )
                                            }
                                        </div>
                                    </div>
                                ))
                            }

                        </div>


                    )

                }

            </Container>

            {
                showCreate && (
                    <CreateReturnRequestModal
                        customerId={user.id}
                        onClose={() =>
                            setShowCreate(false)
                        }
                        onSubmitted={() => {
                            setShowCreate(false);
                            loadRequests();
                        }}
                    />
                )
            }

            {
                showPayment && (
                    <PaymentModal
                        request={showPayment}
                        onClose={() =>
                            setShowPayment(null)
                        }
                        onSuccess={() => {
                            setShowPayment(null);
                            loadRequests();
                        }}
                    />
                )
            }

            {
                showRefund && (
                    <RefundInfoModal
                        request={showRefund}
                        onClose={() =>
                            setShowRefund(null)
                        }
                        onSuccess={() => {
                            setShowRefund(null);
                            loadRequests();
                        }}
                    />
                )
            }
            {
                showEdit && (

                    <EditRequestInfoModal
                        request={showEdit}
                        onClose={() =>
                            setShowEdit(null)
                        }
                        onSuccess={() => {
                            setShowEdit(null);
                            loadRequests();
                        }}
                    />
                )
            }
        </main>
    );
}