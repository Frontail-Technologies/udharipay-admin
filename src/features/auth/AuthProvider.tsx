"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getCurrentSession, logout as logoutSession } from "@/api/generated/auth";
import type { SessionContext } from "@/api/generated/contracts/auth";

type AuthValue = {
  session: SessionContext | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export const authKeys = {
  session: ["auth", "session"] as const,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({ queryKey: authKeys.session, queryFn: ({ signal }) => getCurrentSession({ signal }), retry: false });
  const logoutMutation = useMutation({ mutationFn: () => logoutSession() });

  const clearSession = async () => {
    clearAuthenticatedCache(queryClient);
    router.replace("/login");
  };

  useEffect(() => {
    const onExpired = () => { void clearSession(); };
    window.addEventListener("udharipay:session-expired", onExpired);
    return () => window.removeEventListener("udharipay:session-expired", onExpired);
  });

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      await clearSession();
    }
  };

  return (
    <AuthContext.Provider value={{
      session: sessionQuery.data?.data ?? null,
      isLoading: sessionQuery.isLoading,
      isAuthenticated: sessionQuery.isSuccess && sessionQuery.data.data.user.role === "admin",
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function clearAuthenticatedCache(queryClient: QueryClient) {
  queryClient.removeQueries();
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
