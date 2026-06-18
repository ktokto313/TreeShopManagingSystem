import { useState } from "react";
import { createTicket } from "../data/ticketApi";

const useCreateTicket = () => {
    const [isCreateTicketLoading, setIsCreateTicketLoading] = useState(false);
    const [ticketCreateError, setTicketCreateError] = useState(null);
    const [ticketCreateWarning, setTicketCreateWarning] = useState(null);
    const [localValidationError, setLocalValidationError] = useState("");
    const [isCreateTicketSuccess, setIsCreateTicketSuccess] = useState(false);

    const executeCreateTicket = async (data) => {
        if (isCreateTicketLoading) {
            setTicketCreateWarning(
                "Có một Ticket đang được khởi tạo. Xin vui lòng đợi.",
            );
            return false; 
        }

        setIsCreateTicketLoading(true);
        setTicketCreateError(null);

        try {
            await createTicket(data);
            setIsCreateTicketSuccess(true);
            setLocalValidationError("");
            return true;
        } catch (error) {
            setTicketCreateError(error);
            return false; 
        } finally {
            setIsCreateTicketLoading(false);
        }
    };

    const handleCreateTicketSubmit = async (e) => { 
        setLocalValidationError("");
        setIsCreateTicketSuccess(false);

		e.preventDefault();
    
        
        const formData = new FormData(e.currentTarget);

        const title = formData.get("title");
        const detail = formData.get("detail");
        const priority = formData.get("priority");

        if (!title || title.trim() === "") {
            setLocalValidationError("Tiêu đề không được để trống!");
            return false;
        }

        if (detail.length < 20) {
            setLocalValidationError("Chi tiết phải có ít nhất 20 ký tự!");
            return false; 
        }

        if (priority === "") {
            setLocalValidationError("Phải chọn mức ưu tiên!");
            return false; 
        }

        return await executeCreateTicket({
            title,
            detail,
            priority,
        });
    };

    return {
        ticketCreateWarning,
        isCreateTicketLoading,
        isCreateTicketSuccess,
        localValidationError,
        ticketCreateError,
        setTicketCreateError,
        setLocalValidationError,
        handleCreateTicketSubmit,
        executeCreateTicket,
    };
};

export default useCreateTicket;
