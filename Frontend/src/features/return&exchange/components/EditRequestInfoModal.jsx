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

    const [evidenceImages, setEvidenceImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const evidenceUploaderRef = useRef(null);
    const isEditable =
        request?.status === "WAITING_CUSTOMER_INFO";



    function handleClose() {
        evidenceUploaderRef.current?.revokeAll();
        onClose?.();
    }

    async function handleSubmit() {

        if (!isEditable) {

            setError(
                "Chỉ có thể bổ sung thông tin khi Manager yêu cầu"
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
                "Đã gửi bổ sung thông tin"
            );


            onSuccess?.();

        } catch(err) {


            setError(
                err?.message
                ||
                "Không thể cập nhật thông tin"
            );


        } finally {
            setSubmitting(false);
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
                w-[500px]
                space-y-4
            ">


                <h2 className="
                    text-lg font-semibold
                ">
                    Bổ sung thông tin yêu cầu #{request?.id}
                </h2>



                <textarea
                    value={note}

                    onChange={
                        e => setNote(e.target.value)
                    }

                    disabled={!isEditable}

                    placeholder="
                        Nhập thông tin bổ sung
                    "

                    className="
                        w-full border
                        p-2 rounded
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
                    error &&
                    <p className="
                        text-red-500
                    ">
                        {error}
                    </p>
                }


                <div className="
                    flex gap-3
                ">


                    <button
                        onClick={handleSubmit}

                        disabled={
                            submitting
                            ||
                            !isEditable
                        }

                        className="
                            px-4 py-2
                            bg-green-500
                            text-white
                            rounded
                        "
                    >
                        {
                            submitting
                                ?
                                "Đang gửi..."
                                :
                                "Gửi bổ sung"
                        }

                    </button>

                    <button

                        onClick={handleClose}

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