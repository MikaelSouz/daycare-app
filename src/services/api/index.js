import axios from "axios";
import { QueryClient } from "@tanstack/react-query";
import { userKeyToken } from "../constants/index";
import { restoreToken } from "../storage/index";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = restoreToken(userKeyToken);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const queryClient = new QueryClient();
