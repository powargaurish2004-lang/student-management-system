const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getToken = () => sessionStorage.getItem("sms_token");
export const saveSession = ({ token, user }) => {
  sessionStorage.setItem("sms_token", token);
  sessionStorage.setItem("sms_user", JSON.stringify(user));
};
export const clearSession = () => {
  sessionStorage.removeItem("sms_token");
  sessionStorage.removeItem("sms_user");
};
export const getUser = () => {
  try { return JSON.parse(sessionStorage.getItem("sms_user")); }
  catch { return null; }
};

export async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Request failed.");
  }

  return response.status === 204 ? null : response.json();
}

export const authApi = {
  login: (data) => api("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  register: (data) => api("/auth/register", { method: "POST", body: JSON.stringify(data) }),
};

export const studentsApi = {
  list: () => api("/students"),
  create: (data) => api("/students", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => api(`/students/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  toggle: (id) => api(`/students/${id}/status`, { method: "PATCH" }),
  remove: (id) => api(`/students/${id}`, { method: "DELETE" }),
};
