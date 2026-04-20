"use client";

import { useCallback, useEffect, useState } from "react";

type ColorMode = "light" | "dark";

const STORAGE_KEY = "billnova.color_mode";

function applyMode(mode: ColorMode) {
  document.documentElement.classList.toggle("dark", mode === "dark");
}

export function useColorMode() {
  const [mode, setMode] = useState<ColorMode>("light");

  useEffect(() => {
    try {
      const stored = (localStorage.getItem(STORAGE_KEY) as ColorMode | null) ?? null;
      const initial: ColorMode =
        stored === "dark" || stored === "light"
          ? stored
          : window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
            ? "dark"
            : "light";
      setMode(initial);
      applyMode(initial);
    } catch {
      // ignore
    }
  }, []);

  const setColorMode = useCallback((next: ColorMode) => {
    setMode(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    applyMode(next);
  }, []);

  const toggle = useCallback(() => {
    setColorMode(mode === "dark" ? "light" : "dark");
  }, [mode, setColorMode]);

  return { mode, isDark: mode === "dark", setColorMode, toggle };
}
