import axios from "axios";

const API_BASE_URL = "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl: string = error.config?.url || "";
    const isAuthEndpoint = requestUrl.includes("/auth/login")
      || requestUrl.includes("/auth/register")
      || requestUrl.includes("/auth/password-reset");

    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
