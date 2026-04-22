"use client";

import { useCallback, useEffect, useState } from "react";

type ColorMode = "light" | "dark";

const STORAGE_KEY = "billnova.color_mode";

function applyMode(mode: ColorMode) {
  document.documentElement.classList.toggle("dark", mode === "dark");
  document.documentElement.style.colorScheme = mode;
  document.body.style.backgroundColor = mode === "dark" ? "#0f172a" : "#f8fafc";
}

function getInitialMode(): ColorMode {
  if (typeof window === "undefined") return "light";

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // ignore
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

export function useColorMode() {
  const [mode, setMode] = useState<ColorMode>(getInitialMode);

  useEffect(() => {
    applyMode(mode);
  }, [mode]);

  const setColorMode = useCallback((next: ColorMode) => {
    setMode(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const toggle = useCallback(() => {
    setColorMode(mode === "dark" ? "light" : "dark");
  }, [mode, setColorMode]);

  return { mode, isDark: mode === "dark", setColorMode, toggle };
}
