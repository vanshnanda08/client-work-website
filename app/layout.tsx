import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inkwell — Client Content Writing Dashboard",
  description: "Order high-impact written content, track pipeline status in real time, and review deliverables seamlessly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Resolve the saved theme before first paint so dark-mode users never
          see a flash of the light palette. Mirrors ThemeController, which takes
          over once React mounts.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("inkwell_appearance_v2");var t=s?JSON.parse(s).theme:"light";if(t==="system"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.dataset.theme=t;var d=s?JSON.parse(s).density:"comfortable";document.documentElement.dataset.density=d;}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-neutral-900 font-sans">
        {children}
      </body>
    </html>
  );
}
