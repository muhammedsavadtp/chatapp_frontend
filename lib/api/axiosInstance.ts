// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import axios, { AxiosError } from "axios";
import { getStorageValue, removeStorageValue } from "@/lib/utils/storage";
import { store } from "@/lib/redux/store";
import { logout } from "../redux/slices/authSlice";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getStorageValue("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message =
      (error.response?.data as unknown)?.error || "Something went wrong";

    // Check for 401 status (invalid token) and log out
    if (error.response?.status === 401) {
      store.dispatch(logout());
      removeStorageValue("auth_token");
    }

    console.error(`API Error: ${message}`);
    return Promise.reject({ message, status: error.response?.status });
  }
);

export default axiosInstance;
