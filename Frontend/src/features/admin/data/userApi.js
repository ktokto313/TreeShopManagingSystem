const BASE = "/api/users";

const defaultHeaders = { "Content-Type": "application/json" };

async function parseJsonBody(response) {
  const text = await response.text();
  if (!text) return undefined;
  return JSON.parse(text);
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    credentials: "include",
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
  });

  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return undefined;
  return parseJsonBody(response);
}

export const userApi = {
  getAll: () => request(""),

  getById: (id) => request(`/${id}`),

  getMe: () => request("/me"),

  create: (payload) =>
    request("", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id, payload) =>
    request(`/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  updateMe: (payload) =>
    request("/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  remove: (id) =>
    request(`/${id}`, {
      method: "DELETE",
    }),

  ban: (id) =>
    request(`/${id}/ban`, {
      method: "PATCH",
    }),

  unban: (id) =>
    request(`/${id}/unban`, {
      method: "PATCH",
    }),

  searchByEmail: (email) =>
    request(`/search?email=${encodeURIComponent(email)}`),

  searchByKeyword: (keyword) =>
    request(`/search?query=${encodeURIComponent(keyword)}`),
};
