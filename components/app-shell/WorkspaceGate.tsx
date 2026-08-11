"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { useStore } from "@/lib/context/StoreContext";

/**
 * Holds the app shell back until the first Supabase load resolves, and catches
 * the signed-in-but-no-organization case.
 *
 * Without this the dashboard renders with placeholder zeros for a beat, which
 * reads as "your data is gone" rather than "still loading".
 */
export const WorkspaceGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isHydrated, needsOnboarding, error } = useStore();

  if (!isHydrated) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="flex items-center gap-2.5 text-xs font-medium text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your workspace…
        </div>
      </div>
    );
  }

  if (needsOnboarding) {
    return (
      <div className="flex-1 flex items-center justify-center py-24 px-4">
        <div className="max-w-sm text-center space-y-2">
          <h2 className="text-base font-bold text-neutral-900">No workspace yet</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Your account isn&apos;t linked to an organization. This happens if signup was
            interrupted before the workspace was created. Sign out and sign up again, or
            ask an admin to invite you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800"
        >
          {error}
        </div>
      )}
      {children}
    </>
  );
};
