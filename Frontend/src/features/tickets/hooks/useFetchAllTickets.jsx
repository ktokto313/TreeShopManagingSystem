import { useCallback, useState } from "react";
import { fetchAllTickets } from "../data/ticketApi.js";

const useFetchAllTickets = (initialTickets = []) => {
	const [fetchedTickets, setFetchedTickets] = useState(initialTickets);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

	const executeFetchAllTickets = useCallback(async (ticketFilter, ticketPiority, ticketSort) => {
        setIsLoading(true);
        setError(null)

        try{
            const data = await fetchAllTickets(ticketFilter, ticketPiority, ticketSort);
            setFetchedTickets(data);
        } catch(error){
            setError(error);
        } finally{
            setIsLoading(false);
        }
	}, []);

	return { isLoading, error, fetchedTickets, executeFetchAllTickets };
};

export default useFetchAllTickets;
