"use client";
import { useAuthCheck } from "@/lib/utils/authCheck";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  useAuthCheck();
  return <>{children}</>;
}
