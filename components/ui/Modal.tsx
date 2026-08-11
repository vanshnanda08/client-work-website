"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Dialog Body */}
      <div
        className={cn(
          "relative w-full bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 p-6",
          maxWidthStyles[maxWidth]
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {(title || description) && (
          <div className="mb-5 pr-6">
            {title && <h3 className="text-lg font-bold text-neutral-900">{title}</h3>}
            {description && (
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{description}</p>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
};
