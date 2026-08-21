import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Hook to safely determine if the component has mounted on the client.
 * Uses useSyncExternalStore to avoid React 19 hydration mismatch and cascading render warnings.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
