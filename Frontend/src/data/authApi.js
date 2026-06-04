export const loginApi = async () => {
	const response = await fetch("/api/auth/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
<<<<<<< HEAD
			email: "support@greenshop.vn",
			password: "123456",
=======
			email: "admin@greenshop.vn",
			password: "admin",
>>>>>>> upstream/LKT
		}),
	})

	if (!response.ok) throw new Error("Failed to login");
	return response.json();
};

export const registerApi = async () => {
	throw new Error("Register API has not been implemented")
}
