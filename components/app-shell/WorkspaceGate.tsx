"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useStore } from "@/lib/context/StoreContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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
    return <CreateWorkspace />;
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

/**
 * Recovery path for a signed-in user who belongs to no organization.
 *
 * This is not an edge case: with email confirmation enabled, signUp() returns
 * no session, so the signup page cannot call bootstrap_organization() and
 * returns early. Every such user lands here after confirming their email, and
 * without this form there is no way for them to ever create a workspace —
 * signing up again fails because the account already exists.
 */
const CreateWorkspace: React.FC = () => {
  const { bootstrapWorkspace } = useStore();
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Please name your workspace.");
      return;
    }
    setFormError("");
    setIsCreating(true);
    try {
      await bootstrapWorkspace(name.trim());
      // No redirect needed: bootstrapWorkspace refreshes the store, which flips
      // needsOnboarding to false and renders the app in place.
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
      setIsCreating(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-24 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="text-center space-y-1.5">
          <h2 className="text-base font-bold text-neutral-900">
            Name your workspace
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Your account isn&apos;t linked to an organization yet. Create one to
            start commissioning content.
          </p>
        </div>

        <Input
          label="Workspace name"
          placeholder="Acme Marketing"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={formError || undefined}
          autoFocus
        />

        <Button type="submit" className="w-full" isLoading={isCreating}>
          Create workspace
        </Button>
      </form>
    </div>
  );
};
