"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export function Modal(props: {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: number;
  children: React.ReactNode;
}) {
  const { open, onClose, title, width = 520, children } = props;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.45)",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
      onMouseDown={(e) => {
        // Close only when clicking the backdrop, not the dialog content.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: width,
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          overflow: "hidden",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700 }}>{title ?? ""}</div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            style={{
              border: 0,
              background: "transparent",
              fontSize: 22,
              lineHeight: 1,
              cursor: "pointer",
              opacity: 0.75,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 16 }}>{children}</div>
      </div>
    </div>,
    document.body
  );
}

