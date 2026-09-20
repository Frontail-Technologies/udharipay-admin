"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Admin render failure", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="grid min-h-dvh place-items-center bg-background p-6">
        <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 text-center">
          <h1 className="text-lg font-semibold text-text-primary">This page could not be loaded</h1>
          <p className="mt-2 text-sm text-text-secondary">Reload the page. If the problem continues, contact support.</p>
          <Button className="mt-5" onClick={() => window.location.reload()}>Reload</Button>
        </div>
      </main>
    );
  }
}
