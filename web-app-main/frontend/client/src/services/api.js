import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_URL;

const baseURL = configuredBaseUrl
  ? configuredBaseUrl.replace(/\/$/, "")
  : "/api";

const API = axios.create({
  baseURL,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const getApiErrorMessage = (err, fallbackMessage) => {
  const backendMsg = err?.response?.data?.msg;
  const backendError = err?.response?.data?.error;
  const networkIssue = !err?.response;

  if (backendMsg) return backendMsg;
  if (backendError) return backendError;

  if (networkIssue) {
    const sameOriginHint = baseURL === "/api"
      ? "If frontend/backend are on different domains, set VITE_API_URL to your backend /api URL."
      : "Confirm this API URL is live and reachable from the browser.";

    return `Cannot reach API at ${baseURL}. ${sameOriginHint}`;
  }

  return err?.message || fallbackMessage;
};

export default API;
