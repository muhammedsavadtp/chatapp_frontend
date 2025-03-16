// /lib/api/authApi.ts
import axiosInstance from "./axiosInstance";

export const register = async (data: {
  username: string;
  name: string;
  password: string;
}) => {
  const response = await axiosInstance.post("/auth/register", data);
  return response.data; // { message: "User registered" }
};

export const login = async (credentials: {
  username: string;
  password: string;
}) => {
  const response = await axiosInstance.post("/auth/login", credentials);
  return response.data; // { token, user }
};

// New function to validate token
export const validateToken = async () => {
  const response = await axiosInstance.get("/auth/validate");
  return response.data; // { valid: boolean, user?: object, error?: string }
};
