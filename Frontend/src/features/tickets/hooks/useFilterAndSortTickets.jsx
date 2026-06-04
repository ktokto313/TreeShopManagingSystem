import { useState } from "react";

const useFilterAndSortTickets = () => {
	const [ticketState, setTicketState] = useState("");
	const [ticketPriority, setTicketPriority] = useState("");
	const [ticketSort, setTicketSort] = useState("");

	const handleFilterChange = (ticketParam, value) => {
		if (ticketParam === "status") setTicketState(value);
		if (ticketParam === "priority") setTicketPriority(value);
		if (ticketParam === "sort") setTicketSort(value);
	};

	const getFilterValue = (ticketParam) => {
		if (ticketParam === "status") return ticketState;
		if (ticketParam === "priority") return ticketPriority;
		if (ticketParam === "sort") return ticketSort;
		return "";
	};

	return { ticketState, ticketPriority, ticketSort, handleFilterChange, getFilterValue }
};

export default useFilterAndSortTickets;
