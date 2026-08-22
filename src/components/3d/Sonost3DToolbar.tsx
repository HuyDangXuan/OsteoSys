"use client";

import React, { useState } from "react";
import {
  Rotate3d,
  Box,
  RotateCcw,
  MapPin,
  Sun,
  Moon,
  Sparkles,
  Camera,
  Maximize,
  Minimize,
  Eye,
  Sliders,
  Layers,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

export type EnvironmentTheme = "clinic" | "operating_dark" | "clean_studio";

interface Sonost3DToolbarProps {
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  wireframe: boolean;
  onToggleWireframe: () => void;
  showHotspots: boolean;
  onToggleHotspots: () => void;
  onResetCamera: () => void;
  envTheme: EnvironmentTheme;
  onChangeEnvTheme: (theme: EnvironmentTheme) => void;
  onTakeSnapshot: () => void;
  onPresetView: (view: "overview" | "front" | "top" | "side" | "rear" | "iso") => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function Sonost3DToolbar({
  autoRotate,
  onToggleAutoRotate,
  wireframe,
  onToggleWireframe,
  showHotspots,
  onToggleHotspots,
  onResetCamera,
  envTheme,
  onChangeEnvTheme,
  onTakeSnapshot,
  onPresetView,
  isFullscreen = false,
  onToggleFullscreen,
}: Sonost3DToolbarProps) {
  const [showViewsMenu, setShowViewsMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-[95%] sm:max-w-none">
      <div className="flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-slate-700/60 shadow-2xl text-white select-none">
        {/* 1. Auto Rotate 360 */}
        <button
          onClick={onToggleAutoRotate}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
            autoRotate
              ? "bg-[#0284c7] text-white shadow-md shadow-sky-500/30"
              : "text-slate-300 hover:text-white hover:bg-slate-800/80"
          }`}
          title="Bật/Tắt tự động xoay 360°"
        >
          <Rotate3d size={15} className={autoRotate ? "animate-spin" : ""} style={{ animationDuration: "10s" }} />
          <span className="hidden sm:inline">Xoay 360°</span>
        </button>

        {/* 2. Wireframe / X-Ray Mode */}
        <button
          onClick={onToggleWireframe}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
            wireframe
              ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-400/40 ring-2 ring-cyan-300/40"
              : "text-slate-300 hover:text-white hover:bg-slate-800/80"
          }`}
          title="Chế độ khung dây X-Ray (Quan sát cấu trúc kỹ thuật)"
        >
          <Box size={15} />
          <span className="hidden sm:inline">X-Ray</span>
        </button>

        {/* 3. Toggle Hotspots */}
        <button
          onClick={onToggleHotspots}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
            showHotspots
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/80"
          }`}
          title="Bật/Tắt điểm chú thích lâm sàng"
        >
          <MapPin size={15} />
          <span className="hidden sm:inline">Điểm neo</span>
        </button>

        <div className="w-[1px] h-5 bg-slate-700/60 my-auto mx-0.5" />

        {/* 4. Preset Camera Views Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowViewsMenu(!showViewsMenu);
              setShowThemeMenu(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
            title="Chọn góc nhìn nhanh"
          >
            <Eye size={15} />
            <span className="hidden md:inline">Góc nhìn</span>
            {showViewsMenu ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </button>

          {showViewsMenu && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 p-1 rounded-xl bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl space-y-0.5 animate-in fade-in zoom-in-95">
              {[
                { key: "overview", label: "Toàn cảnh (Default)" },
                { key: "front", label: "Mặt trước (Màn hình 7\")" },
                { key: "rear", label: "Mặt sau (Máy in 58mm & I/O)" },
                { key: "top", label: "Từ trên xuống" },
                { key: "side", label: "Bên hông (Đầu dò Calcaneus)" },
                { key: "iso", label: "Góc nghiêng Isometric" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    onPresetView(item.key as any);
                    setShowViewsMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-[#0284c7] hover:text-white transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 5. Environment Theme Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setShowThemeMenu(!showThemeMenu);
              setShowViewsMenu(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
            title="Môi trường & Ánh sáng"
          >
            {envTheme === "clinic" ? (
              <Sun size={15} className="text-amber-400" />
            ) : envTheme === "operating_dark" ? (
              <Moon size={15} className="text-cyan-400" />
            ) : (
              <Sparkles size={15} className="text-sky-300" />
            )}
            <span className="hidden md:inline">Môi trường</span>
          </button>

          {showThemeMenu && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 p-1 rounded-xl bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl space-y-0.5 animate-in fade-in zoom-in-95">
              <button
                onClick={() => {
                  onChangeEnvTheme("clinic");
                  setShowThemeMenu(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  envTheme === "clinic"
                    ? "bg-[#0284c7] text-white font-semibold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Sun size={14} className="text-amber-400" />
                <span>Phòng khám ban ngày</span>
              </button>

              <button
                onClick={() => {
                  onChangeEnvTheme("operating_dark");
                  setShowThemeMenu(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  envTheme === "operating_dark"
                    ? "bg-[#0284c7] text-white font-semibold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Moon size={14} className="text-cyan-400" />
                <span>Dark Mode phòng mổ</span>
              </button>

              <button
                onClick={() => {
                  onChangeEnvTheme("clean_studio");
                  setShowThemeMenu(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  envTheme === "clean_studio"
                    ? "bg-[#0284c7] text-white font-semibold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Sparkles size={14} className="text-sky-300" />
                <span>Studio Chẩn Đoán</span>
              </button>
            </div>
          )}
        </div>

        <div className="w-[1px] h-5 bg-slate-700/60 my-auto mx-0.5" />

        {/* 6. Reset Camera */}
        <button
          onClick={onResetCamera}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
          title="Đặt lại góc nhìn mặc định"
        >
          <RotateCcw size={15} />
          <span className="hidden lg:inline">Đặt lại</span>
        </button>

        {/* 7. Take Snapshot */}
        <button
          onClick={onTakeSnapshot}
          className="flex items-center justify-center p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
          title="Chụp ảnh góc nhìn 3D (PNG)"
        >
          <Camera size={15} />
        </button>

        {/* 8. Fullscreen Toggle */}
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="flex items-center justify-center p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
            title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
          >
            {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default Sonost3DToolbar;
