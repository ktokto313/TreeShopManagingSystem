import { useState } from "react";
import { createTicket } from "../data/createTicket";

const useCreateTicket = () => {
	const [isCreateTicketLoading, setIsCreateTicketLoading] = useState(false);
	const [ticketCreateError, setTicketCreateError] = useState(null);
	const [ticketCreateWarning, setTicketCreateWarning] = useState(null);
	const [localValidation, setLocalValidationError] = useState("");
	const [isCreateTicketSuccess, setIsCreateTicketSuccess] = useState(false);

	const executeCreateTickets = async (data) => {
		if (isCreateTicketLoading) {
			setTicketCreateWarning(
				"Có một Ticket đang được khởi tạo. Xin vui lòng đợi.",
			);
			return;
		}

		setIsCreateTicketLoading(true);
		setTicketCreateError(null);

		try {
			await createTicket(data);
			setIsCreateTicketSuccess(true);
			setLocalValidationError("");
		} catch (error) {
			setTicketCreateError(error);
		} finally {
			setIsCreateTicketLoading(false);
		}
	};

	const handleCreateTicketSubmit = (e) => {
        setLocalValidationError("");
        setIsCreateTicketSuccess(false);
        
		e.preventDefault();

		const formData = new FormData(e.currentTarget);

		const title = formData.get("title");
		const detail = formData.get("detail");
		const priority = formData.get("priority");

		if (!title || title.trim() === "") {
			setLocalValidationError("Tiêu đề không được để trống!");
			return; // Stops the function from continuing
		}

		if (detail.length < 20) {
			setLocalValidationError("Chi tiết phải có ít nhất 20 ký tự!");
			return;
		}

		if (priority === "") {
			setLocalValidationError("Phải chọn mức ưu tiên!");
			return;
		}

		executeCreateTickets({
			title,
			detail,
			priority,
		});
	};

	return {
		ticketCreateWarning,
		isCreateTicketLoading,
		isCreateTicketSuccess,
		localValidation,
		ticketCreateError,
		handleCreateTicketSubmit,
		executeCreateTickets,
	};
};

export default useCreateTicket;
