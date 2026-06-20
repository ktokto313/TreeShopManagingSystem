import { useState } from "react";
import { Button } from "../../../../components/ui/Button";
import { CgSpinner } from "react-icons/cg";
import { Select } from "../../../../components/ui/Select";
import { getSelectOption } from "../../data/ticketSelectList";
import { Modal } from "../../../../components/ui/Modal";
import { IoWarningOutline } from "react-icons/io5";


const TicketDetailStatusWrapper = ({ detailState }) => {
	const {
		handleStatusChange,
		isStatusChangeLoading,
		updateTicketError,
		isAgent,
		isCreator,
		isResolved,
		ticket,
		isCommentSubmitLoading,
	} = detailState;

	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [pendingStatus, setPendingStatus] = useState(null);

	return (
		<div className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-border">
			{isCreator && isResolved && (
				<>
					<p className="font-semibold text-black mr-auto">
						Bạn có đồng ý với cách giải quyết này không?
					</p>
					<Button
						className="bg-bg-success text-white hover:bg-emerald-600"
						onClick={() => {
							handleStatusChange("DONE");
							console.log(ticket);
						}}
						disabled={isStatusChangeLoading || isCommentSubmitLoading}
					>
						<span className="flex gap-4 items-center">
							{isStatusChangeLoading && <CgSpinner className="animate-spin" />}
							Chấp nhận
						</span>
					</Button>
					<Button
						className="bg-red-500 text-white hover:bg-red-600"
						onClick={() => handleStatusChange("PROCESSING")}
						disabled={isStatusChangeLoading || isCommentSubmitLoading}
					>
						<span className="flex gap-4 items-center">
							{isStatusChangeLoading && <CgSpinner className="animate-spin" />}
							Từ chối
						</span>
					</Button>
				</>
			)}

			{isAgent && (
				<div className="flex gap-4 items-center w-full">
					<p className="font-semibold text-black mr-auto">
						Thay đổi trạng thái:
					</p>
					<div className="flex gap-2 items-center">
						{isStatusChangeLoading && (
							<CgSpinner className="animate-spin text-xl text-green-600" />
						)}
						<Select
							className="w-48"
							value={ticket.ticketState}
							options={getSelectOption("status").filter(o => o.value != "")}
							onChange={(e) => {
								setPendingStatus(e.target.value);

								if (!ticket.assignee) {
									setIsConfirmOpen(true);
								} else {
									handleStatusChange(pendingStatus);
								}
							}}
						/>
					</div>
				</div>
			)}

			<Modal
				onClose={() => setIsConfirmOpen(false)}
				title="Lưu ý"
				isOpen={isConfirmOpen}
			>
				<h1 className="mb-4 -mt-7">
					Thay đổi trạng thái sẽ cho bạn thành người xử lí cho Ticket này, bạn
					có chắc chắn không?
				</h1>
				<div className="flex gap-4">
					<Button
						className="bg-green-500 hover:bg-green-600 text-white"
						onClick={() => {
							if (pendingStatus) {
								handleStatusChange(pendingStatus);
							}
							setIsConfirmOpen(false);
							setPendingStatus(null);
						}}
					>
						Có
					</Button>

					<Button
						className="bg-red-500 hover:bg-red-600 text-white"
						onClick={() => {
							setIsConfirmOpen(false);
							setPendingStatus(null);
						}}
					>
						Không
					</Button>
				</div>
			</Modal>

			{updateTicketError && (
				<div className="bg-bg-error text-white p-3 gap-2 rounded-2xl flex items-center">
					<IoWarningOutline className="text-2xl" />
					<p>{updateTicketError}</p>
				</div>
			)}
		</div>
	);
};

export default TicketDetailStatusWrapper;
