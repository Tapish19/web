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

export default API;
