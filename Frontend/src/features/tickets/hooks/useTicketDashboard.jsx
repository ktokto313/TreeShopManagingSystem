import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import useFetchAllTickets from "./useFetchAllTickets";
import useFilterAndSortTickets from "./useFilterAndSortTickets";
import useCreateTicket from "./useCreateTicket";

export const useTicketDashboard = () => {
	const navigate = useNavigate();
	const { user, executeAuth } = useContext(AuthContext);
	const isAgent = user?.role?.toLowerCase() === "support_agent";

	const {
		fetchAllTicketsError,
		isLoading,
		fetchedTickets,
		executeFetchAllTickets,
	} = useFetchAllTickets();
	const {
		ticketState,
		ticketPriority,
		ticketSort,
		getFilterValue,
		handleFilterChange,
	} = useFilterAndSortTickets();
	const {
		ticketCreateError,
		setTicketCreateError,
		setLocalValidationError,
		localValidationError,
		isCreateTicketLoading,
		isCreateTicketSuccess,
		handleCreateTicketSubmit,
	} = useCreateTicket();

	const [isSelectAutoFilterSort, setIsSelectAutoFilterSort] = useState(true);

	useEffect(() => {
		if (isSelectAutoFilterSort) {
			executeFetchAllTickets(ticketState, ticketPriority, ticketSort);
		}
		// Must not put executeFetchAllTickets inside of the dependencies to avoid infinite looping
		
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ticketState, ticketPriority, ticketSort, isSelectAutoFilterSort]);

	return {
		// UI State
		isLoading,
		fetchedTickets,
		user,
		isAgent,

		// Actions
		executeAuth,
		navigate,
		executeFetchAllTickets,

		// Filter & Sort
		ticketState,
		ticketPriority,
		ticketSort,
		getFilterValue,
		handleFilterChange,
		setIsSelectAutoFilterSort,

		// Creation
		isCreateTicketLoading,
		isCreateTicketSuccess,
		handleCreateTicketSubmit,
		setTicketCreateError,
		setLocalValidationError,

		// Errors
		fetchAllTicketsError,
		ticketCreateError,
		localValidationError,
	};
};
