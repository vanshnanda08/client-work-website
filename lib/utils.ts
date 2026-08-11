import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatRelativeTime(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(date);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

/** Turns a title into a filesystem-friendly slug for downloaded files. */
export function slugifyFilename(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "deliverable"
  );
}

/**
 * Triggers a real browser download of generated text content. The dashboard has
 * no file server, so deliverables are rebuilt client-side from the markdown we
 * already hold and handed to the user as an actual file.
 */
export function downloadTextFile(
  filename: string,
  content: string,
  mimeType = "text/markdown;charset=utf-8"
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Give the download a tick to start before revoking the object URL.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Human-readable byte size for content generated in the browser. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function calculateReadingTime(wordCount: number): string {
  const wordsPerMinute = 225;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

export function getDaysRemaining(dueDateString: string): {
  days: number;
  label: string;
  isUrgent: boolean;
  isOverdue: boolean;
} {
  const due = new Date(dueDateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - now.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return {
      days: Math.abs(days),
      label: `${Math.abs(days)}d overdue`,
      isUrgent: true,
      isOverdue: true,
    };
  }
  if (days === 0) {
    return {
      days: 0,
      label: "Due today",
      isUrgent: true,
      isOverdue: false,
    };
  }
  if (days === 1) {
    return {
      days: 1,
      label: "Due tomorrow",
      isUrgent: true,
      isOverdue: false,
    };
  }
  return {
    days,
    label: `${days} days left`,
    isUrgent: days <= 2,
    isOverdue: false,
  };
}
