"use client";

import React from "react";
import { Sidebar } from "@/components/app-shell/Sidebar";
import { TopNav } from "@/components/app-shell/TopNav";
import { ThemeController } from "@/components/app-shell/ThemeController";
import { StoreProvider } from "@/lib/context/StoreContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <ThemeController />
      <div className="min-h-screen bg-[var(--background)] text-neutral-900 flex flex-col font-sans">
        {/* Dark Sidebar Navigation */}
        <Sidebar />

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col lg:pl-[64px] pt-14 lg:pt-0 min-w-0 transition-all duration-150">
          {/* Top Header Navigation */}
          <TopNav />

          {/* Page Content Viewport */}
          <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </StoreProvider>
  );
}
