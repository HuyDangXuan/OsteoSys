"use client";

import React, { useState } from "react";
import { Html } from "@react-three/drei";
import { SONOST_HOTSPOTS, HotspotData } from "./hotspot-data";
import { ChevronRight, Sparkles } from "lucide-react";

interface HotspotsProps {
  activeHotspot: string | null;
  onSelectHotspot: (id: string) => void;
  visible?: boolean;
}

function HotspotPin({
  hotspot,
  isActive,
  onSelect,
}: {
  hotspot: HotspotData;
  isActive: boolean;
  onSelect: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={hotspot.position}>
      {/* 3D Visual Mesh Anchor in Scene */}
      <mesh>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color={isActive ? "#00ffff" : "#0284c7"} />
      </mesh>

      {/* HTML Overlay Marker */}
      <Html
        center
        distanceFactor={6.5}
        zIndexRange={[50, 0]}
        style={{
          transition: "all 0.2s ease-out",
          pointerEvents: "auto",
        }}
      >
        <div className="relative group flex items-center justify-center">
          {/* Outer Pulsing Wave Ring */}
          <div
            className={`absolute -inset-3 rounded-full transition-all duration-700 pointer-events-none ${
              isActive
                ? "bg-cyan-400/40 animate-ping"
                : hovered
                ? "bg-sky-400/30 animate-pulse"
                : "bg-sky-500/20 animate-ping opacity-60"
            }`}
            style={{ animationDuration: isActive ? "1.5s" : "3s" }}
          />

          {/* Core Interactive Button Pin */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(hotspot.id);
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 font-mono-data font-bold text-xs shadow-lg transition-all duration-300 transform active:scale-90 cursor-pointer ${
              isActive
                ? "bg-cyan-500 border-white text-slate-950 scale-125 shadow-cyan-400/60 ring-4 ring-cyan-400/30"
                : hovered
                ? "bg-[#0284c7] border-white text-white scale-110 shadow-sky-500/50"
                : "bg-slate-900/90 border-sky-400 text-sky-200 hover:bg-[#0284c7]"
            }`}
            title={hotspot.title}
            aria-label={`Xem chi tiết ${hotspot.title}`}
          >
            <span>{hotspot.number}</span>
          </button>

          {/* Quick Tooltip on Hover or Active (Desktop) */}
          {(hovered || isActive) && (
            <div
              className="absolute left-1/2 bottom-full mb-2.5 -translate-x-1/2 w-48 sm:w-56 p-2.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-sky-500/40 text-white shadow-2xl pointer-events-none transition-all duration-200 select-none animate-in fade-in zoom-in-95"
              style={{ zIndex: 100 }}
            >
              <div className="flex items-center gap-1 text-[10px] font-mono-data text-cyan-400 uppercase tracking-wider mb-0.5">
                <Sparkles size={10} />
                <span>{hotspot.badge}</span>
              </div>
              <div className="font-bold text-xs text-white leading-tight mb-1">
                {hotspot.title}
              </div>
              <p className="text-[10px] text-slate-300 leading-snug line-clamp-2">
                {hotspot.shortDesc}
              </p>
              <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-800 text-[9px] text-sky-300 font-mono-data">
                <span>Nhấp để phóng to</span>
                <ChevronRight size={10} />
              </div>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

export function Hotspots({
  activeHotspot,
  onSelectHotspot,
  visible = true,
}: HotspotsProps) {
  if (!visible) return null;

  return (
    <group name="sonost-hotspots">
      {SONOST_HOTSPOTS.map((hotspot) => (
        <HotspotPin
          key={hotspot.id}
          hotspot={hotspot}
          isActive={activeHotspot === hotspot.id}
          onSelect={onSelectHotspot}
        />
      ))}
    </group>
  );
}

export default Hotspots;
