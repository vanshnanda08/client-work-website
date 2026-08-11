"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // proxy.ts stashes the originally requested path here.
  const nextPath = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsSubmitting(false);
      return;
    }

    // refresh() so the proxy re-runs with the new auth cookie before we land.
    router.replace(nextPath);
    router.refresh();
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-2xs space-y-5">
      <div>
        <h1 className="text-lg font-extrabold text-neutral-900 tracking-tight">
          Sign in
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Access your content dashboard.
        </p>
      </div>

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
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="h-4 w-4 text-neutral-400" />}
          required
        />

        <div className="space-y-1.5">
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4 text-neutral-400" />}
            required
          />
          <div className="text-right">
            <Link
              href="/reset-password"
              className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 transition"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full"
          isLoading={isSubmitting}
        >
          Sign in
        </Button>
      </form>

      <p className="text-xs text-neutral-500 text-center pt-1 border-t border-neutral-100">
        <span className="block pt-4">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-neutral-900 hover:underline">
            Create one
          </Link>
        </span>
      </p>
    </div>
  );
}

export default function LoginPage() {
  // useSearchParams needs a Suspense boundary to avoid opting the whole route
  // into client-side rendering at build time.
  return (
    <Suspense fallback={<div className="h-80" />}>
      <LoginForm />
    </Suspense>
  );
}
