import ModalButton from "../../../components/ui/ModalButton";
import ReviewSection from "./ReviewSection";

export default function ReviewModal({orderId, productId, hasReviewed, onReviewSubmitted}) {
    if (hasReviewed) {
        return <span className="text-sm font-semibold text-gray-500 italic mt-1">Đã đánh giá</span>;
    }

    return (
        <ModalButton
            buttonLabel="Đánh giá"
            buttonClasses="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs mt-1"
            modalTitle="Đánh giá sản phẩm"
            modalClasses="max-w-2xl w-full"
        >
            <div className="p-4 max-h-[70vh] overflow-y-auto">
                <ReviewSection productId={productId} orderId={orderId} onReviewSubmitted={onReviewSubmitted}/>
            </div>
        </ModalButton>
    );
}
