"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "./AuthProvider";

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return <div className="grid min-h-dvh place-items-center bg-background"><Loader2 className="size-5 animate-spin text-primary" aria-label="Loading session" /></div>;
  }
  return children;
}
