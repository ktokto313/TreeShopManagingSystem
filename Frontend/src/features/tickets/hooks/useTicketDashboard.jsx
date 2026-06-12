import { useContext, useEffect } from "react";
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
		isFetchAllTicketsLoading,
		fetchedTickets,
		executeFetchAllTickets,
	} = useFetchAllTickets();

	const {
		ticketState,
		ticketPriority,
		ticketSort,
		isSelectAutoFilterSort,
		setIsSelectAutoFilterSort,
		getFilterValue,
		handleFilterChange,
	} = useFilterAndSortTickets(executeFetchAllTickets);

	const {
		ticketCreateError,
		setTicketCreateError,
		setLocalValidationError,
		localValidationError,
		isCreateTicketLoading,
		isCreateTicketSuccess,
		handleCreateTicketSubmit,
	} = useCreateTicket();

	useEffect(() => {
		executeFetchAllTickets();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); 

	return {
		// UI State
		isFetchAllTicketsLoading,
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
		isSelectAutoFilterSort,
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
