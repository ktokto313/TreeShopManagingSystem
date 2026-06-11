import { useState, useRef, useEffect } from 'react';

const FILTER_TO_STATUSES = {
    ALL: [],
    PENDING: ['PENDING'],
    PROCESSING: ['PROCESSING'],
    DELIVERING: ['DELIVERING'],
    COMPLETED: ['RECEIVED', 'ARRIVED'],
    FAILED: ['FAILED', 'RETURN_PENDING', 'RETURNING'],
};

const DEBOUNCE_MS = 400;

export default function useFetchAllOrders() {
    const [orders, setOrders] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const debounceTimerRef = useRef(null);

    const fetchOrders = async () => {
        const activeFilter = selectedFilter;
        const activeQuery = searchQuery;
        const statuses = FILTER_TO_STATUSES[activeFilter] || [];

        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            statuses.forEach((s) => params.append('statusList', s));
            if (activeQuery.trim()) {
                params.append('query', activeQuery.trim());
            }

            const queryString = params.toString();
            const url = queryString ? `/api/orders?${queryString}` : '/api/orders';

            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include"
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error("UNAUTHORIZED");
                }
                throw new Error(`Failed to fetch orders (Status: ${response.status})`);
            }

            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
};

    const changeFilter = (newFilter) => {
        setSelectedFilter(newFilter);
        fetchOrders();
    }

    const changeSearchQuery = (newQuery) => {
        setSearchQuery(newQuery);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            fetchOrders();
        }, DEBOUNCE_MS);
    };

    // Cleanup debounce timer on unmount
    useEffect(() => {
        
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    return {
        orders,
        isLoading,
        error,
        selectedFilter,
        setSelectedFilter: changeFilter,
        searchQuery,
        setSearchQuery: changeSearchQuery,
        fetchOrders,
    };
}