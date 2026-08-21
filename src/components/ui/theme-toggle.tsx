"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Laptop } from "lucide-react";

/**
 * 1. ThemeToggleSimple: Circular button with smooth 90deg morphing animation
 * Ideal for Client Portal Header
 */
export function ThemeToggleSimple({ className = "" }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-400 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      onClick={handleToggle}
      className={`relative w-9 h-9 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/70 hover:border-[#0284c7] dark:hover:border-cyan-500/50 flex items-center justify-center transition-colors shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0284c7] dark:focus-visible:ring-cyan-400 ${className}`}
      title={isDark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
      aria-label="Chuyển đổi giao diện Sáng / Tối"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="text-cyan-400 flex items-center justify-center"
          >
            <Moon size={17} strokeWidth={2.2} />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="text-amber-500 flex items-center justify-center"
          >
            <Sun size={17} strokeWidth={2.2} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/**
 * 2. ThemeSelectDropdown / Segmented Pill: 3 modes (Light, Dark, System)
 * Ideal for Admin Topbar & Settings
 */
export function ThemeSelectDropdown({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`h-8 w-28 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 animate-pulse ${className}`}
      />
    );
  }

  const options = [
    { id: "light", label: "Sáng", icon: Sun, activeColor: "text-amber-600 dark:text-amber-400" },
    { id: "dark", label: "Tối", icon: Moon, activeColor: "text-cyan-600 dark:text-cyan-400" },
    { id: "system", label: "Hệ thống", icon: Laptop, activeColor: "text-indigo-600 dark:text-indigo-400" },
  ];

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs select-none ${className}`}
    >
      {options.map((opt) => {
        const isActive = theme === opt.id;
        const Icon = opt.icon;

        return (
          <button
            key={opt.id}
            onClick={() => setTheme(opt.id)}
            className={`relative flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
              isActive
                ? `${opt.activeColor} font-semibold`
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
            title={`Chế độ ${opt.label}`}
          >
            {isActive && (
              <motion.div
                layoutId="theme-active-pill"
                className="absolute inset-0 bg-white dark:bg-slate-800 rounded-md shadow-xs border border-slate-200/60 dark:border-slate-700/60 z-0"
                transition={{ type: "spring", damping: 26, stiffness: 350 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              <Icon size={13} strokeWidth={2} />
              <span className="hidden sm:inline">{opt.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
