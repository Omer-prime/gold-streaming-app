import axios from "axios";
import { API_BASE_URL } from "../config";

const baseURL = API_BASE_URL.replace(/\/+$/, "");

const api = axios.create({
  baseURL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

export default api;
