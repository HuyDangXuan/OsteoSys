"use client";

import React, { Suspense, forwardRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows, Grid } from "@react-three/drei";
import SonostModel from "./SonostModel";
import Hotspots from "./Hotspots";
import CameraController from "./CameraController";
import Clinical3DLoader from "./Clinical3DLoader";
import { EnvironmentTheme } from "./Sonost3DToolbar";

interface SonostCanvasProps {
  modelUrl?: string;
  wireframe: boolean;
  activeHotspot: string | null;
  onSelectHotspot: (id: string) => void;
  autoRotate: boolean;
  onUserInteract?: () => void;
  showHotspots: boolean;
  envTheme: EnvironmentTheme;
  presetView?: "overview" | "front" | "top" | "side" | "rear" | "iso" | null;
  className?: string;
}

export const SonostCanvas = forwardRef<HTMLCanvasElement, SonostCanvasProps>(
  function SonostCanvas(
    {
      modelUrl,
      wireframe,
      activeHotspot,
      onSelectHotspot,
      autoRotate,
      onUserInteract,
      showHotspots,
      envTheme,
      presetView,
      className = "w-full h-full",
    },
    ref
  ) {
    // Determine background style and ambient colors based on theme
    const isDark = envTheme === "operating_dark";
    const isClinic = envTheme === "clinic";

    return (
      <div
        className={`relative w-full h-full select-none overflow-hidden transition-colors duration-500 ${
          isDark
            ? "bg-[#0b0f17] text-white"
            : isClinic
            ? "bg-gradient-to-b from-slate-100 via-slate-50 to-sky-50/30 text-slate-900"
            : "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white"
        } ${className}`}
      >
        <Canvas
          ref={ref as any}
          shadows
          camera={{ position: [3.4, 2.5, 3.6], fov: 40 }}
          gl={{
            preserveDrawingBuffer: true,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          className="cursor-grab active:cursor-grabbing"
        >
          <Suspense fallback={<Clinical3DLoader />}>
            {/* Environment HDRI Lighting */}
            <Environment
              preset={isClinic ? "city" : isDark ? "night" : "studio"}
              environmentIntensity={isDark ? 0.6 : 1.1}
            />

            {/* Studio Medical Key Light */}
            <directionalLight
              position={[5, 8, 6]}
              intensity={isClinic ? 1.5 : 1.2}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-near={0.5}
              shadow-camera-far={25}
              shadow-camera-left={-4}
              shadow-camera-right={4}
              shadow-camera-top={4}
              shadow-camera-bottom={-4}
              shadow-bias={-0.0001}
            />

            {/* Soft Fill Light */}
            <directionalLight
              position={[-6, 4, -4]}
              intensity={isDark ? 0.8 : 0.6}
              color={isDark ? "#38bdf8" : "#f1f5f9"}
            />

            {/* Cyan Rim Accent Light (High Tech Glow) */}
            <pointLight
              position={[-3, 2.5, 2]}
              intensity={isDark ? 2.5 : 0.8}
              color="#06b6d4"
              distance={8}
            />

            {/* Operator Warm Point Light */}
            <pointLight
              position={[2, 3, -2]}
              intensity={0.6}
              color="#bae6fd"
              distance={7}
            />

            {/* Base Ambient Illumination */}
            <ambientLight intensity={isDark ? 0.35 : 0.75} />

            {/* Main Sonost 3000 3D Model */}
            <SonostModel
              modelUrl={modelUrl}
              wireframe={wireframe}
              activeHotspot={activeHotspot}
              onHotspotClick={onSelectHotspot}
            />

            {/* 4 Interactive Clinical Hotspots */}
            <Hotspots
              activeHotspot={activeHotspot}
              onSelectHotspot={onSelectHotspot}
              visible={showHotspots}
            />

            {/* Contact Shadows on Table Surface */}
            <ContactShadows
              position={[0, -0.21, 0]}
              opacity={isDark ? 0.8 : 0.55}
              scale={8}
              blur={2.4}
              far={4}
              color={isDark ? "#020617" : "#334155"}
            />

            {/* Subtle Clinical CAD Grid Floor */}
            <Grid
              position={[0, -0.22, 0]}
              args={[12, 12]}
              cellSize={0.4}
              cellThickness={0.8}
              cellColor={isDark ? "#1e293b" : "#cbd5e1"}
              sectionSize={2.0}
              sectionThickness={1.2}
              sectionColor={isDark ? "#0284c7" : "#94a3b8"}
              fadeDistance={9}
              fadeStrength={1.5}
            />

            {/* Smooth OrbitControls & Lerp Camera Engine */}
            <CameraController
              activeHotspot={activeHotspot}
              autoRotate={autoRotate}
              onUserInteract={onUserInteract}
              presetView={presetView}
            />
          </Suspense>
        </Canvas>
      </div>
    );
  }
);

SonostCanvas.displayName = "SonostCanvas";
export default SonostCanvas;
