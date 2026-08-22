"use client";

import React from "react";
import { Html, useProgress } from "@react-three/drei";
import { Activity, Radio } from "lucide-react";

interface Clinical3DLoaderProps {
  customProgress?: number;
  statusText?: string;
}

export function Clinical3DLoader({
  customProgress,
  statusText = "Đang tải mô hình 3D...",
}: Clinical3DLoaderProps) {
  const { progress } = useProgress();
  const displayProgress = Math.round(customProgress !== undefined ? customProgress : progress);

  return (
    <Html center zIndexRange={[100, 0]}>
      <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-sky-500/30 text-white shadow-2xl min-w-[260px] select-none pointer-events-none transition-all duration-300">
        {/* Radar / Ultrasound Wave Pulse */}
        <div className="relative flex items-center justify-center w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border border-sky-400/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border border-sky-500/40 animate-pulse" />
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/40">
            <Radio size={20} className="text-white animate-spin" style={{ animationDuration: "6s" }} />
          </div>
        </div>

        {/* Gauge Progress Bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-2 mb-2 overflow-hidden border border-slate-700/60 p-0.5">
          <div
            className="bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300 ease-out shadow-xs"
            style={{ width: `${Math.max(displayProgress, 8)}%` }}
          />
        </div>

        {/* Status and Percentage */}
        <div className="flex items-center justify-between w-full text-xs font-mono-data">
          <span className="text-sky-300 flex items-center gap-1.5 font-medium">
            <Activity size={13} className="animate-pulse text-cyan-400" />
            <span>{statusText}</span>
          </span>
          <span className="font-bold text-white tracking-wider tabular-nums">{displayProgress}%</span>
        </div>

        <div className="text-[10px] text-slate-400 mt-2 tracking-wide uppercase font-mono-data">
          OsteoSys Medical 3D Engine
        </div>
      </div>
    </Html>
  );
}

export default Clinical3DLoader;
