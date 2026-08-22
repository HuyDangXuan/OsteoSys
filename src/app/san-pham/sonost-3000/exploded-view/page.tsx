"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import SonostExplodedViewer from "@/components/3d/SonostExplodedViewer";
import { EXPLODED_PARTS } from "@/components/3d/exploded-parts-data";
import { getCmsContent } from "@/lib/actions/cms";
import {
  Radio,
  Sparkles,
  Award,
  ChevronRight,
  ChevronLeft,
  Download,
  Phone,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Sliders,
  Layers,
  FileSpreadsheet,
  Printer,
  Rotate3d,
  Box,
  Cpu,
  Tv,
  Footprints,
  Info,
  Wrench,
} from "lucide-react";

export default function Sonost3000ExplodedViewPage() {
  const [globalData, setGlobalData] = useState<any>(null);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [showModulesHUD, setShowModulesHUD] = useState<boolean>(true);

  useEffect(() => {
    async function loadGlobal() {
      try {
        const res = await getCmsContent("global");
        setGlobalData(res.data);
      } catch (e) {
        console.error("Failed to load global data:", e);
      }
    }
    loadGlobal();
  }, []);

  return (
    <div className="relative w-screen h-screen bg-[#070a0f] text-slate-100 overflow-hidden select-none flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950">
      {/* ========================================================================= */}
      {/* 1. TOP CLINICAL ENGINEERING NAVIGATION BAR                                */}
      {/* ========================================================================= */}
      <header className="absolute top-0 left-0 right-0 z-40 bg-slate-950/85 dark:bg-[#070a0f]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 shadow-xl">
        {/* Left: Brand, Back Button & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <Link
            href="/san-pham/sonost-3000"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:bg-slate-800 hover:border-sky-500/50 text-slate-200 text-xs font-semibold transition-all group"
            title="Quay về trang chi tiết sản phẩm Sonost 3000"
          >
            <ChevronLeft size={16} className="text-sky-400 transform group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Về Trang Sản Phẩm</span>
            <span className="sm:hidden">Quay lại</span>
          </Link>

          <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />

          {/* Logo & Product Title */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-tr from-[#0284c7] to-cyan-500 rounded-lg flex items-center justify-center text-white shadow-md shadow-sky-600/30">
              <Box size={16} className="animate-spin" style={{ animationDuration: "12s" }} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="font-extrabold text-sm text-white tracking-tight">
                  Sonost 3000 Exploded View
                </span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400 text-[10px] font-mono-data font-bold hidden md:inline">
                  3D CAD Disassembly
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono-data hidden md:inline">
                Bóc Tách Cấu Trúc Cơ - Âm - Điện Tử Y Khoa
              </span>
            </div>
          </div>
        </div>

        {/* Center: Switch to 3D Whole Studio Mode */}
        <div className="hidden lg:flex items-center gap-2">
          <Link
            href="/san-pham/sonost-3000/3d-viewer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 text-slate-300 text-xs font-semibold transition-all group"
          >
            <Rotate3d size={14} className="text-cyan-400 group-hover:rotate-45 transition-transform" />
            <span>Chuyển Sang Mô Hình 3D Nguyên Khối (360° Studio)</span>
          </Link>
        </div>

        {/* Right: Quick CTAs & HUD Toggles */}
        <div className="flex items-center gap-2">
          {/* Toggle HUD Button */}
          <button
            onClick={() => setShowModulesHUD(!showModulesHUD)}
            className={`p-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer hidden md:flex items-center gap-1.5 ${
              showModulesHUD
                ? "bg-slate-900 border-cyan-500/50 text-cyan-300"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Bật/Tắt danh mục 7 phân hệ linh kiện"
          >
            <Sliders size={14} className={showModulesHUD ? "text-cyan-400" : ""} />
            <span className="text-[11px] font-mono-data">7 Modules</span>
          </button>

          {/* Request Quote CTA */}
          <Link
            href="/bao-gia?product=sonost-3000&mode=parts"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition-all hover:scale-105"
          >
            <span>Báo Giá Phụ Tùng</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. FULLSCREEN 3D EXPLODED CANVAS VIEWPORT                                 */}
      {/* ========================================================================= */}
      <div className="relative w-full h-full pt-14 pb-0 flex-1 overflow-hidden">
        <SonostExplodedViewer
          className="w-full h-full"
          initialPartId={selectedPartId}
          initialProgress={0.7}
        />

        {/* Left-Side HUD: 7 Modules Checklist Overlay */}
        <AnimatePresence>
          {showModulesHUD && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="absolute top-20 left-4 z-30 w-64 sm:w-72 p-4 rounded-3xl bg-slate-950/85 backdrop-blur-2xl border border-sky-500/25 text-white shadow-2xl space-y-3 pointer-events-auto max-h-[75vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 font-mono-data uppercase tracking-wider">
                  <Wrench size={14} className="text-cyan-400" />
                  <span>7 Phân Hệ Linh Kiện</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 text-[10px] font-mono-data font-bold">
                  BME SPEC
                </span>
              </div>

              {/* Modules List */}
              <div className="space-y-1 text-xs">
                {EXPLODED_PARTS.map((part) => (
                  <button
                    key={part.id}
                    onClick={() => setSelectedPartId(part.id)}
                    className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between gap-2 group cursor-pointer ${
                      selectedPartId === part.id
                        ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-400/30"
                        : "hover:bg-slate-900/90 text-slate-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span
                        className={`flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-mono-data font-bold shrink-0 ${
                          selectedPartId === part.id
                            ? "bg-slate-950 text-cyan-400"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {part.number}
                      </span>
                      <span className="truncate text-[11px]">{part.name.split(" (")[0]}</span>
                    </div>
                    <span
                      className={`text-[9px] font-mono-data shrink-0 ${
                        selectedPartId === part.id ? "text-slate-950 font-bold" : "text-slate-400"
                      }`}
                    >
                      {part.partNumber.slice(4)}
                    </span>
                  </button>
                ))}
              </div>

              {/* Medical Grade Guarantee */}
              <div className="p-2.5 bg-slate-900/60 rounded-2xl border border-slate-800/80 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono-data">
                  <ShieldCheck size={13} />
                  <span>Phụ Tùng Chính Hãng OsteoSys</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">
                  Đầy đủ CO/CQ, đạt chứng nhận CE/FDA và hồ sơ kiểm định chất lượng định kỳ.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
