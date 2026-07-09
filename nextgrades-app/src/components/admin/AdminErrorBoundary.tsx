"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { ADMIN_PORTAL_HOME } from "@/lib/admin/portal-paths";

type Props = { children: ReactNode };

type State = { error: Error | null };

/** Catches client errors in the admin portal so users see a recovery screen instead of a blank page. */
export class AdminErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Admin portal error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full min-h-[50vh] flex-1 items-center justify-center bg-[#0D1B2A] px-6">
          <div className="max-w-lg rounded-2xl border border-red-500/30 bg-[#112240] p-8 text-center">
            <h2 className="text-lg font-bold text-white">Something went wrong</h2>
            <p className="mt-2 text-sm text-gray-400">
              The admin page hit an error. Try refreshing - your data is safe.
            </p>
            <p className="mt-3 truncate font-mono text-xs text-red-300/80">{this.state.error.message}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button variant="gold" size="md" onClick={() => window.location.reload()}>
                Refresh page
              </Button>
              <Button variant="outline" size="md" href={ADMIN_PORTAL_HOME}>
                Admin home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
