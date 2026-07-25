import { useEffect, useState } from "react";
import { Container } from "../../../components/global/Container";
import { getReturnReport } from "../api/returnReportApi";


export default function ManagerReturnReportPage() {

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    async function loadReport() {
        try {
            setLoading(true);
            const data =
                await getReturnReport();
            console.log(
                "RETURN REPORT:",
                data
            );
            setReport(data);
        } catch(error) {
            console.error(
                "LOAD RETURN REPORT ERROR:",
                error
            );
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        loadReport();
    }, []);
    function formatMoney(value) {
        if(value == null)
            return "0 VND";
        return Number(value)
                .toLocaleString("vi-VN")
            + " VND";

    }
    if(loading) {
        return (
            <div className="p-10 text-center">
                Đang tải báo cáo...
            </div>
        );
    }
    return (
        <main
            className="
                bg-gradient-to-br
                from-green-50
                to-white
                min-h-screen
            "
        >
            <section
                className="
                    bg-gradient-to-r
                    from-green-700
                    to-green-500
                    text-white
                    py-10
                "
            >
                <Container>
                    <h1
                        className="
                            text-3xl
                            font-bold
                        "
                    >
                        Báo cáo đổi trả
                    </h1>
                    <p
                        className="
                            text-green-100
                        "
                    >
                        Thống kê ảnh hưởng tài chính từ các yêu cầu đổi trả.
                    </p>
                </Container>
            </section>
            <Container
                className="
                    py-10
                    grid
                    grid-cols-1
                    md:grid-cols-3
                    gap-5
                "
            >
                <ReportCard
                    title="Tổng yêu cầu"

                    value={
                        report?.totalRequests
                    }

                />
                <ReportCard
                    title="Đã hoàn thành"
                    value={
                        report?.completedReturns
                    }

                />
                <ReportCard
                    title="Tổng tiền hoàn khách"
                    value={
                        formatMoney(
                            report?.totalRefundAmount
                        )
                    }

                />
                <ReportCard
                    title="Khách trả thêm"
                    value={
                        formatMoney(
                            report?.totalAdditionalPayment
                        )
                    }
                />
                <ReportCard
                    title="Ảnh hưởng doanh thu"
                    value={
                        formatMoney(
                            report?.revenueImpact
                        )
                    }

                />
            </Container>
        </main>
    );
}

function ReportCard({
                        title,
                        value
                    }) {
    return (
        <div
            className="
                bg-white
                rounded-2xl
                shadow-sm
                border
                border-stone-100
                p-6
            "
        >
            <p
                className="
                    text-sm
                    text-stone-500
                "
            >
                {title}
            </p>
            <p
                className="
                    mt-2
                    text-2xl
                    font-bold
                    text-green-700
                "
            >
                {value}
            </p>
        </div>
    );
}