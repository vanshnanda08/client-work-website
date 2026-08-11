"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    // full_name rides along in user metadata; the handle_new_user() trigger
    // reads it when creating the profile row.
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    // With email confirmation ON, there is no session yet — the user must click
    // the emailed link before we can create their org.
    if (!data.session) {
      setNotice(
        "Check your inbox to confirm your email address, then sign in to finish setting up your workspace."
      );
      setIsSubmitting(false);
      return;
    }

    // A brand-new user belongs to no organization, and every RLS policy keys off
    // membership — so create one before sending them into the app.
    const { error: orgError } = await supabase.rpc("bootstrap_organization", {
      org_name: orgName.trim(),
    });

    if (orgError && !orgError.message.includes("already belongs")) {
      setError(`Account created, but workspace setup failed: ${orgError.message}`);
      setIsSubmitting(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-2xs space-y-5">
      <div>
        <h1 className="text-lg font-extrabold text-neutral-900 tracking-tight">
          Create your workspace
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Start commissioning content in a couple of minutes.
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

      {notice && (
        <div
          role="status"
          className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs font-medium text-blue-900"
        >
          {notice}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Your name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          leftIcon={<User className="h-4 w-4 text-neutral-400" />}
          autoComplete="name"
          required
        />

        <Input
          label="Company / workspace name"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          leftIcon={<Building2 className="h-4 w-4 text-neutral-400" />}
          helperText="You can rename this later in Settings."
          required
        />

        <Input
          label="Work email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="h-4 w-4 text-neutral-400" />}
          autoComplete="email"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="h-4 w-4 text-neutral-400" />}
          helperText="At least 8 characters."
          autoComplete="new-password"
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full"
          isLoading={isSubmitting}
        >
          Create workspace
        </Button>
      </form>

      <p className="text-xs text-neutral-500 text-center pt-1 border-t border-neutral-100">
        <span className="block pt-4">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-neutral-900 hover:underline">
            Sign in
          </Link>
        </span>
      </p>
    </div>
  );
}
