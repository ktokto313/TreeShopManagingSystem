export const fetchTicketById = async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
	const response = await fetch(`/api/tickets/${id}`, {
		credentials: "include",
	});
	if (!response.ok) throw new Error("Failed to fetch ticket");
	return response.json();
};

export const updateTicketStatus = async (id, newState, agentEmail = null) => {
	let url = `/api/tickets/${id}/status?newState=${newState}`;
	if (agentEmail) url += `&agentEmail=${agentEmail}`;

    await new Promise((resolve) => setTimeout(resolve, 1000));
	const response = await fetch(url, { method: "PUT", credentials: "include" });
	if (!response.ok) throw new Error("Failed to update status");
	return response.json();
};

export const fetchComments = async (ticketId) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
	const response = await fetch(`/api/tickets/${ticketId}/comments`, {credentials: "include"});
	if (!response.ok) throw new Error("Failed to fetch comments");
	return response.json();
};

export const createComment = async (ticketId, detail) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
	const response = await fetch(`/api/tickets/${ticketId}/comments`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(detail),
		credentials: "include",
	});
	if (!response.ok) throw new Error("Failed to post comment");
	return response.json();
};

export const fetchAllTickets = async (status, priority, sort) => {
	const params = new URLSearchParams();

	if (status) params.append("status", status);
	if (priority) params.append("priority", priority);
	if (sort) params.append("sort", sort);

	const url = `/api/tickets/?${params.toString()}`;

	await new Promise((resolve) => setTimeout(resolve, 500));
	const response = await fetch(url, {
		method: "GET",
		credentials: "include",
	});

	if (!response.ok) throw new Error("Failed to fetch all tickets");
	return response.json();
};
