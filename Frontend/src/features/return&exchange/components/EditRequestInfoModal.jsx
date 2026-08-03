import { useRef, useState } from "react";
import EvidenceUploader from "./EvidenceUploader";
import { updateRequestInfo } from "../api/returnRequestApi";


export default function EditRequestInfoModal({
                                                 request,
                                                 onClose,
                                                 onSuccess
                                             }) {

    const [note, setNote] = useState(
        request?.managerNote ?? ""
    );

    const [evidenceImages, setEvidenceImages] = useState(
        request?.evidences?.map(
            e => e.imageUrl
        ) ?? []
    );

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const evidenceUploaderRef = useRef(null);
    const isEditable =
        request?.status === "PENDING" ||
        request?.status === "WAITING_CUSTOMER_INFO";


    function handleClose() {
        evidenceUploaderRef.current?.revokeAll();
        onClose?.();
    }

    async function handleSubmit() {

        if (!isEditable) {

            setError(
                "Yêu cầu đã được duyệt nên không thể chỉnh sửa"
            );

            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const additionalImageUrls =
                await evidenceUploaderRef.current
                    ?.uploadPending()
                ||
                [];


            await updateRequestInfo(
                request.id,
                {
                    note,
                    additionalImageUrls
                }
            );

            alert(
                "Đã cập nhật yêu cầu"
            );

            onSuccess?.();

        } catch(err) {
            setError(
                err?.message
                ||
                "Không thể cập nhật yêu cầu"
            );

        } finally {
            setSubmitting(false);
        }
    }

    const isWaitingInfo =
        request?.status === "WAITING_CUSTOMER_INFO";

    return (

        <div className="
            fixed inset-0
            bg-black/40
            flex items-center justify-center
            z-50
        ">


            <div className="
                bg-white
                p-6
                rounded-xl
                w-[500px]
                space-y-4
            ">


                <h2 className="
                    text-lg
                    font-semibold
                ">

                    {
                        isWaitingInfo
                            ?
                            "Bổ sung thông tin yêu cầu"
                            :
                            "Chỉnh sửa yêu cầu"
                    }

                    {" "}
                    #{request?.id}

                </h2>

                {
                    isWaitingInfo && (

                        <p className="
                            text-sm
                            text-blue-600
                        ">
                            Manager yêu cầu bổ sung thêm thông tin.
                        </p>

                    )
                }
                {
                    request?.status === "PENDING" && (

                        <p className="
                            text-sm
                            text-green-600
                        ">
                            Bạn có thể chỉnh sửa yêu cầu trước khi Manager duyệt.
                        </p>

                    )
                }

                <textarea
                    value={note}

                    onChange={
                        e =>
                            setNote(
                                e.target.value
                            )
                    }

                    disabled={!isEditable}

                    placeholder="
                        Nhập ghi chú hoặc thông tin bổ sung
                    "
                    className="
                        w-full
                        border
                        p-2
                        rounded
                    "

                    rows={4}

                />

                <EvidenceUploader
                    ref={evidenceUploaderRef}
                    value={evidenceImages}
                    onChange={setEvidenceImages}
                    disabled={!isEditable}
                />

                {
                    error && (

                        <p className="
                            text-red-500
                            text-sm
                        ">
                            {error}
                        </p>
                    )
                }
                <div className="
                    flex
                    gap-3
                    justify-end
                ">

                    <button
                        onClick={handleSubmit}

                        disabled={
                            submitting
                            ||
                            !isEditable
                        }

                        className="
                            px-4
                            py-2
                            bg-green-500
                            text-white
                            rounded
                            disabled:opacity-50
                        "
                    >
                        {
                            submitting
                                ?
                                "Đang lưu..."
                                :
                                isWaitingInfo
                                    ?
                                    "Gửi bổ sung"
                                    :
                                    "Lưu thay đổi"
                        }
                    </button>
                    <button

                        onClick={handleClose}

                        className="
                            border
                            px-4
                            py-2
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