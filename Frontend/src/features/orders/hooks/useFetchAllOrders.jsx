import { useState, useCallback } from "react";

const FILTER_TO_STATUSES = {
	ALL: [],
	PENDING: ["PENDING"],
	PROCESSING: ["PROCESSING"],
	DELIVERING: ["DELIVERING"],
	TORECEIVE: ["ARRIVED"],
	COMPLETED: ["RECEIVED"],
	FAILED: ["FAILED", "RETURN_PROCESSING", "RETURN_PENDING", "RETURNING"],
};

const ORDER_PER_PAGE = 9;

export default function useFetchAllOrders() {
	const [orders, setOrders] = useState([]);
	const [selectedFilter, setSelectedFilter] = useState("ALL");
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalElements, setTotalElements] = useState(0);

	const fetchOrders = useCallback(async () => {
		const activeFilter = selectedFilter;
		const activeQuery = searchQuery;
		const statuses = FILTER_TO_STATUSES[activeFilter] || [];

		setIsLoading(true);
		setError(null);
		try {
			const params = new URLSearchParams();
			statuses.forEach((s) => params.append("statusList", s));
			if (activeQuery.trim()) {
				params.append("query", activeQuery.trim());
			}
			// Spring Data JPA pagination is 0-indexed
			params.append("page", currentPage - 1);
			params.append("size", ORDER_PER_PAGE); // You can make this dynamic if needed

			const queryString = params.toString();
			const url = queryString ? `/api/orders?${queryString}` : "/api/orders";

			const response = await fetch(url, {
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			if (!response.ok) {
				if (response.status === 401 || response.status === 403) {
					throw new Error("UNAUTHORIZED");
				}
				throw new Error(`Failed to fetch orders (Status: ${response.status})`);
			}

			const data = await response.json();
			setOrders(data.content || []);
			setTotalPages(data.page.totalPages || 1);
			setTotalElements(data.page.totalElements || 0);
		} catch (err) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	}, [searchQuery, selectedFilter, currentPage]);

	const changeSearchQuery = (newQuery) => {
		setSearchQuery(newQuery);
		setCurrentPage(1); // Reset to page 1 on search
	};

	const changeSelectedFilter = (newFilter) => {
		setSelectedFilter(newFilter);
		setCurrentPage(1); // Reset to page 1 on filter change
	};

	return {
		orders,
		isLoading,
		error,
		selectedFilter,
		setSelectedFilter: changeSelectedFilter,
		searchQuery,
		setSearchQuery: changeSearchQuery,
		currentPage,
		setCurrentPage,
		totalPages,
		totalElements,
		fetchOrders,
	};
}
