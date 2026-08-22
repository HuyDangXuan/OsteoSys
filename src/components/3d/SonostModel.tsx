"use client";

import React, { Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import SonostMockModel from "./SonostMockModel";

interface SonostModelProps {
  modelUrl?: string;
  wireframe?: boolean;
  activeHotspot?: string | null;
  onHotspotClick?: (id: string) => void;
}

function GLTFModel({
  modelUrl,
  wireframe,
  onHotspotClick,
}: {
  modelUrl: string;
  wireframe?: boolean;
  onHotspotClick?: (id: string) => void;
}) {
  try {
    const { scene } = useGLTF(modelUrl);
    // Apply wireframe override if requested
    scene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (wireframe !== undefined) {
          child.material.wireframe = wireframe;
        }
      }
    });
    return <primitive object={scene} scale={[1.2, 1.2, 1.2]} position={[0, -0.2, 0]} />;
  } catch (error) {
    console.warn("Could not load GLTF model from", modelUrl, "falling back to procedural model:", error);
    return <SonostMockModel wireframe={wireframe} onHotspotClick={onHotspotClick} />;
  }
}

export function SonostModel({
  modelUrl,
  wireframe = false,
  activeHotspot,
  onHotspotClick,
}: SonostModelProps) {
  if (modelUrl) {
    return (
      <Suspense fallback={<SonostMockModel wireframe={wireframe} activeHotspot={activeHotspot} onHotspotClick={onHotspotClick} />}>
        <GLTFModel modelUrl={modelUrl} wireframe={wireframe} onHotspotClick={onHotspotClick} />
      </Suspense>
    );
  }

  return (
    <SonostMockModel
      wireframe={wireframe}
      activeHotspot={activeHotspot}
      onHotspotClick={onHotspotClick}
    />
  );
}

export default SonostModel;
