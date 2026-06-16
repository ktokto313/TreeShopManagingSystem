import { useCallback, useState } from "react";

const FILTER_KEYS = {
	status: "ticketState",
	state: "ticketState",
	priority: "ticketPriority",
	sort: "ticketSort",
};

export default function useFilterAndSortTickets(executeFetchAllTickets) {
	const [ticketState, setTicketState] = useState("");
	const [ticketPriority, setTicketPriority] = useState("");
	const [ticketSort, setTicketSort] = useState("");
	const [isSelectAutoFilterSort, setIsSelectAutoFilterSort] = useState(true);

	const getFilterValue = useCallback(
		(param) => {
			switch (FILTER_KEYS[param] ?? param) {
				case "ticketState":
					return ticketState;
				case "ticketPriority":
					return ticketPriority;
				case "ticketSort":
					return ticketSort;
				default:
					return "";
			}
		},
		[ticketPriority, ticketSort, ticketState],
	);

	const handleFilterChange = useCallback(
		(param, value) => {
			const filterKey = FILTER_KEYS[param] ?? param;
			let nextState = ticketState;
			let nextPriority = ticketPriority;
			let nextSort = ticketSort;

			if (filterKey === "ticketState") {
				nextState = value;
				setTicketState(value);
			}

			if (filterKey === "ticketPriority") {
				nextPriority = value;
				setTicketPriority(value);
			}

			if (filterKey === "ticketSort") {
				nextSort = value;
				setTicketSort(value);
			}

			if (isSelectAutoFilterSort && executeFetchAllTickets) {
				executeFetchAllTickets(nextState, nextPriority, nextSort);
			}
		},
		[
			executeFetchAllTickets,
			isSelectAutoFilterSort,
			ticketPriority,
			ticketSort,
			ticketState,
		],
	);

	return {
		ticketState,
		ticketPriority,
		ticketSort,
		isSelectAutoFilterSort,
		setIsSelectAutoFilterSort,
		getFilterValue,
		handleFilterChange,
	};
}
