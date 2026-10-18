import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL;

// A single axios instance for the whole app. It attaches the current access
// token to every request and, on a 401, transparently refreshes once and
// retries — so an expired access token no longer logs the user out.
const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
});

const tokenKeys = {
  user: {
    access: "usertoken",
    refresh: "userrefresh",
    refreshPath: "/api/v1/users/refresh",
  },
  owner: {
    access: "ownertoken",
    refresh: "ownerrefresh",
    refreshPath: "/api/v1/owner/refresh",
  },
};

const activeRole = () =>
  localStorage.getItem("ownertoken") ? "owner" : "user";

api.interceptors.request.use((config) => {
  const keys = tokenKeys[activeRole()];
  const token = localStorage.getItem(keys.access);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry) {
      original._retry = true;
      const role = activeRole();
      const keys = tokenKeys[role];
      const refreshToken = localStorage.getItem(keys.refresh);

      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${BASE}${keys.refreshPath}`,
            { refreshToken },
            { withCredentials: true }
          );
          const newAccess = data?.data?.accessToken;
          const newRefresh = data?.data?.refreshToken;
          if (newAccess) {
            localStorage.setItem(keys.access, newAccess);
            if (newRefresh) localStorage.setItem(keys.refresh, newRefresh);
            original.headers = original.headers || {};
            original.headers.Authorization = `Bearer ${newAccess}`;
            return api(original);
          }
        } catch {
          // Refresh failed — fall through and reject the original error.
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { BASE };
