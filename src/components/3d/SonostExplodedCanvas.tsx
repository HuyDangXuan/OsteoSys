"use client";

import React, { Suspense, useRef, useEffect, forwardRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ContactShadows, Grid, OrbitControls } from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import SonostExplodedModel from "./SonostExplodedModel";
import Clinical3DLoader from "./Clinical3DLoader";
import { EXPLODED_PARTS } from "./exploded-parts-data";

interface SonostExplodedCanvasProps {
  explodeProgress: number;
  focusedPartId: string | null;
  onSelectPart: (id: string) => void;
  wireframe?: boolean;
  showGuideLines?: boolean;
  className?: string;
}

const DEFAULT_CAMERA_POS = new THREE.Vector3(3.8, 2.8, 4.0);
const DEFAULT_TARGET = new THREE.Vector3(0, 0.4, 0);

function ExplodedCameraController({
  focusedPartId,
}: {
  focusedPartId: string | null;
}) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  const targetPos = useRef<THREE.Vector3>(DEFAULT_CAMERA_POS.clone());
  const lookTarget = useRef<THREE.Vector3>(DEFAULT_TARGET.clone());
  const isTransitioning = useRef<boolean>(true);

  useEffect(() => {
    if (focusedPartId) {
      const found = EXPLODED_PARTS.find((p) => p.id === focusedPartId);
      if (found) {
        targetPos.current.set(...found.cameraPosition);
        lookTarget.current.set(...found.cameraTarget);
        isTransitioning.current = true;
        return;
      }
    }

    // Overview default
    targetPos.current.copy(DEFAULT_CAMERA_POS);
    lookTarget.current.copy(DEFAULT_TARGET);
    isTransitioning.current = true;
  }, [focusedPartId]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    if (isTransitioning.current) {
      const step = Math.min(delta * 4.2, 0.15);

      camera.position.lerp(targetPos.current, step);
      controlsRef.current.target.lerp(lookTarget.current, step);
      controlsRef.current.update();

      const posDist = camera.position.distanceTo(targetPos.current);
      const targetDist = controlsRef.current.target.distanceTo(lookTarget.current);

      if (posDist < 0.04 && targetDist < 0.04) {
        camera.position.copy(targetPos.current);
        controlsRef.current.target.copy(lookTarget.current);
        isTransitioning.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      minDistance={1.8}
      maxDistance={9.0}
      minPolarAngle={Math.PI / 8}
      maxPolarAngle={Math.PI / 2.05}
      onStart={() => {
        isTransitioning.current = false;
      }}
    />
  );
}

export const SonostExplodedCanvas = forwardRef<HTMLCanvasElement, SonostExplodedCanvasProps>(
  function SonostExplodedCanvas(
    {
      explodeProgress,
      focusedPartId,
      onSelectPart,
      wireframe = false,
      showGuideLines = true,
      className = "w-full h-full",
    },
    ref
  ) {
    return (
      <div className={`relative w-full h-full select-none overflow-hidden bg-[#070a0f] text-white ${className}`}>
        <Canvas
          ref={ref as any}
          shadows
          camera={{ position: [3.8, 2.8, 4.0], fov: 42 }}
          gl={{
            preserveDrawingBuffer: true,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          className="cursor-grab active:cursor-grabbing"
        >
          <Suspense fallback={<Clinical3DLoader statusText="Đang nạp mô hình bóc tách 3D..." />}>
            {/* Clinical Lab Dark HDRI Lighting */}
            <Environment preset="night" environmentIntensity={0.65} />

            {/* Studio Key Light */}
            <directionalLight
              position={[6, 9, 6]}
              intensity={1.4}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-near={0.5}
              shadow-camera-far={25}
              shadow-bias={-0.0001}
            />

            {/* Fill Light with Cyan Hue */}
            <directionalLight position={[-6, 4, -4]} intensity={0.7} color="#38bdf8" />

            {/* High-Tech Cyan Accent Rim Lights */}
            <pointLight position={[-4, 3, 3]} intensity={2.2} color="#06b6d4" distance={9} />
            <pointLight position={[3, 4, -3]} intensity={1.2} color="#0284c7" distance={8} />

            <ambientLight intensity={0.4} />

            {/* Exploded 3D Model with 7 Decoupled Mesh Groups */}
            <SonostExplodedModel
              explodeProgress={explodeProgress}
              focusedPartId={focusedPartId}
              onSelectPart={onSelectPart}
              wireframe={wireframe}
              showGuideLines={showGuideLines}
            />

            {/* Contact Shadows on Base Floor */}
            <ContactShadows
              position={[0, -0.31, 0]}
              opacity={0.8}
              scale={9}
              blur={2.5}
              far={4}
              color="#020617"
            />

            {/* CAD Studio Grid Floor */}
            <Grid
              position={[0, -0.32, 0]}
              args={[14, 14]}
              cellSize={0.4}
              cellThickness={0.8}
              cellColor="#1e293b"
              sectionSize={2.0}
              sectionThickness={1.2}
              sectionColor="#0284c7"
              fadeDistance={10}
              fadeStrength={1.5}
            />

            {/* Camera Controller */}
            <ExplodedCameraController focusedPartId={focusedPartId} />
          </Suspense>
        </Canvas>
      </div>
    );
  }
);

SonostExplodedCanvas.displayName = "SonostExplodedCanvas";
export default SonostExplodedCanvas;
