"use client";

import { useTheme } from "next-themes";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  const { theme = "system" } = useTheme();

  return (
    <SonnerToaster
      theme={theme as "light" | "dark" | "system"}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        className:
          "font-sans text-xs border border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 shadow-lg",
        duration: 4000,
      }}
    />
  );
}
