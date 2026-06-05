export const loginApi = async () => {
	const response = await fetch("/api/auth/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			email: "support@greenshop.vn",
			password: "123456",
		}),
		credentials: "include",
	});

	if (!response.ok) throw new Error("Failed to login");
	return response.json();
};

export const registerApi = async () => {
	throw new Error("Register API has not been implemented");
};

export const logoutApi = async () => {
	const response = await fetch("/api/auth/logout", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	if (!response.ok) throw new Error("Failed to logout");
	return response.json();
};
