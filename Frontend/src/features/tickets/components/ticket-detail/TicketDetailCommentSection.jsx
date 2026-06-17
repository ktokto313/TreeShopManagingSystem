import { CgSpinner } from "react-icons/cg";
import { Form } from "../../../../components/ui/Form";
import { Input } from "../../../../components/ui/Input";
import ModalButton from "../../../../components/ui/ModalButton";
import { timeFormat } from "../../../../utils/timeFormat";
import { cn } from "../../../../utils/cn";
import { Button } from "../../../../components/ui/Button";
import { MdOutlineDangerous } from "react-icons/md";


const TicketDetailCommentSection = ({ detailState }) => {
	const {
		comments,
		newCommentDetail,
		setNewCommentDetail,
		isCommentSubmitLoading,
		commentTicketError,
		handleCommentSubmit,
	} = detailState;

	return (
		<div className="border-2 bg-white border-border rounded-2xl p-6 shadow-sm mt-4">
			<h2 className="text-xl font-bold mb-6">Bình luận</h2>

			<div className="flex flex-col gap-4 mb-8">
				{comments.length === 0 ? (
					<p className="text-gray-500 text-center italic">
						Chưa có bình luận nào.
					</p>
				) : (
					comments.map((comment) => (
						<div
							key={comment.id}
							className="p-4 bg-gray-50 rounded-2xl border-2 border-border"
						>
							<div className="flex justify-between items-center mb-2">
								<span className="font-bold text-sm">
									{comment.commentCreator?.fullName}
								</span>
								<span className="text-xs text-gray-500">
									{timeFormat(comment.timeCreated)}
								</span>
							</div>
							<p className="text-gray-800 text-sm whitespace-pre-wrap">
								{comment.detail}
							</p>
						</div>
					))
				)}
			</div>

			<Form className="flex gap-2 w-full flex-row items-end justify-content-center">
				<div className="flex-1">
					<Input
						type="text"
						label="Thêm bình luận..."
						value={newCommentDetail}
						className="h-full"
						onChange={(e) => setNewCommentDetail(e.target.value)}
					/>
				</div>
				<ModalButton
					buttonDisabled={!newCommentDetail.trim() || isCommentSubmitLoading}
					buttonLabel={
						isCommentSubmitLoading ? (
							<CgSpinner className="animate-spin text-lg" />
						) : (
							"Gửi"
						)
					}
					buttonClasses={cn("h-full h-10")}
					modalTitle="Lưu ý"
				>
					{({ close }) => (
						<>
							<h1 className="flex gap-1 -mt-5 ml-0.5 items-center">
								Bạn có chắc chắn muốn gửi bình luận?
							</h1>
							<div className="flex gap-2 mt-4">
								<Button
									disabled={!newCommentDetail.trim() || isCommentSubmitLoading}
									type="submit"
									onClick={(e) => handleCommentSubmit(e, close)}
								>
									<div className="flex gap-1 items-center">
										{isCommentSubmitLoading && (
											<CgSpinner className="animate-spin text-xl" />
										)}
										<p>Gửi</p>
									</div>
								</Button>
								<Button
									className="bg-red-500 hover:bg-red-400"
									onClick={() => close()}
								>
									<p>Huỷ</p>
								</Button>
							</div>
						</>
					)}
				</ModalButton>
			</Form>

			{commentTicketError && (
				<div className="flex items-center gap-1 p-3 mt-2 border font-light text-red-600 border-red-400 w-max">
					<MdOutlineDangerous className="text-xl" />
					{commentTicketError}
				</div>
			)}
		</div>
	);
};

export default TicketDetailCommentSection;
