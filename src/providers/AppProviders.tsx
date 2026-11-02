"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import { AppErrorBoundary } from "@/components/feedback/AppErrorBoundary";
import { ConfirmProvider } from "@/shared/hooks/useConfirm";
import { AuthProvider } from "@/features/auth/AuthProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <AuthProvider>
          <ConfirmProvider>
            <TooltipProvider delayDuration={200}>
              {children}
              <Toaster position="top-right" />
            </TooltipProvider>
          </ConfirmProvider>
        </AuthProvider>
      </QueryProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}
