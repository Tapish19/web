import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL || "/api";
const baseURL = rawBaseUrl.replace(/\/$/, "");

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
    return `Cannot reach API (${baseURL}). Check VITE_API_URL, backend URL, and CORS settings.`;
  }

  return err?.message || fallbackMessage;
};

export default API;
