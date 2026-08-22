"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { EXPLODED_PARTS, ExplodedPartData } from "./exploded-parts-data";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  Clock,
  Activity,
  FileSpreadsheet,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface ExplodedPartDrawerProps {
  partId: string | null;
  onClose: () => void;
  onSelectPart: (id: string) => void;
}

export function ExplodedPartDrawer({
  partId,
  onClose,
  onSelectPart,
}: ExplodedPartDrawerProps) {
  if (!partId) return null;

  const currentIndex = EXPLODED_PARTS.findIndex((p) => p.id === partId);
  const currentPart = EXPLODED_PARTS[currentIndex] || EXPLODED_PARTS[0];

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + EXPLODED_PARTS.length) % EXPLODED_PARTS.length;
    onSelectPart(EXPLODED_PARTS[prevIdx].id);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % EXPLODED_PARTS.length;
    onSelectPart(EXPLODED_PARTS[nextIdx].id);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPart.id}
        initial={{ opacity: 0, x: 50, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 50, scale: 0.95 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="absolute top-18 right-4 z-40 w-full max-w-[360px] sm:max-w-[420px] max-h-[82vh] overflow-y-auto rounded-3xl bg-slate-950/90 dark:bg-slate-900/95 backdrop-blur-2xl border border-sky-500/30 text-white shadow-2xl p-5 space-y-4 select-none"
      >
        {/* Header: Number, Part Code, Close */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-mono-data font-bold text-xs shadow-md">
                {currentPart.number}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono-data font-bold">
                {currentPart.partNumber}
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight leading-snug">
              {currentPart.name}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono-data">
              {currentPart.koreanName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer shrink-0"
            title="Đóng / Xem toàn cảnh"
          >
            <X size={18} />
          </button>
        </div>

        {/* Standard Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-950/70 border border-sky-500/30 text-cyan-300 text-xs font-mono-data font-semibold">
          <Sparkles size={13} className="text-cyan-400" />
          <span>{currentPart.badge}</span>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-300 leading-relaxed">
          {currentPart.shortDesc}
        </p>

        {/* Clinical Function */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="text-[11px] font-bold text-cyan-400 font-mono-data uppercase tracking-wider flex items-center gap-1.5">
            <Activity size={13} />
            <span>Chức Năng Lâm Sàng &amp; Vận Hành</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            {currentPart.clinicalFunction}
          </p>
        </div>

        {/* Maintenance & Replacement Schedule */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono-data">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center gap-1 text-amber-400 text-[10px] uppercase font-bold">
              <Wrench size={12} />
              <span>Bảo dưỡng định kỳ</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug font-sans">
              {currentPart.maintenanceSchedule}
            </p>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center gap-1 text-emerald-400 text-[10px] uppercase font-bold">
              <Clock size={12} />
              <span>Chu kỳ thay thế</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug font-sans">
              {currentPart.replacementCycle}
            </p>
          </div>
        </div>

        {/* Inspection Tips */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="text-[11px] font-bold text-emerald-400 font-mono-data uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={13} />
            <span>Quy Trình Kiểm Tra Kỹ Thuật (BME)</span>
          </div>
          <ul className="space-y-1 text-xs text-slate-300">
            {currentPart.inspectionTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-[11px] leading-relaxed">
                <CheckCircle2 size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Technical Specs Table */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="text-[11px] font-bold text-sky-400 font-mono-data uppercase tracking-wider flex items-center gap-1.5">
            <FileSpreadsheet size={13} />
            <span>Thông Số Kỹ Thuật Chi Tiết</span>
          </div>
          <div className="space-y-1 bg-slate-900/60 rounded-xl p-3 border border-slate-800 text-xs">
            {currentPart.specs.map((item, idx) => (
              <div key={idx} className="flex justify-between items-baseline gap-2 py-0.5 border-b border-slate-800/40 last:border-0">
                <span className="text-slate-400 text-[11px]">{item.label}:</span>
                <span className="text-slate-100 font-semibold text-[11px] text-right font-mono-data">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button: Báo giá linh kiện & Navigation */}
        <div className="space-y-2 pt-3 border-t border-slate-800">
          <Link
            href={`/bao-gia?part=${currentPart.partNumber}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0284c7] to-cyan-500 hover:from-[#0369a1] hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition-all hover:scale-[1.02]"
          >
            <span>Yêu Cầu Báo Giá / Thay Thế Phụ Tùng Này</span>
            <ChevronRight size={14} />
          </Link>

          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              <ChevronLeft size={13} />
              <span>Trước</span>
            </button>

            <span className="text-[11px] font-mono-data text-slate-400">
              {currentIndex + 1} / {EXPLODED_PARTS.length} Linh Kiện
            </span>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              <span>Tiếp theo</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ExplodedPartDrawer;
