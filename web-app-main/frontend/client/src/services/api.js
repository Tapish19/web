import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL || "https://web-1s.onrender.com/api";
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

export default API;
