"use client";

import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { SONOST_HOTSPOTS } from "./hotspot-data";

interface CameraControllerProps {
  activeHotspot: string | null;
  autoRotate: boolean;
  onUserInteract?: () => void;
  presetView?: "overview" | "front" | "top" | "side" | "rear" | "iso" | null;
}

const DEFAULT_CAMERA_POS = new THREE.Vector3(3.4, 2.5, 3.6);
const DEFAULT_TARGET = new THREE.Vector3(0, 0.4, 0);

export function CameraController({
  activeHotspot,
  autoRotate,
  onUserInteract,
  presetView,
}: CameraControllerProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  const targetPos = useRef<THREE.Vector3>(DEFAULT_CAMERA_POS.clone());
  const lookTarget = useRef<THREE.Vector3>(DEFAULT_TARGET.clone());
  const isTransitioning = useRef<boolean>(true);

  // Update target positions when activeHotspot or presetView changes
  useEffect(() => {
    if (activeHotspot) {
      const found = SONOST_HOTSPOTS.find((h) => h.id === activeHotspot);
      if (found) {
        targetPos.current.set(...found.cameraPosition);
        lookTarget.current.set(...found.cameraTarget);
        isTransitioning.current = true;
        return;
      }
    }

    if (presetView) {
      switch (presetView) {
        case "front":
          targetPos.current.set(0, 0.6, 4.2);
          lookTarget.current.set(0, 0.4, 0);
          break;
        case "rear":
          targetPos.current.set(0, 1.3, -3.6);
          lookTarget.current.set(0, 0.6, -1.0);
          break;
        case "top":
          targetPos.current.set(0, 4.8, 0.1);
          lookTarget.current.set(0, 0.2, 0);
          break;
        case "side":
          targetPos.current.set(-4.5, 1.2, 0);
          lookTarget.current.set(0, 0.4, 0);
          break;
        case "iso":
        case "overview":
        default:
          targetPos.current.copy(DEFAULT_CAMERA_POS);
          lookTarget.current.copy(DEFAULT_TARGET);
          break;
      }
      isTransitioning.current = true;
      return;
    }

    // Default overview
    targetPos.current.copy(DEFAULT_CAMERA_POS);
    lookTarget.current.copy(DEFAULT_TARGET);
    isTransitioning.current = true;
  }, [activeHotspot, presetView]);

  // Smooth lerp camera every frame
  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    if (isTransitioning.current) {
      const step = Math.min(delta * 4.2, 0.15);

      camera.position.lerp(targetPos.current, step);
      controlsRef.current.target.lerp(lookTarget.current, step);
      controlsRef.current.update();

      // Check if settled
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
      maxDistance={7.5}
      minPolarAngle={Math.PI / 8}
      maxPolarAngle={Math.PI / 2.05}
      autoRotate={autoRotate && !activeHotspot && !isTransitioning.current}
      autoRotateSpeed={0.9}
      onStart={() => {
        isTransitioning.current = false;
        onUserInteract?.();
      }}
    />
  );
}

export default CameraController;
