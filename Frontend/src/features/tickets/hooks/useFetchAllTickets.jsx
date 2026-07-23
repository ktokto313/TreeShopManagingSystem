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
		async (search, ticketFilter, ticketPiority, ticketSort, page = 0) => {
			setIsFetchAllTicketsLoading(true);
			setFetchAllTicketsError(null);

			try {
				const data = await fetchAllTickets(
					search,
					ticketFilter,
					ticketPiority,
					ticketSort,
					page
				);
				const content = data.content || (Array.isArray(data) ? data : []);
				const totalPagesCount = data.totalPages ?? data.page?.totalPages ?? 1;
				const totalElementsCount = data.totalElements ?? data.page?.totalElements ?? content.length;

				setFetchedTickets(content);
				setTotalPages(totalPagesCount);
				setTotalElements(totalElementsCount);
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
