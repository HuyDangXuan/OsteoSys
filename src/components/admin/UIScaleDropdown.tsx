"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  ChevronDown,
  Check,
  Sparkles,
} from "lucide-react";
import { useUIScale, UI_SCALE_CONFIGS, UIScaleLevel } from "@/components/providers/ui-scale-provider";

export function UIScaleDropdown({ className = "" }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    scale,
    setScale,
    increaseScale,
    decreaseScale,
    resetScale,
    levels,
    canIncrease,
    canDecrease,
    currentConfig,
  } = useUIScale();

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-mono-data font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs"
        title="Thu phóng giao diện (Ctrl + +, Ctrl + -, Ctrl + 0)"
        aria-label="Điều chỉnh thu phóng giao diện"
      >
        <ZoomIn size={13} className="text-[#0284c7] dark:text-cyan-400 shrink-0" />
        <span>{scale}%</span>
        <ChevronDown size={11} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 p-3 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 text-xs space-y-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                <Maximize2 size={13} className="text-[#0284c7] dark:text-cyan-400" />
                <span>Thu phóng Giao diện</span>
              </div>
              <button
                onClick={() => {
                  resetScale();
                }}
                disabled={scale === 100}
                className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-[#0284c7] dark:hover:text-cyan-400 disabled:opacity-40 flex items-center gap-1 font-medium transition-colors"
                title="Khôi phục 100%"
              >
                <RotateCcw size={10} />
                <span>100%</span>
              </button>
            </div>

            {/* Quick Step Buttons (- / +) */}
            <div className="flex items-center justify-between gap-2 p-1 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800/80">
              <button
                onClick={() => decreaseScale()}
                disabled={!canDecrease}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 rounded text-slate-700 dark:text-slate-200 font-semibold shadow-2xs transition-colors"
                title="Giảm 1 nấc (Ctrl + -)"
              >
                <ZoomOut size={12} />
                <span>Thu nhỏ</span>
              </button>

              <span className="font-mono-data font-bold text-xs text-[#0284c7] dark:text-cyan-400 px-2">
                {scale}%
              </span>

              <button
                onClick={() => increaseScale()}
                disabled={!canIncrease}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 rounded text-slate-700 dark:text-slate-200 font-semibold shadow-2xs transition-colors"
                title="Tăng 1 nấc (Ctrl + +)"
              >
                <ZoomIn size={12} />
                <span>Phóng to</span>
              </button>
            </div>

            {/* 5 Preset Scale Levels */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Mốc tỷ lệ tiêu chuẩn
              </span>
              <div className="grid grid-cols-5 gap-1 pt-0.5">
                {levels.map((lvl) => {
                  const isSelected = scale === lvl;
                  return (
                    <button
                      key={lvl}
                      onClick={() => {
                        setScale(lvl);
                        setIsOpen(false);
                      }}
                      className={`py-1.5 rounded text-xs font-mono-data font-semibold transition-all ${
                        isSelected
                          ? "bg-[#0284c7] dark:bg-cyan-600 text-white shadow-2xs"
                          : "bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      {lvl}%
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current level description */}
            <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-lg text-[11px] text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800/80 space-y-0.5">
              <div className="font-semibold text-slate-700 dark:text-slate-300">
                {currentConfig.sublabel}
              </div>
              <p className="text-[10px] leading-tight">{currentConfig.description}</p>
            </div>

            {/* Shortcut hint */}
            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800">
              <span>Phím tắt toàn cục:</span>
              <span className="font-mono-data">Ctrl + / - / 0</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
