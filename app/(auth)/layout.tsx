import React from "react";

/**
 * Auth route group. Deliberately does NOT mount StoreProvider or the app shell
 * — a signed-out visitor has no store to populate and no sidebar to navigate.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-neutral-900 font-sans flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand mark, matching the sidebar logo */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-[#0B0D14] flex items-center justify-center p-2">
            <div className="grid grid-cols-2 gap-0.5 w-full h-full">
              <div className="bg-white rounded-xs" />
              <div className="bg-orange-500 rounded-xs" />
              <div className="bg-orange-500 rounded-xs" />
              <div className="bg-white rounded-xs" />
            </div>
          </div>
          <span className="text-neutral-900 font-extrabold text-lg tracking-tight">
            Inkwell
          </span>
        </div>

        {children}
      </div>
    </div>
  );
}
