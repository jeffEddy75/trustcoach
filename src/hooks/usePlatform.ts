"use client";

import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";

export type Platform = "ios" | "android" | "web";

interface UsePlatformReturn {
  platform: Platform;
  isNative: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isWeb: boolean;
  isReady: boolean;
}

/**
 * Hook pour détecter la plateforme (iOS, Android, Web)
 * @example
 * const { isNative, platform } = usePlatform();
 * if (isNative) {
 *   // Code spécifique mobile
 * }
 */
export function usePlatform(): UsePlatformReturn {
  const [isReady, setIsReady] = useState(false);
  const [platform, setPlatform] = useState<Platform>("web");

  useEffect(() => {
    const detectPlatform = () => {
      if (Capacitor.isNativePlatform()) {
        const p = Capacitor.getPlatform();
        if (p === "ios") {
          setPlatform("ios");
        } else if (p === "android") {
          setPlatform("android");
        } else {
          setPlatform("web");
        }
      } else {
        setPlatform("web");
      }
      setIsReady(true);
    };

    detectPlatform();
  }, []);

  return {
    platform,
    isNative: platform === "ios" || platform === "android",
    isIOS: platform === "ios",
    isAndroid: platform === "android",
    isWeb: platform === "web",
    isReady,
  };
}
