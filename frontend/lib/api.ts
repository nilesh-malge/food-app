import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  withCredentials: true,
});

let isRefreshing = false;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    const isAuthCheckRoute =
      originalRequest.url?.includes("/auth/me") ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshing &&
      !isAuthCheckRoute
    ) {
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        await api.post("/auth/refresh");
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshErr) {
        isRefreshing = false;
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/login"
        ) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);
