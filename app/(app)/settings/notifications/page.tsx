"use client";

import React, { useState } from "react";
import { Bell, Mail, Check } from "lucide-react";
import { useStore } from "@/lib/context/StoreContext";
import { NotificationPreferences } from "@/lib/types";
import { Button } from "@/components/ui/Button";

const ToggleRow: React.FC<{
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}> = ({ title, description, checked, onChange }) => (
  <label className="py-3 flex items-center justify-between gap-4 cursor-pointer">
    <div>
      <p className="text-xs font-semibold text-neutral-900">{title}</p>
      <p className="text-[11px] text-neutral-500">{description}</p>
    </div>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded accent-neutral-900 cursor-pointer shrink-0"
    />
  </label>
);

export default function NotificationSettingsPage() {
  const { isHydrated } = useStore();
  // Remounting on hydration re-seeds the draft state below from the persisted
  // values, which is why this is a key rather than a sync effect.
  return <NotificationSettingsForm key={isHydrated ? "stored" : "seed"} />;
}

function NotificationSettingsForm() {
  const { notificationPrefs, updateNotificationPrefs } = useStore();
  const [preferences, setPreferences] = useState<NotificationPreferences>(notificationPrefs);
  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationPrefs(preferences);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
      <div className="border-b border-neutral-100 pb-4">
        <h2 className="text-base font-bold text-neutral-900">Notification Preferences</h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Choose which agency events send in-app alerts and email notifications.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Email Alerts */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-neutral-500" />
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Email Notifications
            </h3>
          </div>

          <div className="divide-y divide-neutral-100">
            <ToggleRow
              title="New Deliverable Uploaded"
              description="Get notified immediately when a draft is ready for review"
              checked={preferences.emailDeliverable}
              onChange={() => toggle("emailDeliverable")}
            />
            <ToggleRow
              title="Revision Status Updates"
              description="Email me when a writer picks up or completes my requested revisions"
              checked={preferences.emailRevision}
              onChange={() => toggle("emailRevision")}
            />
            <ToggleRow
              title="Writer Direct Message / Comment"
              description="Receive email alerts when an assigned writer asks a question"
              checked={preferences.emailComment}
              onChange={() => toggle("emailComment")}
            />
            <ToggleRow
              title="Weekly Content Pipeline Summary"
              description="A weekly Monday digest of word credits, completed orders, and active drafts"
              checked={preferences.emailWeeklyDigest}
              onChange={() => toggle("emailWeeklyDigest")}
            />
          </div>
        </div>

        {/* In-App Alerts */}
        <div className="space-y-3 pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-neutral-500" />
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              In-App Notification Bell
            </h3>
          </div>

          <div className="divide-y divide-neutral-100">
            <ToggleRow
              title="Pipeline State Transitions"
              description="Show badges when orders move from Submitted → Queue → Writing → Review"
              checked={preferences.inAppStatus}
              onChange={() => toggle("inAppStatus")}
            />
            <ToggleRow
              title="Deliverable Ready Alerts"
              description="Badge the bell the moment a new draft version lands for review"
              checked={preferences.inAppDeliverable}
              onChange={() => toggle("inAppDeliverable")}
            />
            <ToggleRow
              title="Comment Replies"
              description="Badge the bell when a writer replies in an order discussion thread"
              checked={preferences.inAppComment}
              onChange={() => toggle("inAppComment")}
            />
          </div>

          <p className="text-[11px] text-neutral-400 pt-1">
            Turning an in-app category off stops new alerts of that kind from reaching your
            notification bell.
          </p>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
          <Button type="submit" size="md" variant="primary">
            {saved ? "Preferences Saved!" : "Save Preferences"}
          </Button>

          {saved && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <Check className="h-4 w-4" /> Preferences updated
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
