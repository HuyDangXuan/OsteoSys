"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Line, Html } from "@react-three/drei";
import { EXPLODED_PARTS, ExplodedPartData } from "./exploded-parts-data";
import { Sparkles, ChevronRight, Eye } from "lucide-react";

interface SonostExplodedModelProps {
  explodeProgress: number; // 0.0 to 1.0
  focusedPartId: string | null;
  onSelectPart: (id: string) => void;
  wireframe?: boolean;
  showGuideLines?: boolean;
}

export function SonostExplodedModel({
  explodeProgress,
  focusedPartId,
  onSelectPart,
  wireframe = false,
  showGuideLines = true,
}: SonostExplodedModelProps) {
  // Group references for smooth lerp transitions
  const topChassisRef = useRef<THREE.Group>(null);
  const lcdScreenRef = useRef<THREE.Group>(null);
  const transducerLeftRef = useRef<THREE.Group>(null);
  const transducerRightRef = useRef<THREE.Group>(null);
  const footCradleRef = useRef<THREE.Group>(null);
  const rearPrinterRef = useRef<THREE.Group>(null);
  const dspMotherboardRef = useRef<THREE.Group>(null);
  const baseChassisRef = useRef<THREE.Group>(null);

  // Material configurations with ghosting / opacity support
  const getMaterialOpacity = (partId: string) => {
    if (!focusedPartId) return wireframe ? 0.35 : 1.0;
    return focusedPartId === partId ? 1.0 : 0.25;
  };

  const isPartHighlighted = (partId: string) => focusedPartId === partId;

  // LCD Texture
  const screenTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 640;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#09131f";
    ctx.fillRect(0, 0, 1024, 640);
    ctx.fillStyle = "#0d2137";
    ctx.fillRect(0, 0, 1024, 60);

    ctx.fillStyle = "#00d2ff";
    ctx.font = "bold 24px monospace";
    ctx.fillText("OsteoSys Sonost 3000", 25, 40);
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 18px monospace";
    ctx.fillText("● SYSTEM ONLINE", 840, 39);

    // Chart
    ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
    ctx.fillRect(50, 90, 480, 130);
    ctx.fillStyle = "rgba(245, 158, 11, 0.2)";
    ctx.fillRect(50, 230, 480, 140);
    ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
    ctx.fillRect(50, 380, 480, 180);

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(50, 140);
    ctx.bezierCurveTo(200, 180, 350, 300, 520, 460);
    ctx.stroke();

    // Metrics
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 34px monospace";
    ctx.fillText("SOS: 1542 m/s", 580, 160);
    ctx.fillText("BUA: 65.4 dB/MHz", 580, 250);
    ctx.fillStyle = "#fbbf24";
    ctx.fillText("BQI: 88.2", 580, 340);
    ctx.fillText("T-Score: -1.2", 580, 430);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    return texture;
  }, []);

  // Frame loop for smooth group translation lerping
  useFrame((_, delta) => {
    const step = Math.min(delta * 5.0, 0.2);

    // 1. Top Chassis
    if (topChassisRef.current) {
      topChassisRef.current.position.lerp(
        new THREE.Vector3(0, 1.25 * explodeProgress, 0),
        step
      );
    }
    // 2. LCD Screen
    if (lcdScreenRef.current) {
      lcdScreenRef.current.position.lerp(
        new THREE.Vector3(0, 0.68 + 0.95 * explodeProgress, -0.65 + 0.65 * explodeProgress),
        step
      );
    }
    // 3. Transducers Left & Right
    if (transducerLeftRef.current) {
      transducerLeftRef.current.position.lerp(
        new THREE.Vector3(-0.85 - 0.95 * explodeProgress, 0.35, 0),
        step
      );
    }
    if (transducerRightRef.current) {
      transducerRightRef.current.position.lerp(
        new THREE.Vector3(0.85 + 0.95 * explodeProgress, 0.35, 0),
        step
      );
    }
    // 4. Foot Cradle
    if (footCradleRef.current) {
      footCradleRef.current.position.lerp(
        new THREE.Vector3(0, 0.17 - 0.25 * explodeProgress, 0.35 + 0.85 * explodeProgress),
        step
      );
    }
    // 5. Rear Printer & I/O
    if (rearPrinterRef.current) {
      rearPrinterRef.current.position.lerp(
        new THREE.Vector3(0, 0.55 + 0.35 * explodeProgress, -1.32 - 1.15 * explodeProgress),
        step
      );
    }
    // 6. DSP Motherboard
    if (dspMotherboardRef.current) {
      dspMotherboardRef.current.position.lerp(
        new THREE.Vector3(0, 0.28 + 0.55 * explodeProgress, 0),
        step
      );
    }
  });

  return (
    <group scale={[1.3, 1.3, 1.3]} position={[0, -0.3, 0]}>
      {/* ========================================================================= */}
      {/* GROUP 7: REINFORCED METAL BASE CHASSIS (KHUNG ĐẾ CHỊU LỰC - CỐ ĐỊNH)       */}
      {/* ========================================================================= */}
      <group
        ref={baseChassisRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart("base_chassis");
        }}
      >
        {/* Metal Sub-Frame */}
        <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.1, 0.16, 2.7]} />
          <meshStandardMaterial
            color={isPartHighlighted("base_chassis") ? "#0284c7" : "#475569"}
            metalness={0.7}
            roughness={0.3}
            wireframe={wireframe}
            transparent={!!focusedPartId}
            opacity={getMaterialOpacity("base_chassis")}
          />
        </mesh>

        {/* 4 Rubber Shock-absorbing Feet */}
        {[
          [-0.95, -0.02, -1.15],
          [0.95, -0.02, -1.15],
          [-0.95, -0.02, 1.15],
          [0.95, -0.02, 1.15],
        ].map(([x, y, z], idx) => (
          <mesh key={idx} position={[x, y, z]}>
            <cylinderGeometry args={[0.07, 0.08, 0.05, 24]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        ))}

        {/* Internal Guide Rails */}
        <mesh position={[0, 0.17, 0]}>
          <boxGeometry args={[1.7, 0.03, 0.06]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* GROUP 6: DSP ULTRASOUND MOTHERBOARD & MEDICAL POWER UNIT (BO MẠCH CHỦ)    */}
      {/* ========================================================================= */}
      <group
        ref={dspMotherboardRef}
        position={[0, 0.28, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart("dsp_motherboard");
        }}
      >
        {/* Mainboard PCB Green Board */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.02, 1.4]} />
          <meshStandardMaterial
            color={isPartHighlighted("dsp_motherboard") ? "#0284c7" : "#065f46"}
            roughness={0.4}
            metalness={0.2}
            wireframe={wireframe}
            transparent={!!focusedPartId}
            opacity={getMaterialOpacity("dsp_motherboard")}
          />
        </mesh>

        {/* Main 32-bit DSP Processor Chip */}
        <mesh position={[-0.3, 0.025, 0]}>
          <boxGeometry args={[0.3, 0.025, 0.3]} />
          <meshStandardMaterial
            color="#0f172a"
            metalness={0.8}
            roughness={0.2}
            emissive={isPartHighlighted("dsp_motherboard") ? "#06b6d4" : "#000000"}
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* High-Speed ADC Acoustic Converter */}
        <mesh position={[0.25, 0.02, -0.2]}>
          <boxGeometry args={[0.22, 0.02, 0.18]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} />
        </mesh>

        {/* Power Transformer Box */}
        <mesh position={[0.45, 0.06, 0.35]} castShadow>
          <boxGeometry args={[0.4, 0.1, 0.35]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.15} />
        </mesh>

        {/* Row of Filter Capacitors */}
        {[-0.5, -0.35, -0.2].map((xVal, idx) => (
          <mesh key={idx} position={[xVal, 0.05, 0.45]}>
            <cylinderGeometry args={[0.04, 0.04, 0.08, 16]} />
            <meshStandardMaterial color="#0284c7" metalness={0.6} />
          </mesh>
        ))}

        {/* Glowing Circuit Lines on PCB */}
        <mesh position={[0, 0.012, 0]}>
          <planeGeometry args={[1.5, 1.3]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#06b6d4"
            emissiveIntensity={explodeProgress > 0.1 ? 0.6 : 0.2}
            transparent
            opacity={explodeProgress > 0.1 ? 0.7 : 0.3}
            wireframe
          />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* GROUP 3A & 3B: DUAL CALCANEUS 0.5MHz TRANSDUCERS (CẶP ĐẦU DÒ SIÊU ÂM)     */}
      {/* ========================================================================= */}
      {/* Left Transducer */}
      <group
        ref={transducerLeftRef}
        position={[-0.85, 0.35, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart("transducers");
        }}
      >
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.2, 0.22, 0.32, 32]} />
          <meshStandardMaterial
            color={isPartHighlighted("transducers") ? "#0284c7" : "#0369a1"}
            metalness={0.4}
            roughness={0.25}
            wireframe={wireframe}
            transparent={!!focusedPartId}
            opacity={getMaterialOpacity("transducers")}
          />
        </mesh>
        <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <sphereGeometry args={[0.17, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            roughness={0.1}
            transmission={0.6}
            transparent
            opacity={getMaterialOpacity("transducers")}
          />
        </mesh>
      </group>

      {/* Right Transducer */}
      <group
        ref={transducerRightRef}
        position={[0.85, 0.35, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart("transducers");
        }}
      >
        <mesh rotation={[0, 0, -Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.2, 0.22, 0.32, 32]} />
          <meshStandardMaterial
            color={isPartHighlighted("transducers") ? "#0284c7" : "#0369a1"}
            metalness={0.4}
            roughness={0.25}
            wireframe={wireframe}
            transparent={!!focusedPartId}
            opacity={getMaterialOpacity("transducers")}
          />
        </mesh>
        <mesh position={[-0.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <sphereGeometry args={[0.17, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            roughness={0.1}
            transmission={0.6}
            transparent
            opacity={getMaterialOpacity("transducers")}
          />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* GROUP 4: FOOT CRADLE & SILICONE PAD (KHAY ĐỊNH VỊ GÓT CHÂN & ĐỆM)         */}
      {/* ========================================================================= */}
      <group
        ref={footCradleRef}
        position={[0, 0.17, 0.35]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart("foot_cradle");
        }}
      >
        <mesh receiveShadow castShadow>
          <boxGeometry args={[1.3, 0.04, 1.5]} />
          <meshStandardMaterial
            color={isPartHighlighted("foot_cradle") ? "#0284c7" : "#1e293b"}
            roughness={0.7}
            wireframe={wireframe}
            transparent={!!focusedPartId}
            opacity={getMaterialOpacity("foot_cradle")}
          />
        </mesh>
        <mesh position={[0, 0.04, -0.45]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.22, 0.28, 0.06, 32, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* GROUP 5: REAR 58mm THERMAL PRINTER & I/O HUB (MÁY IN NHIỆT MẶT SAU)        */}
      {/* ========================================================================= */}
      <group
        ref={rearPrinterRef}
        position={[0, 0.55, -1.32]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart("rear_printer");
        }}
      >
        {/* Printer Back Panel */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.0, 0.85, 0.12]} />
          <meshStandardMaterial
            color={isPartHighlighted("rear_printer") ? "#0284c7" : "#f8fafc"}
            roughness={0.25}
            metalness={0.1}
            wireframe={wireframe}
            transparent={!!focusedPartId}
            opacity={getMaterialOpacity("rear_printer")}
          />
        </mesh>

        {/* 58mm Printer Bay Door */}
        <mesh position={[0, 0.14, -0.06]} castShadow>
          <boxGeometry args={[0.92, 0.36, 0.06]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Thermal Paper Slip Extending from Rear */}
        <group position={[0, 0.3, -0.12]} rotation={[-Math.PI / 4, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.66, 0.22, 0.005]} />
            <meshStandardMaterial color="#ffffff" roughness={0.8} />
          </mesh>
          {[-0.06, -0.02, 0.02, 0.06].map((yVal, idx) => (
            <mesh key={idx} position={[0, yVal, -0.003]}>
              <planeGeometry args={[0.56, 0.012]} />
              <meshBasicMaterial color="#1e293b" />
            </mesh>
          ))}
        </group>

        {/* Rear I/O Connectors */}
        <group position={[0, -0.24, -0.06]}>
          <mesh position={[-0.65, 0, 0]}>
            <boxGeometry args={[0.24, 0.12, 0.02]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[-0.38, 0, 0]}>
            <boxGeometry args={[0.1, 0.12, 0.025]} />
            <meshStandardMaterial color="#dc2626" emissive="#ef4444" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0.2, 0, 0]}>
            <boxGeometry args={[0.28, 0.09, 0.02]} />
            <meshStandardMaterial color="#334155" metalness={0.7} />
          </mesh>
          <mesh position={[0.62, 0, 0]}>
            <boxGeometry args={[0.32, 0.1, 0.02]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
        </group>
      </group>

      {/* ========================================================================= */}
      {/* GROUP 2: 7.0-INCH COLOR TFT LCD & TOUCH MODULE (MÀN HÌNH ĐIỀU KHIỂN)       */}
      {/* ========================================================================= */}
      <group
        ref={lcdScreenRef}
        position={[0, 0.68, -0.65]}
        rotation={[-Math.PI / 4.8, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart("lcd_screen");
        }}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.0, 0.95, 0.16]} />
          <meshStandardMaterial
            color={isPartHighlighted("lcd_screen") ? "#0284c7" : "#f8fafc"}
            roughness={0.25}
            metalness={0.1}
            wireframe={wireframe}
            transparent={!!focusedPartId}
            opacity={getMaterialOpacity("lcd_screen")}
          />
        </mesh>
        <mesh position={[0, 0.02, 0.09]}>
          <boxGeometry args={[1.72, 0.82, 0.02]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0, 0.02, 0.105]}>
          <planeGeometry args={[1.65, 0.76]} />
          {screenTexture && !wireframe ? (
            <meshBasicMaterial map={screenTexture} />
          ) : (
            <meshStandardMaterial color="#0284c7" wireframe />
          )}
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* GROUP 1: TOP CHASSIS HOUSING (VỎ ỐP BẢO VỆ TRÊN)                           */}
      {/* ========================================================================= */}
      <group
        ref={topChassisRef}
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart("top_chassis");
        }}
      >
        {/* Left & Right Side Body Panels */}
        <mesh position={[-1.02, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.12, 0.45, 2.6]} />
          <meshStandardMaterial
            color={isPartHighlighted("top_chassis") ? "#0284c7" : "#f8fafc"}
            roughness={0.25}
            wireframe={wireframe}
            transparent={!!focusedPartId}
            opacity={getMaterialOpacity("top_chassis")}
          />
        </mesh>
        <mesh position={[1.02, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.12, 0.45, 2.6]} />
          <meshStandardMaterial
            color={isPartHighlighted("top_chassis") ? "#0284c7" : "#f8fafc"}
            roughness={0.25}
            wireframe={wireframe}
            transparent={!!focusedPartId}
            opacity={getMaterialOpacity("top_chassis")}
          />
        </mesh>
        {/* Cyan Side Trims */}
        <mesh position={[-1.09, 0.35, 0]}>
          <boxGeometry args={[0.02, 0.05, 2.5]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[1.09, 0.35, 0]}>
          <boxGeometry args={[0.02, 0.05, 2.5]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.4} />
        </mesh>
        {/* Front Bumper */}
        <mesh position={[0, 0.32, 1.32]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 0.4, 0.12]} />
          <meshStandardMaterial
            color={isPartHighlighted("top_chassis") ? "#0284c7" : "#f8fafc"}
            roughness={0.25}
            wireframe={wireframe}
            transparent={!!focusedPartId}
            opacity={getMaterialOpacity("top_chassis")}
          />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 3D DYNAMIC GUIDE LINES & FLOATING HTML CALLOUTS (WHEN EXPLODED)           */}
      {/* ========================================================================= */}
      {showGuideLines && explodeProgress > 0.25 && (
        <group name="exploded-guide-lines">
          {/* Guide Line to Top Chassis */}
          <Line
            points={[
              [0, 0.35, 0],
              [0, 0.35 + 1.25 * explodeProgress, 0],
            ]}
            color="#06b6d4"
            lineWidth={1.5}
            dashed
            dashScale={12}
            dashSize={0.1}
            gapSize={0.06}
          />
          {/* Guide Line to LCD Screen */}
          <Line
            points={[
              [0, 0.5, -0.6],
              [0, 0.68 + 0.95 * explodeProgress, -0.65 + 0.65 * explodeProgress],
            ]}
            color="#06b6d4"
            lineWidth={1.5}
            dashed
            dashScale={12}
            dashSize={0.1}
            gapSize={0.06}
          />
          {/* Guide Line to Transducers */}
          <Line
            points={[
              [0, 0.35, 0],
              [-0.85 - 0.95 * explodeProgress, 0.35, 0],
            ]}
            color="#06b6d4"
            lineWidth={1.5}
            dashed
            dashScale={12}
            dashSize={0.1}
            gapSize={0.06}
          />
          <Line
            points={[
              [0, 0.35, 0],
              [0.85 + 0.95 * explodeProgress, 0.35, 0],
            ]}
            color="#06b6d4"
            lineWidth={1.5}
            dashed
            dashScale={12}
            dashSize={0.1}
            gapSize={0.06}
          />
          {/* Guide Line to Rear Printer */}
          <Line
            points={[
              [0, 0.45, -1.0],
              [0, 0.55 + 0.35 * explodeProgress, -1.32 - 1.15 * explodeProgress],
            ]}
            color="#06b6d4"
            lineWidth={1.5}
            dashed
            dashScale={12}
            dashSize={0.1}
            gapSize={0.06}
          />

          {/* Floating 3D Part Callouts */}
          {EXPLODED_PARTS.map((part) => {
            // Compute dynamic anchor position
            const posX = part.offsetVector[0] * (1.1 * explodeProgress);
            const posY = 0.5 + part.offsetVector[1] * (1.1 * explodeProgress);
            const posZ = part.offsetVector[2] * (1.1 * explodeProgress);

            return (
              <group key={part.id} position={[posX, posY, posZ]}>
                <Html distanceFactor={8.5} center zIndexRange={[60, 0]}>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPart(part.id);
                    }}
                    className={`p-2 rounded-xl backdrop-blur-xl border text-xs shadow-2xl transition-all duration-200 cursor-pointer select-none whitespace-nowrap flex items-center gap-2 group ${
                      focusedPartId === part.id
                        ? "bg-cyan-500 text-slate-950 border-white font-bold ring-4 ring-cyan-400/40 scale-110"
                        : "bg-slate-950/85 text-white border-slate-700/80 hover:border-cyan-400 hover:bg-slate-900"
                    }`}
                  >
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-400 text-slate-950 font-mono-data font-bold text-[10px]">
                      {part.number}
                    </span>
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-[11px] leading-none">
                        {part.name.split(" ")[0]} {part.name.split(" ")[1] || ""}
                      </span>
                      <span className="text-[9px] font-mono-data opacity-75 mt-0.5">
                        {part.partNumber}
                      </span>
                    </div>
                    <ChevronRight size={13} className="opacity-70 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Html>
              </group>
            );
          })}
        </group>
      )}
    </group>
  );
}

export default SonostExplodedModel;
