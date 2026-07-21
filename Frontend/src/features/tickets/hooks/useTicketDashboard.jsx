import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import useFetchAllTickets from "./useFetchAllTickets";
import useFilterAndSortTickets from "./useFilterAndSortTickets";
import useCreateTicket from "./useCreateTicket";

export const useTicketDashboard = () => {
	const navigate = useNavigate();
	const { user } = useContext(AuthContext);
	const isAgent = user?.roleName?.toLowerCase() === "support_agent";

	const [currentPage, setCurrentPage] = useState(0);

	const {
		fetchAllTicketsError,
		isFetchAllTicketsLoading,
		fetchedTickets,
		totalPages,
		totalElements,
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
	} = useFilterAndSortTickets(executeFetchAllTickets, setCurrentPage);

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
		executeFetchAllTickets(ticketState, ticketPriority, ticketSort, currentPage);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage]);

	return {
		// UI State
		isFetchAllTicketsLoading,
		fetchedTickets,
		totalPages,
		totalElements,
		currentPage,
		setCurrentPage,
		user,
		isAgent,

		// Actions
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
