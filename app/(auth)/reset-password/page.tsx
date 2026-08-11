"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      // Must be listed under Authentication -> URL Configuration -> Redirect URLs,
      // or Supabase refuses to send the user here.
      { redirectTo: `${window.location.origin}/auth/callback?next=/settings/profile` }
    );

    if (resetError) {
      setError(resetError.message);
      setIsSubmitting(false);
      return;
    }

    setSent(true);
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-2xs space-y-5">
      <div>
        <h1 className="text-lg font-extrabold text-neutral-900 tracking-tight">
          Reset your password
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          We&apos;ll email you a link to set a new one.
        </p>
      </div>

      {sent ? (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900"
        >
          If an account exists for <strong>{email}</strong>, a reset link is on its way.
          The link expires in one hour.
        </div>
      ) : (
        <>
          {error && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4 text-neutral-400" />}
              autoComplete="email"
              required
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={isSubmitting}
            >
              Send reset link
            </Button>
          </form>
        </>
      )}

      <p className="text-xs text-neutral-500 text-center pt-1 border-t border-neutral-100">
        <span className="block pt-4">
          <Link href="/login" className="font-semibold text-neutral-900 hover:underline">
            Back to sign in
          </Link>
        </span>
      </p>
    </div>
  );
}
