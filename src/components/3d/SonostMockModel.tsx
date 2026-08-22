"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

interface SonostMockModelProps {
  wireframe?: boolean;
  activeHotspot?: string | null;
  onHotspotClick?: (id: string) => void;
}

export function SonostMockModel({
  wireframe = false,
  activeHotspot,
  onHotspotClick,
}: SonostMockModelProps) {
  // Create dynamic LCD screen canvas texture showing real Sonost 3000 diagnostic UI
  const screenTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 640;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Background
    ctx.fillStyle = "#09131f";
    ctx.fillRect(0, 0, 1024, 640);

    // Top Status Bar
    ctx.fillStyle = "#0d2137";
    ctx.fillRect(0, 0, 1024, 60);

    ctx.fillStyle = "#00d2ff";
    ctx.font = "bold 24px monospace";
    ctx.fillText("OsteoSys Sonost 3000", 25, 40);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "18px monospace";
    ctx.fillText("ID: P-84920  |  AGE: 58 (F)  |  CALCANEUS", 420, 39);

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 18px monospace";
    ctx.fillText("● READY", 910, 39);

    // WHO Diagnostic Chart Area (Left Side)
    ctx.fillStyle = "#0c1829";
    ctx.fillRect(30, 80, 520, 520);
    ctx.strokeStyle = "#1e3a5f";
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 80, 520, 520);

    // Color bands for WHO T-Score
    // Normal (Green)
    ctx.fillStyle = "rgba(16, 185, 129, 0.25)";
    ctx.fillRect(70, 100, 440, 120);
    ctx.fillStyle = "#34d399";
    ctx.font = "bold 15px monospace";
    ctx.fillText("NORMAL (T > -1.0)", 80, 125);

    // Osteopenia (Yellow)
    ctx.fillStyle = "rgba(245, 158, 11, 0.25)";
    ctx.fillRect(70, 220, 440, 130);
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 15px monospace";
    ctx.fillText("OSTEOPENIA (-1.0 ~ -2.5)", 80, 245);

    // Osteoporosis (Red)
    ctx.fillStyle = "rgba(239, 68, 68, 0.25)";
    ctx.fillRect(70, 350, 440, 160);
    ctx.fillStyle = "#f87171";
    ctx.font = "bold 15px monospace";
    ctx.fillText("OSTEOPOROSIS (T < -2.5)", 80, 375);

    // Grid lines & Reference Curve
    ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
    ctx.beginPath();
    for (let x = 70; x <= 510; x += 55) {
      ctx.moveTo(x, 100);
      ctx.lineTo(x, 510);
    }
    for (let y = 100; y <= 510; y += 40) {
      ctx.moveTo(70, y);
      ctx.lineTo(510, y);
    }
    ctx.stroke();

    // Patient Bone Density Reference Curve
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(70, 140);
    ctx.bezierCurveTo(200, 160, 350, 280, 510, 430);
    ctx.stroke();

    // Patient Result Marker (Pulsing Dot)
    ctx.fillStyle = "#00f0ff";
    ctx.beginPath();
    ctx.arc(310, 260, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px monospace";
    ctx.fillText("Patient: T = -1.2", 330, 265);

    // Clinical Metrics Panel (Right Side)
    ctx.fillStyle = "#0e2038";
    ctx.fillRect(570, 80, 420, 520);
    ctx.strokeStyle = "#1e3a5f";
    ctx.lineWidth = 2;
    ctx.strokeRect(570, 80, 420, 520);

    // Metric 1: SOS
    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px monospace";
    ctx.fillText("SPEED OF SOUND (SOS)", 595, 120);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 36px monospace";
    ctx.fillText("1542 m/s", 595, 160);
    ctx.fillStyle = "#10b981";
    ctx.font = "14px monospace";
    ctx.fillText("CV: 0.18% (ISCD Valid)", 595, 185);

    // Metric 2: BUA
    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px monospace";
    ctx.fillText("BROADBAND ULTRASOUND ATT. (BUA)", 595, 235);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 36px monospace";
    ctx.fillText("65.4 dB/MHz", 595, 275);
    ctx.fillStyle = "#10b981";
    ctx.font = "14px monospace";
    ctx.fillText("CV: 1.25%", 595, 300);

    // Metric 3: BQI
    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px monospace";
    ctx.fillText("BONE QUALITY INDEX (BQI)", 595, 350);
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 44px monospace";
    ctx.fillText("88.2", 595, 395);

    // Metric 4: T-Score & Z-Score
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(595, 420, 370, 1);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 26px monospace";
    ctx.fillText("T-Score: -1.2", 595, 460);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 26px monospace";
    ctx.fillText("Z-Score: -0.4", 595, 500);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px monospace";
    ctx.fillText("Phân loại: Thiếu xương nhẹ (Osteopenia)", 595, 540);
    ctx.fillText("Khuyến nghị: Bổ sung Calci + Vitamin D3", 595, 565);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    return texture;
  }, []);

  // Material configurations
  const medicalWhiteMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: wireframe ? "#0369a1" : "#f8fafc",
        roughness: wireframe ? 0.9 : 0.22,
        metalness: wireframe ? 0.1 : 0.08,
        wireframe,
        transparent: wireframe,
        opacity: wireframe ? 0.35 : 1,
      }),
    [wireframe]
  );

  const medicalAccentMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0284c7",
        roughness: 0.3,
        metalness: 0.25,
        wireframe,
        emissive: wireframe ? "#0284c7" : "#000000",
        emissiveIntensity: wireframe ? 0.4 : 0,
      }),
    [wireframe]
  );

  const cyanTrimMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#06b6d4",
        roughness: 0.2,
        metalness: 0.4,
        wireframe,
        emissive: "#06b6d4",
        emissiveIntensity: 0.25,
      }),
    [wireframe]
  );

  const siliconeFootPadMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: wireframe ? "#0284c7" : "#1e293b",
        roughness: 0.7,
        metalness: 0.05,
        wireframe,
      }),
    [wireframe]
  );

  const transducerMembraneMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#38bdf8",
        roughness: 0.15,
        transmission: wireframe ? 0 : 0.65,
        opacity: wireframe ? 0.4 : 0.85,
        transparent: true,
        ior: 1.4,
        wireframe,
        emissive: "#0284c7",
        emissiveIntensity: 0.2,
      }),
    [wireframe]
  );

  const screenMat = useMemo(() => {
    if (wireframe || !screenTexture) {
      return new THREE.MeshStandardMaterial({
        color: "#0284c7",
        wireframe: true,
        emissive: "#00ffff",
        emissiveIntensity: 0.6,
      });
    }
    return new THREE.MeshBasicMaterial({
      map: screenTexture,
    });
  }, [wireframe, screenTexture]);

  const thermalPaperMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.8,
        metalness: 0.0,
        wireframe,
      }),
    [wireframe]
  );

  const metalChromeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#cbd5e1",
        roughness: 0.15,
        metalness: 0.85,
        wireframe,
      }),
    [wireframe]
  );

  return (
    <group position={[0, -0.2, 0]} scale={[1.35, 1.35, 1.35]}>
      {/* ========================================================================= */}
      {/* 1. CHASSIS BASE & LOWER BODY                                              */}
      {/* ========================================================================= */}

      {/* Main Base Plate */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow material={medicalWhiteMat}>
        <boxGeometry args={[2.1, 0.16, 2.7]} />
      </mesh>

      {/* 4 Rubber Anti-vibration Feet */}
      {[
        [-0.95, -0.02, -1.15],
        [0.95, -0.02, -1.15],
        [-0.95, -0.02, 1.15],
        [0.95, -0.02, 1.15],
      ].map(([x, y, z], idx) => (
        <mesh key={idx} position={[x, y, z]} castShadow>
          <cylinderGeometry args={[0.07, 0.08, 0.05, 24]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
      ))}

      {/* Curved Side Panels */}
      <mesh position={[-1.02, 0.35, 0]} castShadow receiveShadow material={medicalWhiteMat}>
        <boxGeometry args={[0.12, 0.45, 2.6]} />
      </mesh>
      <mesh position={[1.02, 0.35, 0]} castShadow receiveShadow material={medicalWhiteMat}>
        <boxGeometry args={[0.12, 0.45, 2.6]} />
      </mesh>

      {/* Side Cyan Medical Trim Strips */}
      <mesh position={[-1.09, 0.35, 0]} material={cyanTrimMat}>
        <boxGeometry args={[0.02, 0.05, 2.5]} />
      </mesh>
      <mesh position={[1.09, 0.35, 0]} material={cyanTrimMat}>
        <boxGeometry args={[0.02, 0.05, 2.5]} />
      </mesh>

      {/* Front Bumper with Ergonomic Curved Bevel */}
      <mesh position={[0, 0.32, 1.32]} castShadow receiveShadow material={medicalWhiteMat}>
        <boxGeometry args={[2.0, 0.4, 0.12]} />
      </mesh>

      {/* ========================================================================= */}
      {/* 2. REAR PANEL & REAR-MOUNTED THERMAL PRINTER (MẶT SAU THÂN MÁY)           */}
      {/* ========================================================================= */}
      <group position={[0, 0.55, -1.32]}>
        {/* Main Rear Backboard Enclosure */}
        <mesh castShadow receiveShadow material={medicalWhiteMat}>
          <boxGeometry args={[2.0, 0.85, 0.12]} />
        </mesh>

        {/* Built-in 58mm Thermal Printer Assembly on Rear Panel */}
        <group
          position={[0, 0.14, -0.06]}
          onClick={(e) => {
            e.stopPropagation();
            onHotspotClick?.("printer");
          }}
        >
          {/* Printer Chamber Bay Door */}
          <mesh castShadow material={medicalAccentMat}>
            <boxGeometry args={[0.92, 0.36, 0.06]} />
          </mesh>

          {/* Printer Bezel Rim (Cyan Highlight when Active) */}
          <mesh position={[0, 0, -0.032]} material={activeHotspot === "printer" ? cyanTrimMat : metalChromeMat}>
            <boxGeometry args={[0.96, 0.38, 0.008]} />
          </mesh>

          {/* Thermal Paper Ejection Slot */}
          <mesh position={[0, 0.08, -0.035]}>
            <boxGeometry args={[0.72, 0.025, 0.02]} />
            <meshStandardMaterial color="#0b0f17" roughness={0.9} />
          </mesh>

          {/* Thermal Paper Slip Extending from Rear Slot */}
          <group position={[0, 0.16, -0.06]} rotation={[-Math.PI / 4, 0, 0]}>
            <mesh material={thermalPaperMat} castShadow>
              <boxGeometry args={[0.66, 0.22, 0.005]} />
            </mesh>
            {/* Printed clinical result lines on thermal paper */}
            {[-0.06, -0.02, 0.02, 0.06].map((yVal, idx) => (
              <mesh key={idx} position={[0, yVal, -0.003]}>
                <planeGeometry args={[0.56, 0.012]} />
                <meshBasicMaterial color="#1e293b" />
              </mesh>
            ))}
          </group>

          {/* Door Open / Feed Button */}
          <mesh position={[0.36, -0.08, -0.035]} material={metalChromeMat}>
            <boxGeometry args={[0.08, 0.06, 0.02]} />
          </mesh>

          {/* Thermal Printer Label Plate */}
          <mesh position={[-0.2, -0.08, -0.035]}>
            <planeGeometry args={[0.38, 0.05]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
        </group>

        {/* Rear I/O Connectors Hub (Lower Rear Section) */}
        <group position={[0, -0.24, -0.06]}>
          {/* AC Power In Socket */}
          <mesh position={[-0.65, 0, 0]}>
            <boxGeometry args={[0.24, 0.12, 0.02]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>

          {/* Main Rocker Power Switch (Illuminated Red) */}
          <mesh position={[-0.38, 0, 0]}>
            <boxGeometry args={[0.1, 0.12, 0.025]} />
            <meshStandardMaterial color="#dc2626" emissive="#ef4444" emissiveIntensity={0.6} />
          </mesh>

          {/* Dual USB & LAN RJ45 Communication Ports */}
          <mesh position={[0.2, 0, 0]}>
            <boxGeometry args={[0.28, 0.09, 0.02]} />
            <meshStandardMaterial color="#334155" metalness={0.7} />
          </mesh>

          {/* RS-232C 9-Pin Serial & External Laser Printer Port */}
          <mesh position={[0.62, 0, 0]}>
            <boxGeometry args={[0.32, 0.1, 0.02]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
        </group>

        {/* Ventilation Cooling Louvers */}
        {[-0.8, -0.6, 0.6, 0.8].map((xVal, idx) => (
          <mesh key={idx} position={[xVal, 0.14, -0.06]}>
            <boxGeometry args={[0.12, 0.3, 0.01]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        ))}
      </group>

      {/* Carrying Handle at Rear */}
      <group position={[0, 0.95, -1.3]}>
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={metalChromeMat}>
          <cylinderGeometry args={[0.035, 0.035, 0.8, 16]} />
        </mesh>
        <mesh position={[-0.4, -0.08, 0]} material={medicalAccentMat}>
          <boxGeometry args={[0.06, 0.16, 0.06]} />
        </mesh>
        <mesh position={[0.4, -0.08, 0]} material={medicalAccentMat}>
          <boxGeometry args={[0.06, 0.16, 0.06]} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 3. CALCANEUS FOOT WELL & SILICONE POSITIONING CRADLE                      */}
      {/* ========================================================================= */}

      {/* Recessed Foot Cradle Mat (Dark Silicone Pad) */}
      <group
        position={[0, 0.17, 0.35]}
        onClick={(e) => {
          e.stopPropagation();
          onHotspotClick?.("foot_cradle");
        }}
      >
        <mesh receiveShadow material={siliconeFootPadMat}>
          <boxGeometry args={[1.3, 0.04, 1.5]} />
        </mesh>

        {/* Anatomical Heel Guide Ridge */}
        <mesh position={[0, 0.04, -0.45]} rotation={[0, Math.PI / 2, 0]} material={siliconeFootPadMat}>
          <cylinderGeometry args={[0.22, 0.28, 0.06, 32, 1, false, 0, Math.PI]} />
        </mesh>

        {/* Foot Size Reference Grid Marks */}
        {[-0.2, 0, 0.2, 0.4].map((zPos, idx) => (
          <mesh key={idx} position={[0, 0.025, zPos]}>
            <boxGeometry args={[0.8, 0.005, 0.015]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        ))}

        {/* Foot Position Indicator Icon / Texture outline */}
        <mesh position={[0, 0.025, 0.05]}>
          <boxGeometry args={[0.45, 0.005, 0.7]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 4. DUAL CALCANEUS ULTRASOUND TRANSDUCERS (0.5 MHz)                       */}
      {/* ========================================================================= */}

      {/* Left & Right Transducer Units */}
      <group
        position={[0, 0.35, 0.0]}
        onClick={(e) => {
          e.stopPropagation();
          onHotspotClick?.("transducer");
        }}
      >
        {/* Left Transducer Housing */}
        <group position={[-0.75, 0, 0]}>
          {/* Movement Slide Track */}
          <mesh position={[-0.1, -0.1, 0]} material={metalChromeMat}>
            <boxGeometry args={[0.25, 0.06, 0.5]} />
          </mesh>
          {/* Actuator Cylinder */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={medicalAccentMat} castShadow>
            <cylinderGeometry args={[0.2, 0.22, 0.28, 32]} />
          </mesh>
          {/* Transducer Ring */}
          <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={cyanTrimMat}>
            <torusGeometry args={[0.18, 0.025, 16, 32]} />
          </mesh>
          {/* Ultrasound Oil Balloon Membrane (Contact Cushion) */}
          <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={transducerMembraneMat}>
            <sphereGeometry args={[0.17, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          {/* Ultrasonic Wave Pulse Ring effect (when active) */}
          {activeHotspot === "transducer" && (
            <mesh position={[0.26, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <ringGeometry args={[0.12, 0.2, 32]} />
              <meshBasicMaterial color="#00ffff" side={THREE.DoubleSide} transparent opacity={0.6} />
            </mesh>
          )}
        </group>

        {/* Right Transducer Housing */}
        <group position={[0.75, 0, 0]}>
          {/* Movement Slide Track */}
          <mesh position={[0.1, -0.1, 0]} material={metalChromeMat}>
            <boxGeometry args={[0.25, 0.06, 0.5]} />
          </mesh>
          {/* Actuator Cylinder */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 2]} material={medicalAccentMat} castShadow>
            <cylinderGeometry args={[0.2, 0.22, 0.28, 32]} />
          </mesh>
          {/* Transducer Ring */}
          <mesh position={[-0.15, 0, 0]} rotation={[0, 0, -Math.PI / 2]} material={cyanTrimMat}>
            <torusGeometry args={[0.18, 0.025, 16, 32]} />
          </mesh>
          {/* Ultrasound Oil Balloon Membrane (Contact Cushion) */}
          <mesh position={[-0.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]} material={transducerMembraneMat}>
            <sphereGeometry args={[0.17, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          {/* Ultrasonic Wave Pulse Ring effect (when active) */}
          {activeHotspot === "transducer" && (
            <mesh position={[-0.26, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <ringGeometry args={[0.12, 0.2, 32]} />
              <meshBasicMaterial color="#00ffff" side={THREE.DoubleSide} transparent opacity={0.6} />
            </mesh>
          )}
        </group>

        {/* Acoustic Center Marker */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.02, 0.005, 0.3]} />
          <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 5. UPPER CONSOLE & CENTERED 7-INCH COLOR TFT TOUCH SCREEN                  */}
      {/* ========================================================================= */}

      {/* Incline Top Console Bridge */}
      <group
        position={[0, 0.68, -0.65]}
        rotation={[-Math.PI / 4.8, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onHotspotClick?.("screen");
        }}
      >
        {/* Slanted Bridge Enclosure */}
        <mesh castShadow receiveShadow material={medicalWhiteMat}>
          <boxGeometry args={[2.0, 0.95, 0.16]} />
        </mesh>

        {/* Bezel Frame around Screen (Full Width Ergonomic Presentation) */}
        <mesh position={[0, 0.02, 0.09]} material={siliconeFootPadMat}>
          <boxGeometry args={[1.72, 0.82, 0.02]} />
        </mesh>

        {/* 7.0 Inch TFT LCD Display Surface with Canvas Texture */}
        <mesh position={[0, 0.02, 0.105]} material={screenMat}>
          <planeGeometry args={[1.65, 0.76]} />
        </mesh>

        {/* Power LED Indicator on Screen Bezel */}
        <mesh position={[0.78, 0.37, 0.11]}>
          <circleGeometry args={[0.015, 16]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>

        {/* OsteoSys Embossed Logo Plate Under Screen */}
        <mesh position={[0, -0.41, 0.09]} material={medicalAccentMat}>
          <boxGeometry args={[0.85, 0.06, 0.015]} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 6. TECHNICAL BRANDING & HIGHLIGHT DETAILS                                 */}
      {/* ========================================================================= */}

      {/* Front Center Status Badge */}
      <mesh position={[0, 0.36, 1.39]} material={medicalAccentMat}>
        <boxGeometry args={[0.55, 0.08, 0.02]} />
      </mesh>
      <mesh position={[0, 0.36, 1.405]} material={cyanTrimMat}>
        <boxGeometry args={[0.2, 0.02, 0.005]} />
      </mesh>
    </group>
  );
}

export default SonostMockModel;
