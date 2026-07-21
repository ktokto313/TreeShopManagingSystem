import { useCallback, useState } from "react";
import { fetchAllTickets } from "../data/ticketApi.js";

const useFetchAllTickets = (initialTickets = []) => {
	const [fetchedTickets, setFetchedTickets] = useState(initialTickets);
	const [totalPages, setTotalPages] = useState(1);
	const [totalElements, setTotalElements] = useState(0);
	const [isFetchAllTicketsLoading, setIsFetchAllTicketsLoading] =
		useState(false);
	const [fetchAllTicketsError, setFetchAllTicketsError] = useState(null);

	const executeFetchAllTickets = useCallback(
		async (ticketFilter, ticketPiority, ticketSort, page = 0) => {
			setIsFetchAllTicketsLoading(true);
			setFetchAllTicketsError(null);

			try {
				const data = await fetchAllTickets(
					ticketFilter,
					ticketPiority,
					ticketSort,
					page
				);
				setFetchedTickets(data.content || []);
				setTotalPages(data.totalPages || 1);
				setTotalElements(data.totalElements || 0);
			} catch {
				const errorMessage = "Đã xảy ra lỗi khi tải dữ liệu."; // Hardcoded message

				setFetchAllTicketsError(errorMessage);
			} finally {
				setIsFetchAllTicketsLoading(false);
			}
		}, 
		[],
	);

	return {
		isFetchAllTicketsLoading,
		fetchAllTicketsError,
		fetchedTickets,
		totalPages,
		totalElements,
		executeFetchAllTickets,
	};
};

export default useFetchAllTickets;
