export const fetchTicketById = async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
	const response = await fetch(`/api/tickets/${id}`, {
		credentials: "include",
	});
	if (!response.ok) {
		const errorMessage = await response.text();
		throw new Error(errorMessage || "Failed to fetch ticket");
	}
	return response.json();
};

export const updateTicketStatus = async (id, newState, agentEmail = null) => {
	let url = `/api/tickets/${id}/status?newState=${newState}`;
	if (agentEmail) url += `&agentEmail=${agentEmail}`;

    await new Promise((resolve) => setTimeout(resolve, 1000));
	const response = await fetch(url, { method: "PUT", credentials: "include" });
	if (!response.ok) {
		const errorMessage = await response.text();
		throw new Error(errorMessage || "Failed to update status");
	}
	return response.json();
};

export const fetchComments = async (ticketId) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
	const response = await fetch(`/api/tickets/${ticketId}/comments`, {credentials: "include"});
	if (!response.ok) {
		const errorMessage = await response.text();
		throw new Error(errorMessage || "Failed to fetch comments");
	}
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
	if (!response.ok) {
		const errorMessage = await response.text();
		throw new Error(errorMessage || "Failed to post comment");
	}
	return response.json();
};

export const fetchAllTickets = async (search, status, priority, sort, page = 0, size = 8) => {
	const params = new URLSearchParams();

	if (search) params.append("search", search);
	if (status) params.append("status", status);
	if (priority) params.append("priority", priority);
	if (sort) params.append("sort", sort);
	params.append("page", page);
	params.append("size", size);

	const url = `/api/tickets/?${params.toString()}`;

	await new Promise((resolve) => setTimeout(resolve, 500));
	const response = await fetch(url, {
		method: "GET",
		credentials: "include",
	});

	if (!response.ok) {
		const errorMessage = await response.text();
		throw new Error(errorMessage || "Failed to fetch all tickets");
	}
	return response.json();
};

export const createTicket = async (ticket) => {
	const response = await fetch("/api/tickets", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(ticket),
		credentials: "include",
	});

	if (!response.ok) {
		const errorMessage = await response.text();
		throw new Error(errorMessage || "Failed to create ticket");
	}
	return response.json();
};
