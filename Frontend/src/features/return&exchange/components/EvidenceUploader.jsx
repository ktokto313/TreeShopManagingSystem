import { forwardRef, useImperativeHandle, useRef } from "react";
const EvidenceUploader = forwardRef(function EvidenceUploader(
    { value = [], onChange },
    ref
) {
    const fileInputRef = useRef(null);
    const pendingFilesRef = useRef(new Map());

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        const blobUrl = URL.createObjectURL(file);
        pendingFilesRef.current.set(blobUrl, file);

        onChange([...value, blobUrl]);
        e.target.value = "";
    }

    function removeImage(index) {
        const url = value[index];

        if (pendingFilesRef.current.has(url)) {
            URL.revokeObjectURL(url);
            pendingFilesRef.current.delete(url);
        }

        onChange(value.filter((_, i) => i !== index));
    }

    useImperativeHandle(ref, () => ({
        async uploadPending() {
            const finalUrls = [];

            for (const url of value) {
                if (!url.startsWith("blob:") || !pendingFilesRef.current.has(url)) {
                    finalUrls.push(url);
                    continue;
                }

                const file = pendingFilesRef.current.get(url);
                const formData = new FormData();
                formData.append("file", file);

                const res = await fetch("/api/blogs/images/upload", {
                    method: "POST",
                    credentials: "include",
                    body: formData
                });

                if (!res.ok) {
                    throw new Error("Upload ảnh bằng chứng thất bại.");
                }

                const data = await res.json();
                finalUrls.push(data.url);

                URL.revokeObjectURL(url);
                pendingFilesRef.current.delete(url);
            }

            onChange(finalUrls);
            return finalUrls;
        },

        revokeAll() {
            for (const url of pendingFilesRef.current.keys()) {
                URL.revokeObjectURL(url);
            }
            pendingFilesRef.current.clear();
        }
    }));

    return (
        <div className="space-y-3">

            <label className="block text-sm font-medium text-green-800">
                Hình ảnh bằng chứng
            </label>

            <label
                className="
                    cursor-pointer inline-flex items-center justify-center
                    px-4 py-2 text-sm font-medium rounded-lg
                    bg-green-500 hover:bg-green-600 text-white
                "
            >
                Thêm ảnh
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </label>

            {value.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

                    {value.map((image, index) => (
                        <div
                            key={image}
                            className="
                                bg-white
                                border
                                border-stone-200
                                rounded-xl
                                p-2
                            "
                        >

                            <img
                                src={image}
                                alt={`evidence-${index}`}
                                className="
                                    w-full
                                    h-32
                                    object-cover
                                    rounded-lg
                                "
                            />

                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="
                                    mt-2
                                    text-sm
                                    text-red-500
                                    hover:text-red-700
                                "
                            >
                                Xóa
                            </button>

                        </div>
                    ))}

                </div>
            )}

            <p className="text-sm text-stone-500">
                Lý do hư hỏng cần tối thiểu 2 hình ảnh.
            </p>

        </div>
    );
});

export default EvidenceUploader;