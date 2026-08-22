"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { Sonost3DToolbar, EnvironmentTheme } from "./Sonost3DToolbar";
import { HotspotDrawer } from "./HotspotDrawer";
import { SONOST_HOTSPOTS } from "./hotspot-data";
import {
  Activity,
  Radio,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  Maximize2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

// Dynamic import with SSR false for Canvas rendering
const SonostCanvas = dynamic(() => import("./SonostCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[480px] flex flex-col items-center justify-center bg-slate-950 text-white p-6">
      <div className="relative flex items-center justify-center w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border border-sky-400/30 animate-ping" />
        <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/50">
          <Radio size={20} className="text-white animate-spin" />
        </div>
      </div>
      <div className="text-sm font-semibold text-sky-300 flex items-center gap-2">
        <Activity size={16} className="animate-pulse text-cyan-400" />
        <span>Đang khởi tạo WebGL 3D Canvas...</span>
      </div>
      <div className="text-xs text-slate-400 mt-2 font-mono-data">
        OsteoSys Medical Diagnostics 3D
      </div>
    </div>
  ),
});

export interface SonostViewerProps {
  modelUrl?: string;
  defaultTheme?: EnvironmentTheme;
  showFullscreenButton?: boolean;
  showStandaloneLink?: boolean;
  className?: string;
  initialHotspot?: string | null;
  compact?: boolean;
  immersive?: boolean;
  onHotspotChange?: (id: string | null) => void;
}

export function SonostViewer({
  modelUrl,
  defaultTheme = "clinic",
  showFullscreenButton = true,
  showStandaloneLink = false,
  className = "w-full h-full rounded-2xl overflow-hidden shadow-xl",
  initialHotspot = null,
  compact = false,
  immersive = false,
  onHotspotChange,
}: SonostViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeHotspot, setActiveHotspot] = useState<string | null>(initialHotspot);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [envTheme, setEnvTheme] = useState<EnvironmentTheme>(defaultTheme);
  const [presetView, setPresetView] = useState<"overview" | "front" | "top" | "side" | "rear" | "iso" | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync initialHotspot from parent when clicked outside
  useEffect(() => {
    if (initialHotspot !== undefined) {
      setActiveHotspot(initialHotspot);
      if (initialHotspot) {
        setAutoRotate(false);
        setPresetView(null);
      }
    }
  }, [initialHotspot]);

  // Auto idle detection: start subtle rotation after 5s idle if no active hotspot
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    // Pause auto-rotate during active user interaction
    if (!activeHotspot) {
      idleTimerRef.current = setTimeout(() => {
        setAutoRotate(true);
      }, 5000);
    }
  }, [activeHotspot]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  const handleUserInteract = () => {
    resetIdleTimer();
  };

  const handleSelectHotspot = (id: string) => {
    setActiveHotspot(id);
    setAutoRotate(false);
    setPresetView(null);
    onHotspotChange?.(id);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
  };

  const handleCloseHotspot = () => {
    setActiveHotspot(null);
    setPresetView("overview");
    onHotspotChange?.(null);
    resetIdleTimer();
  };

  const handleResetCamera = () => {
    setActiveHotspot(null);
    setPresetView("overview");
    setWireframe(false);
    setShowHotspots(true);
    onHotspotChange?.(null);
    resetIdleTimer();
    showToast("Đã đặt lại góc nhìn mặc định");
  };

  const handlePresetView = (view: "overview" | "front" | "top" | "side" | "rear" | "iso") => {
    setActiveHotspot(null);
    setPresetView(view);
    setAutoRotate(false);
    resetIdleTimer();
  };

  // Snapshot capture
  const handleTakeSnapshot = () => {
    try {
      const canvas = containerRef.current?.querySelector("canvas");
      if (canvas) {
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `osteosys-sonost-3000-3d-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = dataUrl;
        link.click();
        showToast("Đã tải ảnh chụp 3D Sonost 3000 (PNG)!");
      }
    } catch (e) {
      console.error("Snapshot error:", e);
      showToast("Không thể chụp ảnh từ canvas!");
    }
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  return (
    <div
      ref={containerRef}
      className={`relative group bg-slate-950 select-none ${className} ${
        isFullscreen ? "h-screen w-screen rounded-none border-0" : ""
      }`}
      onPointerDown={handleUserInteract}
      onTouchStart={handleUserInteract}
    >
      {/* 1. Top Glassmorphism Status Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 dark:bg-slate-900/85 backdrop-blur-md border border-slate-700/60 text-white shadow-lg text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-100">Sonost 3000</span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-sky-300 font-mono-data text-[11px] hidden sm:inline">
            3D Clinical Interactive
          </span>
        </div>

        {/* Hotspot Direct Selector Pills */}
        {!compact && (
          <div className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-slate-950/70 backdrop-blur-md border border-slate-800 text-white">
            {SONOST_HOTSPOTS.map((h) => (
              <button
                key={h.id}
                onClick={() => handleSelectHotspot(h.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                  activeHotspot === h.id
                    ? "bg-[#0284c7] text-white font-bold shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {h.number}. {h.title.replace("Vùng ", "").replace("Màn Hình ", "").replace("Máy In ", "")}
              </button>
            ))}
          </div>
        )}

        {/* Link to Full Standalone 3D Page if requested */}
        {showStandaloneLink && (
          <Link
            href="/san-pham/sonost-3000/3d-viewer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0284c7]/90 hover:bg-[#0284c7] text-white text-xs font-semibold shadow-md transition-all hover:scale-105"
            title="Mở toàn trang 3D Studio"
          >
            <span>Mở 3D Studio</span>
            <ExternalLink size={13} />
          </Link>
        )}
      </div>

      {/* 2. Top-Right Instructions / Hints */}
      <div className="absolute top-4 right-4 z-20 hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/70 backdrop-blur-md border border-slate-800/80 text-[11px] text-slate-300 pointer-events-none font-mono-data">
        <Info size={13} className="text-cyan-400" />
        <span>Kéo chuột để xoay 360° • Cuộn để thu phóng</span>
      </div>

      {/* 3. Main 3D Canvas Scene */}
      <SonostCanvas
        ref={canvasRef}
        modelUrl={modelUrl}
        wireframe={wireframe}
        activeHotspot={activeHotspot}
        onSelectHotspot={handleSelectHotspot}
        autoRotate={autoRotate}
        onUserInteract={handleUserInteract}
        showHotspots={showHotspots}
        envTheme={envTheme}
        presetView={presetView}
        className="w-full h-full"
      />

      {/* 4. Active Hotspot Clinical Detail Drawer */}
      <HotspotDrawer
        activeHotspotId={activeHotspot}
        onClose={handleCloseHotspot}
        onSelectHotspot={handleSelectHotspot}
      />

      {/* 5. Bottom Floating 3D Controls Toolbar */}
      <Sonost3DToolbar
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
        wireframe={wireframe}
        onToggleWireframe={() => setWireframe(!wireframe)}
        showHotspots={showHotspots}
        onToggleHotspots={() => setShowHotspots(!showHotspots)}
        onResetCamera={handleResetCamera}
        envTheme={envTheme}
        onChangeEnvTheme={(theme) => setEnvTheme(theme)}
        onTakeSnapshot={handleTakeSnapshot}
        onPresetView={handlePresetView}
        isFullscreen={isFullscreen}
        onToggleFullscreen={showFullscreenButton ? handleToggleFullscreen : undefined}
      />

      {/* 6. Quick Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl bg-cyan-600/90 text-white font-medium text-xs shadow-xl backdrop-blur-md border border-cyan-400/40 animate-in fade-in zoom-in-95 font-mono-data">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default SonostViewer;
