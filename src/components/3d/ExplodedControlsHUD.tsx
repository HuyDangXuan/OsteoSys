"use client";

import React, { useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Box,
  Layers,
  Camera,
  Eye,
  Sparkles,
  Maximize,
  Minimize,
  Radio,
  Activity,
  Printer,
  Cpu,
  Footprints,
  Tv,
} from "lucide-react";
import { EXPLODED_PARTS } from "./exploded-parts-data";

interface ExplodedControlsHUDProps {
  explodeProgress: number;
  onExplodeChange: (val: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  focusedPartId: string | null;
  onSelectPart: (id: string | null) => void;
  wireframe: boolean;
  onToggleWireframe: () => void;
  showGuideLines: boolean;
  onToggleGuideLines: () => void;
  onResetCamera: () => void;
  onTakeSnapshot: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function ExplodedControlsHUD({
  explodeProgress,
  onExplodeChange,
  isPlaying,
  onTogglePlay,
  focusedPartId,
  onSelectPart,
  wireframe,
  onToggleWireframe,
  showGuideLines,
  onToggleGuideLines,
  onResetCamera,
  onTakeSnapshot,
  isFullscreen = false,
  onToggleFullscreen,
}: ExplodedControlsHUDProps) {
  const percent = Math.round(explodeProgress * 100);

  const presetSteps = [
    { id: null, label: "Toàn bộ máy", icon: Layers, partId: null },
    { id: "transducers", label: "Đầu dò 0.5MHz", icon: Radio, partId: "transducers" },
    { id: "rear_printer", label: "Máy in mặt sau", icon: Printer, partId: "rear_printer" },
    { id: "dsp_motherboard", label: "Bo mạch DSP", icon: Cpu, partId: "dsp_motherboard" },
    { id: "lcd_screen", label: "Màn hình 7\"", icon: Tv, partId: "lcd_screen" },
    { id: "foot_cradle", label: "Khay gót chân", icon: Footprints, partId: "foot_cradle" },
  ];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-[96%] xl:max-w-5xl">
      <div className="flex flex-col gap-2.5 p-3 sm:p-4 rounded-3xl bg-slate-950/85 dark:bg-[#070a0f]/90 backdrop-blur-2xl border border-sky-500/30 shadow-2xl text-white select-none">
        {/* ========================================================================= */}
        {/* TOP ROW: SLIDER TỶ LỆ TÁCH RỜI & PLAY/PAUSE                               */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between w-full">
          {/* Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer shrink-0 ${
              isPlaying
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950 ring-2 ring-amber-300/50 animate-pulse"
                : "bg-gradient-to-r from-[#0284c7] to-cyan-500 hover:from-[#0369a1] hover:to-cyan-400 text-white shadow-sky-600/30"
            }`}
            title={isPlaying ? "Tạm dừng diễn hoạt" : "Tự động diễn hoạt bung tách liên tục"}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} className="fill-current" />}
            <span className="font-mono-data">
              {isPlaying ? "Đang Diễn Hoạt" : "Tự Động Bung Tách"}
            </span>
          </button>

          {/* Slider Container */}
          <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
            <span className="text-xs font-mono-data text-slate-400 hidden md:inline whitespace-nowrap">
              Độ Tách 3D:
            </span>

            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={percent}
                onChange={(e) => {
                  onExplodeChange(Number(e.target.value) / 100);
                }}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
              />
            </div>

            {/* Percentage Display & Snaps */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 font-mono-data font-bold text-xs min-w-[54px] text-center">
                {percent}%
              </span>

              {/* Quick Snaps */}
              <div className="hidden lg:flex items-center gap-1">
                {[0, 50, 100].map((val) => (
                  <button
                    key={val}
                    onClick={() => onExplodeChange(val / 100)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono-data transition-colors cursor-pointer ${
                      percent === val
                        ? "bg-cyan-500 text-slate-950 font-bold"
                        : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Utility Toggles */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Wireframe */}
            <button
              onClick={onToggleWireframe}
              className={`p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                wireframe
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
              title="Chế độ khung dây X-Ray"
            >
              <Box size={15} />
            </button>

            {/* Guide Lines Toggle */}
            <button
              onClick={onToggleGuideLines}
              className={`p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                showGuideLines
                  ? "bg-emerald-600 text-white font-bold shadow-xs"
                  : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title="Bật/Tắt đường chỉ hướng linh kiện 3D"
            >
              <Sparkles size={15} />
            </button>

            {/* Reset Camera */}
            <button
              onClick={onResetCamera}
              className="p-2 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Đặt lại góc nhìn toàn cảnh"
            >
              <RotateCcw size={15} />
            </button>

            {/* Take Snapshot */}
            <button
              onClick={onTakeSnapshot}
              className="p-2 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Chụp ảnh góc nhìn 3D (PNG)"
            >
              <Camera size={15} />
            </button>

            {/* Fullscreen */}
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="p-2 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
              >
                {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM ROW: 6 PRESET FOCUS STEPS (CÁC BƯỚC KHÁM PHÁ LINH KIỆN NHANH)      */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-800/80 pb-0.5 scrollbar-none">
          <span className="text-[11px] font-mono-data text-cyan-400 uppercase tracking-wider font-semibold mr-1 shrink-0 hidden sm:inline">
            Khám phá:
          </span>

          {presetSteps.map((step) => {
            const Icon = step.icon;
            const isSelected =
              step.partId === focusedPartId || (step.partId === null && focusedPartId === null);

            return (
              <button
                key={step.label}
                onClick={() => {
                  onSelectPart(step.partId);
                  // If picking a part, ensure explodeProgress > 0.4 to clearly see it
                  if (step.partId && explodeProgress < 0.45) {
                    onExplodeChange(0.75);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-[#0284c7] text-white shadow-md shadow-sky-500/30 scale-105 ring-1 ring-sky-300/40"
                    : "bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800/90"
                }`}
              >
                <Icon size={13} className={isSelected ? "text-cyan-200" : "text-sky-400"} />
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ExplodedControlsHUD;
