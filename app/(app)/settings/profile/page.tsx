"use client";

import React, { useState, useRef } from "react";
import { User, Mail, Briefcase, Camera, Check } from "lucide-react";
import { useStore } from "@/lib/context/StoreContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export default function ProfileSettingsPage() {
  const { isHydrated } = useStore();
  // Remounting on hydration re-seeds the draft state below from the persisted
  // values, which is why this is a key rather than a sync effect.
  return <ProfileSettingsForm key={isHydrated ? "stored" : "seed"} />;
}

function ProfileSettingsForm() {
  const { currentUser: user, updateCurrentUser } = useStore();
  const [fullName, setFullName] = useState(user.full_name);
  const [email, setEmail] = useState(user.email);
  const [roleTitle, setRoleTitle] = useState(user.role_title || "");
  const [timezone, setTimezone] = useState(user.timezone || "America/New_York (EST)");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * There is no upload endpoint, so the chosen image is inlined as a data URL
   * and stored with the profile — it survives reloads like any other field.
   */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file (JPG or PNG).");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("That image is over 5MB. Please choose a smaller file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarError("");
      // Awaited via .catch rather than fire-and-forget: this runs in a
      // FileReader callback, so a rejected write would otherwise surface only
      // as an unhandled rejection and the old avatar would stay on screen.
      updateCurrentUser({ avatar_url: String(reader.result) }).catch((err) =>
        setAvatarError(err instanceof Error ? err.message : String(err))
      );
    };
    reader.onerror = () => setAvatarError("Could not read that file. Please try another.");
    reader.readAsDataURL(file);

    // Reset so picking the same file again still fires a change event.
    e.target.value = "";
  };

  // Awaited so "Saved" only ever follows a write that actually succeeded.
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setIsSaving(true);
    try {
      await updateCurrentUser({
        full_name: fullName.trim(),
        email: email.trim(),
        role_title: roleTitle.trim(),
        timezone,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
      <div className="border-b border-neutral-100 pb-4">
        <h2 className="text-base font-bold text-neutral-900">Personal Profile</h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Update your personal details, avatar, and preferred notification time zone.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-neutral-100"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 shadow-xs cursor-pointer"
              aria-label="Upload a new profile photo"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">{fullName}</h3>
            {avatarError ? (
              <p className="text-xs text-rose-600 font-medium">{avatarError}</p>
            ) : (
              <p className="text-xs text-neutral-400">JPG or PNG under 5MB</p>
            )}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            leftIcon={<User className="h-4 w-4 text-neutral-400" />}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4 text-neutral-400" />}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Job Title / Role"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            leftIcon={<Briefcase className="h-4 w-4 text-neutral-400" />}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-700">
              Preferred Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full h-10 px-3.5 bg-white text-neutral-900 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
            >
              <option value="America/New_York (EST)">America/New York (EST)</option>
              <option value="America/Los_Angeles (PST)">America/Los Angeles (PST)</option>
              <option value="America/Chicago (CST)">America/Chicago (CST)</option>
              <option value="Europe/London (GMT)">Europe/London (GMT)</option>
              <option value="Europe/Berlin (CET)">Europe/Berlin (CET)</option>
              <option value="Asia/Singapore (SGT)">Asia/Singapore (SGT)</option>
            </select>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-4 border-t border-neutral-100 space-y-2">
          {saveError && (
            <p role="alert" className="text-xs font-medium text-rose-600">
              {saveError}
            </p>
          )}

          <div className="flex items-center justify-between">
            <Button type="submit" size="md" variant="primary" isLoading={isSaving}>
              {saved ? "Saved Changes!" : "Save Profile"}
            </Button>

            {saved && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <Check className="h-4 w-4" /> Changes saved successfully
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
