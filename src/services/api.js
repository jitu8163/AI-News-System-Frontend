import axios from "axios";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Admin-only routes — the only places a 401 should bounce the user to /login.
const ADMIN_PATHS = ["/keywords", "/settings", "/profile"];

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Clear an expired session, but only redirect to /login from admin pages.
    // Public pages (dashboard, articles) must always remain visible — a stale
    // token must never bounce a returning visitor away from the dashboard.
    if (err.response?.status === 401 && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      const onAdminPage = ADMIN_PATHS.some((p) =>
        window.location.pathname.startsWith(p)
      );
      if (onAdminPage) window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (email, password) =>
    api.post("/auth/login", new URLSearchParams({ username: email, password }), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }),
  me: () => api.get("/auth/me"),
  changePassword: (current_password, new_password) =>
    api.post("/auth/change-password", { current_password, new_password }),
};

export const keywordsApi = {
  list: () => api.get("/keywords"),
  create: (data) => api.post("/keywords", data),
  update: (id, data) => api.put(`/keywords/${id}`, data),
  remove: (id) => api.delete(`/keywords/${id}`),
};

export const articlesApi = {
  list: (params) => api.get("/articles", { params }),
  get: (id) => api.get(`/articles/${id}`),
};

export const dashboardApi = {
  stats: () => api.get("/dashboard/stats"),
  impact: (params) => api.get("/dashboard/impact", { params }),
  countryCounts: () => api.get("/dashboard/country-counts"),
};

export const adminApi = {
  fetchNow: () => api.post("/admin/fetch-now"),
  getSchedulerInterval: () => api.get("/admin/scheduler-interval"),
  setSchedulerInterval: (interval_hours) => api.put("/admin/scheduler-interval", { interval_hours }),
  deleteAllArticles: () => api.delete("/admin/articles"),
};

export default api;
