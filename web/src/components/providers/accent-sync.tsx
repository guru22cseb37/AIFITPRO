"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/use-app-store";

export function AccentSync() {
  const colorTheme = useAppStore((s) => s.colorTheme);

  useEffect(() => {
    document.documentElement.dataset.accent = colorTheme;
  }, [colorTheme]);

  return null;
}
