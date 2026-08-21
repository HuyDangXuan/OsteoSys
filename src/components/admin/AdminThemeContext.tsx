"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useTheme } from "next-themes";

type Theme = "light" | "dark";

interface AdminContextType {
  theme: Theme;
  toggleTheme: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { theme: currentTheme, setTheme, resolvedTheme } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedSidebar = localStorage.getItem("osteosys-sidebar-collapsed");
    if (savedSidebar !== null) {
      setIsSidebarCollapsed(savedSidebar === "true");
    }
  }, []);

  const theme: Theme = (resolvedTheme === "dark" ? "dark" : "light");

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("osteosys-sidebar-collapsed", String(next));
      return next;
    });
  };

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AdminContext.Provider
      value={{
        theme,
        toggleTheme,
        isSidebarCollapsed,
        toggleSidebar,
        isMobileSidebarOpen,
        setMobileSidebarOpen,
        isCommandPaletteOpen,
        setCommandPaletteOpen,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
