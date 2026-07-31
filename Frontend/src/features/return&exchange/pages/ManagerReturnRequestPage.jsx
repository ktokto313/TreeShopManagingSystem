import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getManagerRequests,
    getRequestDetail,
    decideRequest,
    confirmReturn,
    completePayment,
    completeByManager,
    requestMoreInfo
} from "../api/returnRequestApi";

import ReturnRequestCard from "../components/ReturnRequestCard";
import ReturnDecisionModal from "../components/ReturnDecisionModal";

export default function ManagerReturnRequestPage() {
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        load();

        const interval =
            setInterval(
                load,
                5000
            );

        return () =>
            clearInterval(interval);

    }, []);

    async function load() {

        try {

            setLoading(true);

            const data =
                await getManagerRequests();

            setRequests(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "LOAD MANAGER RETURN ERROR:",
                error
            );

            setRequests([]);

        } finally {

            setLoading(false);

        }
    }

    async function openDetail(request) {
        try {
            setLoadingDetail(true);

            const detail =
                await getRequestDetail(
                    request.id
                );

            setSelected(detail);
        } catch (error) {

            console.error(
                "GET RETURN DETAIL ERROR:",
                error
            );

            alert(
                "Không thể tải chi tiết yêu cầu"
            );

        } finally {
            setLoadingDetail(false);
        }
    }

    function closeDetail() {
        setSelected(null);
    }

    async function approve() {

        if (!selected) {
            return;
        }

        try {

            await decideRequest(
                selected.id,
                "APPROVE"
            );

            alert(
                "Đã duyệt yêu cầu"
            );

            closeDetail();

            await load();

        } catch (error) {

            console.error(error);

            alert(
                "Không thể duyệt yêu cầu"
            );
        }
    }

    async function reject(reason) {

        if (!selected) {
            return;
        }
        if (!reason || !reason.trim()) {

            alert(
                "Vui lòng nhập lý do từ chối"
            );

            return;
        }

        try {

            await decideRequest(
                selected.id,
                "DECLINE",
                reason.trim()
            );


            alert(
                "Đã từ chối yêu cầu"
            );

            closeDetail();

            await load();


        } catch (error) {

            console.error(
                "REJECT ERROR:",
                error
            );

            alert(
                "Không thể từ chối yêu cầu"
            );
        }
    }

    async function handleRequestMoreInfo() {

        if (!selected) {
            return;
        }
        try {

            await requestMoreInfo(
                selected.id
            );


            alert(
                "Đã yêu cầu khách hàng bổ sung thông tin"
            );

            closeDetail();

            await load();


        } catch (error) {

            console.error(
                "REQUEST INFO ERROR:",
                error
            );

            alert(
                "Không thể yêu cầu bổ sung thông tin"
            );
        }
    }

    async function handleConfirmReceived(request) {
        try {

            await confirmReturn(
                request.id
            );


            alert(
                "Đã xác nhận nhận hàng hoàn trả"
            );


            await load();


        } catch (error) {

            console.error(
                "CONFIRM RETURN ERROR:",
                error
            );


            alert(
                "Không thể xác nhận nhận hàng"
            );
        }
    }

    async function handleProcessPayment(request) {
        try {

            await completePayment(
                request.id
            );


            alert(
                "Đã xử lý bước tài chính"
            );


            await load();


        } catch (error) {

            console.error(
                "PAYMENT ERROR:",
                error
            );


            alert(
                "Không thể xử lý thanh toán"
            );
        }
    }

    async function handleComplete(request) {
        try {

            await completeByManager(
                request.id
            );


            alert(
                "Đã hoàn tất yêu cầu"
            );


            await load();


        } catch (error) {

            console.error(
                "COMPLETE ERROR:",
                error
            );


            alert(
                "Không thể hoàn tất yêu cầu"
            );
        }
    }
    return (

        <main className="
            bg-gradient-to-br
            from-green-50
            to-white
            min-h-screen
        ">

            <div className="
                max-w-5xl
                mx-auto
                py-10
            ">


                <div className="
                    flex
                    justify-between
                    items-center
                ">

                    <h1 className="
                        text-3xl
                        font-bold
                        text-green-800
                    ">
                        Quản lý yêu cầu đổi trả
                    </h1>
                    <button
                        onClick={() =>
                            navigate(
                                "/return-requests/report"
                            )
                        }
                        className="
                            px-4 py-2
                            bg-green-700
                            text-white
                            rounded-md
                            hover:bg-green-800
                            cursor-pointer
                            text-sm
                            font-medium
                        "
                    >
                        Xem báo cáo
                    </button>
                </div>


                {
                    (loadingDetail || loading) && (

                        <p className="
                            text-sm
                            text-stone-500
                            mt-3
                        ">
                            Đang tải...
                        </p>

                    )
                }


                <div className="
                    grid
                    gap-5
                    mt-6
                ">

                    {
                        requests.map(request => (

                            <ReturnRequestCard

                                key={
                                    request.id
                                }

                                request={
                                    request
                                }

                                onView={
                                    openDetail
                                }

                                onConfirmReceived={
                                    handleConfirmReceived
                                }

                                onProcessPayment={
                                    handleProcessPayment
                                }

                                onComplete={
                                    handleComplete
                                }

                            />

                        ))
                    }

                </div>


                {
                    !loading &&
                    requests.length === 0 && (

                        <div className="
                            mt-10
                            text-center
                            text-stone-500
                        ">
                            Không có yêu cầu cần xử lý.
                        </div>

                    )
                }

            </div>


            {
                selected && (

                    <ReturnDecisionModal

                        request={
                            selected
                        }

                        onApprove={
                            approve
                        }

                        onReject={
                            reject
                        }

                        onRequestMoreInfo={
                            handleRequestMoreInfo
                        }

                        onClose={
                            closeDetail
                        }

                    />

                )
            }
        </main>
    );
}