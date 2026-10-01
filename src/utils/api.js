const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
    ? "/api"
    : "http://localhost:5000/api");

function getToken() {
  return localStorage.getItem("shajara_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Server xatosi");
  return data;
}

export const api = {
  // Auth
  login: (username, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),

  me: () => request("/auth/me"),

  getUsers: () => request("/auth/users"),

  addUser: (userData) =>
    request("/auth/users", { method: "POST", body: JSON.stringify(userData) }),

  deleteUser: (id) =>
    request(`/auth/users/${id}`, { method: "DELETE" }),

  // Members & Tree
  getMembers: () => request("/members"),

  createMember: (data) =>
    request("/members", { method: "POST", body: JSON.stringify(data) }),

  updateMember: (id, data) =>
    request(`/members/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteMember: (id) =>
    request(`/members/${id}`, { method: "DELETE" }),

  bulkSaveMembers: (members, unionsData) =>
    request("/members/bulk", { method: "POST", body: JSON.stringify({ members, unionsData }) }),

  updateUnions: (unionsData) =>
    request("/members/unions/update", { method: "PUT", body: JSON.stringify({ unionsData }) }),

  // Feedbacks
  sendFeedback: (data) =>
    request("/feedbacks", { method: "POST", body: JSON.stringify(data) }),

  sendPublicFeedback: (data) =>
    fetch(`${BASE_URL}/feedbacks/public`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  getFeedbacks: () => request("/feedbacks"),

  resolveFeedback: (id) =>
    request(`/feedbacks/${id}/resolve`, { method: "PATCH" }),

  deleteFeedback: (id) =>
    request(`/feedbacks/${id}`, { method: "DELETE" }),

  // Health
  health: () => request("/health")
};