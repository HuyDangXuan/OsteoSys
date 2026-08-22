"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { toast } from "sonner";

export type UIScaleLevel = 85 | 90 | 100 | 110 | 125;

export interface UIScaleConfig {
  value: UIScaleLevel;
  label: string;
  sublabel: string;
  fontSizePx: number;
  description: string;
}

export const UI_SCALE_LEVELS: UIScaleLevel[] = [85, 90, 100, 110, 125];

export const UI_SCALE_CONFIGS: Record<UIScaleLevel, UIScaleConfig> = {
  85: {
    value: 85,
    label: "85%",
    sublabel: "Siêu gọn (Compact)",
    fontSizePx: 13.6,
    description: "Hiển thị nhiều dữ liệu hơn trên cùng một màn hình.",
  },
  90: {
    value: 90,
    label: "90%",
    sublabel: "Gọn gàng",
    fontSizePx: 14.4,
    description: "Tối ưu hóa không gian làm việc cho màn hình laptop 13-14 inch.",
  },
  100: {
    value: 100,
    label: "100%",
    sublabel: "Mặc định (Chuẩn)",
    fontSizePx: 16.0,
    description: "Kích thước tiêu chuẩn tối ưu cho mọi màn hình y tế.",
  },
  110: {
    value: 110,
    label: "110%",
    sublabel: "Thoải mái (Comfort)",
    fontSizePx: 17.6,
    description: "Chữ to rõ ràng, dễ đọc hơn khi quan sát từ khoảng cách xa.",
  },
  125: {
    value: 125,
    label: "125%",
    sublabel: "Phóng to (Large)",
    fontSizePx: 20.0,
    description: "Dành cho màn hình 2K/4K độ phân giải cao hoặc mắt nhìn yếu.",
  },
};

const STORAGE_KEY = "sonost_ui_scale";
const COOKIE_KEY = "sonost_ui_scale";

interface UIScaleContextType {
  scale: UIScaleLevel;
  setScale: (scale: UIScaleLevel, notify?: boolean) => void;
  increaseScale: () => void;
  decreaseScale: () => void;
  resetScale: () => void;
  currentConfig: UIScaleConfig;
  levels: UIScaleLevel[];
  canIncrease: boolean;
  canDecrease: boolean;
}

const UIScaleContext = createContext<UIScaleContextType | null>(null);

function applyHtmlFontSize(scale: UIScaleLevel) {
  if (typeof document === "undefined") return;
  const config = UI_SCALE_CONFIGS[scale] || UI_SCALE_CONFIGS[100];
  document.documentElement.style.fontSize = `${config.fontSizePx}px`;
  document.documentElement.setAttribute("data-ui-scale", String(scale));
}

function saveScalePreference(scale: UIScaleLevel) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, String(scale));
    // Set 1-year cookie for zero-flash server hydration
    document.cookie = `${COOKIE_KEY}=${scale}; path=/; max-age=31536000; SameSite=Lax`;
  } catch (err) {
    console.error("Failed to persist UI scale preference:", err);
  }
}

function getInitialScale(): UIScaleLevel {
  if (typeof window === "undefined") return 100;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && UI_SCALE_LEVELS.includes(Number(saved) as UIScaleLevel)) {
      return Number(saved) as UIScaleLevel;
    }
  } catch {
    // Fallback to default
  }
  return 100;
}

export function UIScaleProvider({ children }: { children: React.ReactNode }) {
  const [scale, setScaleState] = useState<UIScaleLevel>(100);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getInitialScale();
    setScaleState(initial);
    applyHtmlFontSize(initial);
    setMounted(true);
  }, []);

  const setScale = useCallback(
    (newScale: UIScaleLevel, notify: boolean = true) => {
      if (!UI_SCALE_LEVELS.includes(newScale)) return;
      setScaleState(newScale);
      applyHtmlFontSize(newScale);
      saveScalePreference(newScale);

      if (notify) {
        const config = UI_SCALE_CONFIGS[newScale];
        toast.success(`Đã cập nhật tỷ lệ hiển thị: ${config.label} (${config.sublabel})`, {
          id: "ui-scale-toast",
          duration: 2500,
        });
      }
    },
    []
  );

  const increaseScale = useCallback(() => {
    setScaleState((prev) => {
      const currentIndex = UI_SCALE_LEVELS.indexOf(prev);
      if (currentIndex < UI_SCALE_LEVELS.length - 1) {
        const next = UI_SCALE_LEVELS[currentIndex + 1];
        applyHtmlFontSize(next);
        saveScalePreference(next);
        const config = UI_SCALE_CONFIGS[next];
        toast.success(`Đã phóng to: ${config.label} (${config.sublabel})`, {
          id: "ui-scale-toast",
          duration: 2500,
        });
        return next;
      }
      return prev;
    });
  }, []);

  const decreaseScale = useCallback(() => {
    setScaleState((prev) => {
      const currentIndex = UI_SCALE_LEVELS.indexOf(prev);
      if (currentIndex > 0) {
        const prevScale = UI_SCALE_LEVELS[currentIndex - 1];
        applyHtmlFontSize(prevScale);
        saveScalePreference(prevScale);
        const config = UI_SCALE_CONFIGS[prevScale];
        toast.success(`Đã thu nhỏ: ${config.label} (${config.sublabel})`, {
          id: "ui-scale-toast",
          duration: 2500,
        });
        return prevScale;
      }
      return prev;
    });
  }, []);

  const resetScale = useCallback(() => {
    setScaleState(100);
    applyHtmlFontSize(100);
    saveScalePreference(100);
    toast.success("Đã khôi phục tỷ lệ hiển thị mặc định: 100%", {
      id: "ui-scale-toast",
      duration: 2500,
    });
  }, []);

  // Global Keyboard Shortcuts (Ctrl + +, Ctrl + -, Ctrl + 0)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Must have Ctrl or Meta (Command on Mac)
      if (!e.ctrlKey && !e.metaKey) return;

      // Avoid intercepting when user is in input or textarea
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      // We still allow Zoom shortcuts even in inputs because standard browser zoom works globally,
      // but let's check for standard key codes:
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        increaseScale();
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        decreaseScale();
      } else if (e.key === "0") {
        e.preventDefault();
        resetScale();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [increaseScale, decreaseScale, resetScale]);

  const currentIndex = UI_SCALE_LEVELS.indexOf(scale);
  const canIncrease = currentIndex < UI_SCALE_LEVELS.length - 1;
  const canDecrease = currentIndex > 0;
  const currentConfig = UI_SCALE_CONFIGS[scale] || UI_SCALE_CONFIGS[100];

  const value = useMemo(
    () => ({
      scale,
      setScale,
      increaseScale,
      decreaseScale,
      resetScale,
      currentConfig,
      levels: UI_SCALE_LEVELS,
      canIncrease,
      canDecrease,
    }),
    [scale, setScale, increaseScale, decreaseScale, resetScale, currentConfig, canIncrease, canDecrease]
  );

  return <UIScaleContext.Provider value={value}>{children}</UIScaleContext.Provider>;
}

export function useUIScale() {
  const context = useContext(UIScaleContext);
  if (!context) {
    throw new Error("useUIScale must be used within a UIScaleProvider");
  }
  return context;
}
