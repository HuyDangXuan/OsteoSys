"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ExplodedControlsHUD } from "./ExplodedControlsHUD";
import { ExplodedPartDrawer } from "./ExplodedPartDrawer";
import { EXPLODED_PARTS } from "./exploded-parts-data";
import {
  Activity,
  Radio,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Rotate3d,
  Box,
  Layers,
  Info,
  Maximize2,
  ExternalLink,
} from "lucide-react";

// Dynamic import with SSR false for Exploded Canvas
const SonostExplodedCanvas = dynamic(() => import("./SonostExplodedCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-[#070a0f] text-white p-6">
      <div className="relative flex items-center justify-center w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border border-sky-400/30 animate-ping" />
        <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
          <Layers size={20} className="text-white animate-spin" />
        </div>
      </div>
      <div className="text-sm font-semibold text-cyan-300 flex items-center gap-2">
        <Activity size={16} className="animate-pulse text-cyan-400" />
        <span>Đang khởi tạo Engine Bóc Tách 3D Sonost 3000...</span>
      </div>
      <div className="text-xs text-slate-400 mt-2 font-mono-data">
        OsteoSys Medical Engineering 3D CAD
      </div>
    </div>
  ),
});

export interface SonostExplodedViewerProps {
  className?: string;
  initialPartId?: string | null;
  initialProgress?: number;
}

export function SonostExplodedViewer({
  className = "w-full h-full",
  initialPartId = null,
  initialProgress = 0.65,
}: SonostExplodedViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [explodeProgress, setExplodeProgress] = useState<number>(initialProgress);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [focusedPartId, setFocusedPartId] = useState<string | null>(initialPartId);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [showGuideLines, setShowGuideLines] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Animation Loop for Auto Play
  const animDirectionRef = useRef<number>(1); // 1 = expanding, -1 = collapsing
  const animReqRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (animReqRef.current) cancelAnimationFrame(animReqRef.current);
      return;
    }

    let lastTime = performance.now();

    const animateLoop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      setExplodeProgress((prev) => {
        let next = prev + animDirectionRef.current * delta * 0.35;
        if (next >= 1.0) {
          next = 1.0;
          animDirectionRef.current = -1;
        } else if (next <= 0.0) {
          next = 0.0;
          animDirectionRef.current = 1;
        }
        return next;
      });

      animReqRef.current = requestAnimationFrame(animateLoop);
    };

    animReqRef.current = requestAnimationFrame(animateLoop);

    return () => {
      if (animReqRef.current) cancelAnimationFrame(animReqRef.current);
    };
  }, [isPlaying]);

  const handleSelectPart = (id: string | null) => {
    setFocusedPartId(id);
    if (id) {
      setIsPlaying(false);
    }
  };

  const handleResetCamera = () => {
    setFocusedPartId(null);
    setWireframe(false);
    setShowGuideLines(true);
    showToast("Đã đặt lại góc nhìn toàn cảnh");
  };

  // Snapshot capture
  const handleTakeSnapshot = () => {
    try {
      const canvas = containerRef.current?.querySelector("canvas");
      if (canvas) {
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `osteosys-sonost-3000-exploded-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = dataUrl;
        link.click();
        showToast("Đã tải ảnh bóc tách 3D Sonost 3000 (PNG)!");
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  return (
    <div
      ref={containerRef}
      className={`relative group bg-[#070a0f] select-none ${className} ${
        isFullscreen ? "h-screen w-screen rounded-none border-0" : ""
      }`}
    >
      {/* 1. Top Glassmorphism Status Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 dark:bg-[#070a0f]/90 backdrop-blur-xl border border-sky-500/30 text-white shadow-xl text-xs">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold text-slate-100">Sonost 3000</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-300 font-mono-data text-[11px]">
            Exploded View 3D • 7 Modules
          </span>
        </div>

        {/* Link to Standard 3D Viewer */}
        <Link
          href="/san-pham/sonost-3000/3d-viewer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-semibold shadow-md transition-all hover:scale-105"
          title="Chuyển sang chế độ 3D Studio 360° nguyên khối"
        >
          <Rotate3d size={13} className="text-cyan-400" />
          <span>3D Studio 360°</span>
        </Link>
      </div>

      {/* 2. Top-Right Instructions Hint */}
      <div className="absolute top-4 right-4 z-20 hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 pointer-events-none font-mono-data">
        <Info size={13} className="text-cyan-400" />
        <span>Kéo chuột xoay • Nhấp linh kiện để soi chi tiết kỹ thuật</span>
      </div>

      {/* 3. Main 3D Exploded Canvas */}
      <SonostExplodedCanvas
        ref={canvasRef}
        explodeProgress={explodeProgress}
        focusedPartId={focusedPartId}
        onSelectPart={handleSelectPart}
        wireframe={wireframe}
        showGuideLines={showGuideLines}
        className="w-full h-full"
      />

      {/* 4. Active Part Technical & Clinical Drawer */}
      <ExplodedPartDrawer
        partId={focusedPartId}
        onClose={() => setFocusedPartId(null)}
        onSelectPart={handleSelectPart}
      />

      {/* 5. Bottom Floating Controls HUD */}
      <ExplodedControlsHUD
        explodeProgress={explodeProgress}
        onExplodeChange={(val) => {
          setExplodeProgress(val);
          setIsPlaying(false);
        }}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        focusedPartId={focusedPartId}
        onSelectPart={handleSelectPart}
        wireframe={wireframe}
        onToggleWireframe={() => setWireframe(!wireframe)}
        showGuideLines={showGuideLines}
        onToggleGuideLines={() => setShowGuideLines(!showGuideLines)}
        onResetCamera={handleResetCamera}
        onTakeSnapshot={handleTakeSnapshot}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
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

export default SonostExplodedViewer;
