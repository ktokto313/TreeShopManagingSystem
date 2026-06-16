import { useNavigate, useParams } from "react-router-dom";
import { cn } from "../../../utils/cn";
import { useTicketDetail } from "../hooks/useTicketDetail";

import { Container } from "../../../components/global/Container";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { Input } from "../../../components/ui/Input";
import ModalButton from "../../../components/ui/ModalButton";
import { Form } from "../../../components/ui/Form";

import { CgSpinner } from "react-icons/cg";
import { IoWarningOutline } from "react-icons/io5";
import { MdOutlineDangerous } from "react-icons/md";
import sadPlant from "../assets/images/sadPlant.gif";
import { getSelectOption } from "../data/ticketSelectList";
import { timeFormat } from "../../../utils/timeFormat";
import {
	getTicketStatusStyles,
	translateTicketPriority,
	translateTicketStatus,
} from "../utils/ticketUtils";
import { Modal } from "../../../components/ui/Modal";
import { useState } from "react";

const TicketDetail = () => {
	const { id: ticketId } = useParams();
	const navigate = useNavigate();

	const detailState = useTicketDetail(ticketId);

	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [pendingStatus, setPendingStatus] = useState(null);

	const {
		ticket,
		comments,
		newCommentDetail,
		setNewCommentDetail,
		isFetchDetailError,
		isFetchDetailLoading,
		isStatusChangeLoading,
		isCommentSubmitLoading,
		commentTicketError,
		updateTicketError,
		handleStatusChange,
		handleCommentSubmit,
		user,
		isAgent,
	} = detailState;

	if (isFetchDetailLoading)
		return (
			<Container className="flex items-center justify-content-center h-screen">
				<h1 className="flex gap-4 items-center text-3xl mx-auto w-max text-green-600">
					<CgSpinner className="animate-spin" /> Đang tải...
				</h1>
			</Container>
		);

	if (!ticket)
		return (
			<Container className="mt-10 font-semibold text-5xl">
				<h1
					className="border-5 text-2xl py-5 px-8 mx-auto rounded-full max-w-80 min-w-50 text-red-500 border-red-300"
					style={{ boxShadow: "15px 15px 0 5px" }}
				>
					{isFetchDetailError ? (
						<span>Không tìm thấy Ticket!</span>
					) : (
						<span>Lỗi Khi Tải Ticket</span>
					)}
				</h1>
				<div
					className="bg-bg-surface min-w-50 max-w-90 flex items-center mx-auto mt-20 justify-center rounded-full aspect-square w-[20%] p-5 text-green-500"
					style={{ boxShadow: "15px 15px 0 5px" }}
				>
					<img
						className="object-cover aspect-square w-[80%]"
						src={sadPlant}
						alt="Sad plant"
					/>
				</div>
				<Button
					onClick={() => navigate("/tickets/dashboard")}
					className="w-fit mb-4 hover:bg-green-400 text-2xl mx-auto block mt-20 pr-8"
				>
					<h2>← Quay Lại</h2>
				</Button>
			</Container>
		);

	const isCreator = user?.email === ticket.ticketCreator?.email;
	const isResolved = ticket.ticketState?.toLowerCase() === "resolved";

	return (
		<Container className="max-w-4xl mx-auto mt-10 p-5 flex flex-col gap-6">
			<Button
				onClick={() => navigate("/tickets/dashboard")}
				className="w-fit mb-1 py-2 hover:bg-green-400 pr-6 text-xl"
			>
				← Quay Lại
			</Button>

			<div className="border-2 border-green-300 rounded-2xl p-6 bg-gray-100 shadow-sm">
				<div className="flex justify-between items-start mb-4">
					<div>
						<p className="text-gray-500 text-sm font-bold uppercase mb-1">
							Ticket #{ticket.id}
						</p>
						<h1 className="text-2xl font-bold text-black">{ticket.title}</h1>
					</div>
					<span
						className={cn(
							`py-2 px-4 rounded-xl ${getTicketStatusStyles(ticket.ticketState)}`,
						)}
					>
						{translateTicketStatus(ticket.ticketState)}
					</span>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6 border-y border-border py-4">
					<div>
						<p className="text-gray-500">Người tạo</p>
						<p className="font-semibold">{ticket.ticketCreator?.fullName}</p>
					</div>
					<div>
						<p className="text-gray-500">Mức ưu tiên</p>
						<p className="font-semibold">
							{translateTicketPriority(ticket.priority)}
						</p>
					</div>
					<div>
						<p className="text-gray-500">Ngày tạo</p>
						<p className="font-semibold">{timeFormat(ticket.timeCreated)}</p>
					</div>
					<div>
						<p className="text-gray-500">Người xử lý</p>
						<p className="font-semibold">
							{ticket.assignee ? ticket.assignee.fullName : "Chưa có"}
						</p>
					</div>
				</div>

				<div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
					{ticket.detail}
				</div>
			</div>

			<div className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-border">
				{isCreator && isResolved && (
					<>
						<p className="font-semibold text-black mr-auto">
							Bạn có đồng ý với cách giải quyết này không?
						</p>
						<Button
							className="bg-bg-success text-white hover:bg-emerald-600"
							onClick={() => handleStatusChange("DONE")}
							disabled={isStatusChangeLoading || isCommentSubmitLoading}
						>
							<span className="flex gap-4 items-center">
								{isStatusChangeLoading && (
									<CgSpinner className="animate-spin" />
								)}
								Chấp nhận
							</span>
						</Button>
						<Button
							className="bg-red-500 text-white hover:bg-red-600"
							onClick={() => handleStatusChange("PROCESSING")}
							disabled={isStatusChangeLoading || isCommentSubmitLoading}
						>
							<span className="flex gap-4 items-center">
								{isStatusChangeLoading && (
									<CgSpinner className="animate-spin" />
								)}
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
								options={getSelectOption("status")}
								onChange={(e) => {
									setPendingStatus(e.target.value);
									setIsConfirmOpen(true);
								}}
							/>
						</div>
					</div>
				)}

				<Modal title="Lưu ý" isOpen={isConfirmOpen}>
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
										disabled={
											!newCommentDetail.trim() || isCommentSubmitLoading
										}
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
		</Container>
	);
};

export default TicketDetail;
