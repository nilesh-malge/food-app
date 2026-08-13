import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  withCredentials: true, // send/receive the httpOnly auth cookies
});

let isRefreshing = false;

// If an access token expires mid-session, transparently refresh it once
// and retry the original request, instead of forcing a full re-login.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // A 401 on these routes just means "not logged in yet" — that's a
    // normal, expected state on first load (nobody has a session yet),
    // not an expired one. Trying to refresh or redirect here would loop
    // forever, since the refresh call itself would also 401.
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
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);
