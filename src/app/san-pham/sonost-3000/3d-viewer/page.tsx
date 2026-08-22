"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import SonostViewer from "@/components/3d/SonostViewer";
import { SONOST_HOTSPOTS } from "@/components/3d/hotspot-data";
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
  Maximize2,
  Rotate3d,
  Box,
  Eye,
  Info,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

export default function Sonost30003DViewerPage() {
  const [globalData, setGlobalData] = useState<any>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [showTelemetryHUD, setShowTelemetryHUD] = useState<boolean>(true);
  const [showHotspotsTourBar, setShowHotspotsTourBar] = useState<boolean>(true);

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
    <div className="relative w-screen h-screen bg-slate-950 text-slate-100 overflow-hidden select-none flex flex-col justify-between">
      {/* ========================================================================= */}
      {/* 1. TOP CLINICAL STUDIO NAVIGATION BAR                                     */}
      {/* ========================================================================= */}
      <header className="absolute top-0 left-0 right-0 z-40 bg-slate-950/80 dark:bg-[#0b0f17]/85 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 shadow-xl">
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
            <div className="w-7 h-7 bg-[#0284c7] rounded-lg flex items-center justify-center text-white shadow-md shadow-sky-600/30">
              <Radio size={15} className="animate-spin" style={{ animationDuration: "10s" }} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="font-extrabold text-sm text-white tracking-tight">
                  OsteoSys Sonost 3000
                </span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400 text-[10px] font-mono-data font-bold hidden md:inline">
                  3D Studio 360°
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono-data hidden md:inline">
                Sonometer Medical CAD Inspection Suite
              </span>
            </div>
          </div>
        </div>

        {/* Center: 4 Quick Hotspot Selector Buttons (Desktop) */}
        <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
          {SONOST_HOTSPOTS.map((h) => (
            <button
              key={h.id}
              onClick={() => setSelectedHotspot(h.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedHotspot === h.id
                  ? "bg-[#0284c7] text-white font-bold shadow-md shadow-sky-500/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-cyan-500/30 text-cyan-300 flex items-center justify-center text-[10px] font-mono-data font-bold">
                {h.number}
              </span>
              <span>{h.title.replace("Vùng ", "").replace("Màn Hình ", "").replace("Máy In ", "")}</span>
            </button>
          ))}
        </div>

        {/* Right: Quick CTAs & HUD Toggles */}
        <div className="flex items-center gap-2">
          {/* Toggle HUD Button */}
          <button
            onClick={() => setShowTelemetryHUD(!showTelemetryHUD)}
            className={`p-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer hidden md:flex items-center gap-1.5 ${
              showTelemetryHUD
                ? "bg-slate-900 border-cyan-500/50 text-cyan-300"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Bật/Tắt bảng thông số lâm sàng HUD"
          >
            <Activity size={14} className={showTelemetryHUD ? "animate-pulse text-cyan-400" : ""} />
            <span className="text-[11px] font-mono-data">HUD</span>
          </button>

          {/* Request Quote CTA */}
          <Link
            href="/bao-gia?product=sonost-3000"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition-all hover:scale-105"
          >
            <span>Báo Giá &amp; Demo</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. FULLSCREEN 3D CANVAS VIEWPORT                                          */}
      {/* ========================================================================= */}
      <div className="relative w-full h-full pt-14 pb-0 flex-1 overflow-hidden">
        <SonostViewer
          defaultTheme="operating_dark"
          showFullscreenButton={true}
          showStandaloneLink={false}
          className="w-full h-full"
          initialHotspot={selectedHotspot}
          onHotspotChange={(id) => setSelectedHotspot(id)}
          immersive={true}
        />

        {/* Left-Side HUD: Realtime Clinical Telemetry Overlay */}
        <AnimatePresence>
          {showTelemetryHUD && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="absolute top-20 left-4 z-30 w-64 sm:w-72 p-4 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-sky-500/25 text-white shadow-2xl space-y-3 pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 font-mono-data uppercase tracking-wider">
                  <Activity size={14} className="animate-pulse text-cyan-400" />
                  <span>Clinical Telemetry</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-mono-data font-bold">
                  ● QUS VALID
                </span>
              </div>

              {/* Measurements Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono-data">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Vận tốc âm SOS</span>
                  <span className="text-base font-bold text-sky-300">1542 m/s</span>
                  <span className="text-[9px] text-emerald-400 block">CV ≤ 0.2%</span>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Độ suy giảm BUA</span>
                  <span className="text-base font-bold text-sky-300">65.4 dB/MHz</span>
                  <span className="text-[9px] text-emerald-400 block">CV ≤ 1.5%</span>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Chỉ số xương BQI</span>
                  <span className="text-base font-bold text-amber-400">88.2</span>
                  <span className="text-[9px] text-slate-400 block">ISCD Ref</span>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">T-Score WHO</span>
                  <span className="text-base font-bold text-amber-400">-1.2 SD</span>
                  <span className="text-[9px] text-amber-400 block">Thiếu xương nhẹ</span>
                </div>
              </div>

              {/* Patient Profile */}
              <div className="p-2 bg-slate-900/50 rounded-xl border border-slate-800/80 text-[11px] space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Vị trí khảo sát:</span>
                  <span className="text-slate-200 font-semibold">Xương gót Calcaneus</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Thời gian đo:</span>
                  <span className="text-emerald-400 font-bold">&lt; 15 giây</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Bức xạ tia X:</span>
                  <span className="text-emerald-400 font-bold">0 Rad (100% Sóng âm)</span>
                </div>
              </div>

              {/* Instructions Hint */}
              <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono-data pt-1 border-t border-slate-800/80">
                <Info size={11} className="text-cyan-400 shrink-0" />
                <span>Nhấp trực tiếp lên các điểm neo số 1-4 trên thân máy</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom-Left Hotspots Mini Drawer Toggle */}
        <div className="absolute bottom-20 left-4 z-30 hidden sm:block">
          <button
            onClick={() => setShowHotspotsTourBar(!showHotspotsTourBar)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-sky-500/40 transition-colors shadow-lg cursor-pointer"
          >
            <Sliders size={13} className="text-cyan-400" />
            <span>Thẻ điểm neo 3D</span>
            {showHotspotsTourBar ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </button>
        </div>

        {/* Bottom Expandable Hotspots Tour Strip (Desktop/Tablet) */}
        <AnimatePresence>
          {showHotspotsTourBar && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.25 }}
              className="absolute bottom-20 left-4 right-4 sm:right-auto z-20 sm:max-w-2xl hidden md:flex items-center gap-2 p-2 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 shadow-2xl overflow-x-auto"
            >
              {SONOST_HOTSPOTS.map((hotspot) => (
                <div
                  key={hotspot.id}
                  onClick={() => setSelectedHotspot(hotspot.id)}
                  className={`group shrink-0 p-2.5 rounded-xl border transition-all duration-200 cursor-pointer select-none min-w-[150px] sm:min-w-[160px] ${
                    selectedHotspot === hotspot.id
                      ? "bg-sky-950/90 border-cyan-400 text-white shadow-lg ring-1 ring-cyan-400/40"
                      : "bg-slate-900/70 border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-mono-data font-bold text-[10px] shadow-sm">
                      {hotspot.number}
                    </span>
                    <span className="text-[9px] font-mono-data text-cyan-300 px-1 py-0.2 rounded bg-slate-950">
                      {hotspot.badge.slice(0, 14)}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-white leading-tight line-clamp-1 group-hover:text-cyan-300">
                    {hotspot.title.replace("Vùng ", "").replace("Màn Hình ", "").replace("Máy In ", "")}
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {hotspot.shortDesc}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
