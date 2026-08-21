"use client";

import React, { ReactNode } from "react";
import { useIsMounted } from "@/lib/use-mounted";

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component wrapper that renders its children only on the client side.
 * Useful to prevent SSR Hydration Mismatch caused by browser extensions or client-dependent state.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const isMounted = useIsMounted();

  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
