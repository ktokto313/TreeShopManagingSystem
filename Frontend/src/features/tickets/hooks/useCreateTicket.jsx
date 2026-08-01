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
                "Có một phiếu hỗ trợ đang được tạo. Xin vui lòng đợi.",
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
