"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/context/StoreContext";

/**
 * Applies the stored appearance preferences to <html> as `data-theme` and
 * `data-density`, which `globals.css` keys its palette and spacing off of.
 * Renders nothing.
 */
export const ThemeController: React.FC = () => {
  const { appearance } = useStore();
  const { theme, density } = appearance;

  useEffect(() => {
    const root = document.documentElement;

    const apply = (resolved: "light" | "dark") => {
      root.dataset.theme = resolved;
    };

    if (theme !== "system") {
      apply(theme);
      return;
    }

    // Follow the OS setting, and keep following it while it changes.
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    apply(media.matches ? "dark" : "light");

    const onChange = (e: MediaQueryListEvent) => apply(e.matches ? "dark" : "light");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.density = density;
  }, [density]);

  return null;
};
