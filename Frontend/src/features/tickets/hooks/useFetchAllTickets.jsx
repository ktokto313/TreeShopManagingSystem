import { useState } from "react";
import { fetchAllTickets } from "../data/ticketApi.js";

const useFetchAllTickets = (initialTickets = []) => {
	const [fetchedTickets, setFetchedTickets] = useState(initialTickets);
	const [isLoading, setIsLoading] = useState(false);
	const [fetchAllTicketsError, setFetchAllTicketsError] = useState(null);

	const executeFetchAllTickets = async (
		ticketFilter,
		ticketPiority,
		ticketSort,
	) => {
		setIsLoading(true);
		setFetchAllTicketsError(null);

		try {
			const data = await fetchAllTickets(
				ticketFilter,
				ticketPiority,
				ticketSort,
			);
			setFetchedTickets(data);
		} catch {
			const errorMessage = "Đã xảy ra lỗi khi tải dữ liệu."; // Hardcoded message

			setFetchAllTicketsError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return {
		isLoading,
		fetchAllTicketsError,
		fetchedTickets,
		executeFetchAllTickets,
	};
};

export default useFetchAllTickets;
