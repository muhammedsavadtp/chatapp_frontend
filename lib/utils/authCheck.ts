"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCredentials, logout } from "../redux/slices/authSlice";
import { validateToken } from "@/lib/api/authApi";
import { getStorageValue, removeStorageValue } from "@/lib/utils/storage";
import { useRouter } from "next/navigation";

export const useAuthCheck = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = getStorageValue("auth_token");
      if (!token) {
        dispatch(logout());
        router.push("/auth");
        return;
      }

      try {
        const { valid, user } = await validateToken();
        if (valid && user) {
          dispatch(setCredentials({ user, token }));
        } else {
          dispatch(logout());
          removeStorageValue("auth_token");
          router.push("/auth");
        }
      } catch (error) {
        console.error(error);
        dispatch(logout());
        removeStorageValue("auth_token");
        router.push("/auth");
      }
    };

    checkAuth();
  }, [dispatch, router]);
};
