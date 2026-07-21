import { useState } from "react";

const useFilterAndSortTickets = (executeFetchAllTickets, setCurrentPage) => {
	const [ticketState, setTicketState] = useState("");
	const [ticketPriority, setTicketPriority] = useState("");
	const [ticketSort, setTicketSort] = useState("");

	const [isSelectAutoFilterSort, setIsSelectAutoFilterSort] = useState(true);

	const handleFilterChange = (ticketParam, value) => {
		if (ticketParam === "status") setTicketState(value);
		if (ticketParam === "priority") setTicketPriority(value);
		if (ticketParam === "sort") setTicketSort(value);

		if (setCurrentPage) {
			setCurrentPage(0);
		}

		if(isSelectAutoFilterSort){
			executeFetchAllTickets(
				ticketParam === "status" ? value : ticketState,
				ticketParam === "priority" ? value : ticketPriority,
				ticketParam === "sort" ? value : ticketSort,
				0
			);
		}
	};

	const getFilterValue = (ticketParam) => {
		if (ticketParam === "status") return ticketState;
		if (ticketParam === "priority") return ticketPriority;
		if (ticketParam === "sort") return ticketSort;
		return "";
	};

	return {
		ticketState,
		ticketPriority,
		ticketSort,
		isSelectAutoFilterSort,
		handleFilterChange,
		getFilterValue,
		setIsSelectAutoFilterSort
	};
};

export default useFilterAndSortTickets;
