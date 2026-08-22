"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SONOST_HOTSPOTS } from "./hotspot-data";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";

interface HotspotDrawerProps {
  activeHotspotId: string | null;
  onClose: () => void;
  onSelectHotspot: (id: string) => void;
}

export function HotspotDrawer({
  activeHotspotId,
  onClose,
  onSelectHotspot,
}: HotspotDrawerProps) {
  if (!activeHotspotId) return null;

  const currentIndex = SONOST_HOTSPOTS.findIndex((h) => h.id === activeHotspotId);
  const currentHotspot = SONOST_HOTSPOTS[currentIndex] || SONOST_HOTSPOTS[0];

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + SONOST_HOTSPOTS.length) % SONOST_HOTSPOTS.length;
    onSelectHotspot(SONOST_HOTSPOTS[prevIdx].id);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % SONOST_HOTSPOTS.length;
    onSelectHotspot(SONOST_HOTSPOTS[nextIdx].id);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentHotspot.id}
        initial={{ opacity: 0, x: 40, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 40, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="absolute top-4 right-4 z-30 w-full max-w-[340px] sm:max-w-[400px] max-h-[85vh] overflow-y-auto rounded-2xl bg-slate-950/85 dark:bg-slate-900/90 backdrop-blur-xl border border-sky-500/30 text-white shadow-2xl p-5 space-y-4 select-none"
      >
        {/* Header with Hotspot Number & Close Button */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-mono-data font-bold text-xs shadow-md">
                {currentHotspot.number}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-sky-950/80 border border-sky-500/40 text-cyan-300 text-[11px] font-mono-data uppercase tracking-wider font-semibold">
                {currentHotspot.badge}
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight leading-snug">
              {currentHotspot.title}
            </h3>
            <p className="text-xs text-sky-400 font-mono-data font-medium">
              {currentHotspot.subtitle}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Đóng / Xem toàn cảnh"
            aria-label="Đóng bảng thông tin"
          >
            <X size={18} />
          </button>
        </div>

        {/* Detailed Description */}
        <p className="text-xs text-slate-300 leading-relaxed">
          {currentHotspot.longDesc}
        </p>

        {/* Clinical Specifications List */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="text-[11px] font-bold text-cyan-400 font-mono-data uppercase tracking-wider flex items-center gap-1.5">
            <Activity size={13} />
            <span>Thông Số Kỹ Thuật Lâm Sàng</span>
          </div>

          <div className="space-y-1.5 bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 text-xs">
            {currentHotspot.specs.map((item, idx) => (
              <div key={idx} className="flex justify-between items-baseline gap-2 py-0.5 border-b border-slate-800/40 last:border-0">
                <span className="text-slate-400 text-[11px]">{item.label}:</span>
                <span className="text-slate-100 font-semibold text-[11px] text-right font-mono-data">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Advantages */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="text-[11px] font-bold text-emerald-400 font-mono-data uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={13} />
            <span>Ưu Điểm Lâm Sàng Nổi Bật</span>
          </div>

          <ul className="space-y-1 text-xs text-slate-300">
            {currentHotspot.clinicalAdvantages.map((adv, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-[11px] leading-relaxed">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{adv}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Navigation Footer (Prev / Next Hotspot Tour) */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <ChevronLeft size={14} />
            <span>Trước</span>
          </button>

          <span className="text-[11px] font-mono-data text-slate-400">
            {currentIndex + 1} / {SONOST_HOTSPOTS.length}
          </span>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-xs font-semibold text-white transition-colors cursor-pointer shadow-md shadow-sky-600/30"
          >
            <span>Tiếp theo</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default HotspotDrawer;
