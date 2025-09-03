// api.js
import axios from "axios";
import { getToken } from "../services/authConfig";

const api = axios.create({ baseURL: "https://localhost:5001" });

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
// Example usage: const { data } = await api.get("/ping");
