export const ROLE_HOME_ROUTES = {
	SYSTEM_ADMIN: "/admin/users",
	MANAGER: "/manage",
	SUPPORT_AGENT: "/tickets/dashboard",
	SHIPPER: "/orders",
	CUSTOMER: "/",
};

export function getUserRole(userOrRole) {
	if (!userOrRole) return null;
	if (typeof userOrRole === "string") return userOrRole;
	return userOrRole.roleName ?? userOrRole.role ?? null;
}

export function getDefaultRouteForRole(userOrRole) {
	const role = getUserRole(userOrRole);
	return ROLE_HOME_ROUTES[role] ?? "/";
}

export function hasAllowedRole(user, allowedRoles = []) {
	if (!allowedRoles.length) return Boolean(user);
	return allowedRoles.includes(getUserRole(user));
}
