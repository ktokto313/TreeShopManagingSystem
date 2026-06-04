export const fetchAllTickets = async (status, priority, sort) => {
	const params = new URLSearchParams();

	if (status) params.append("status", status);
    if (priority) params.append("priority", priority);
    if (sort) params.append("sort", sort);

	const url = `/api/tickets/?${params.toString()}`;

	await new Promise(resolve => setTimeout(resolve, 1500));
	const response = await fetch(url, {
		method: "GET",
	});

	if (!response.ok) throw new Error("Failed to fetch all tickets");
	return response.json();
};
