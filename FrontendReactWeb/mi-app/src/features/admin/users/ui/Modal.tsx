"use client";
import React, { useEffect } from "react";
import { colors, font, radius } from "../theme/tokens";

interface ModalProps {
  open:     boolean;
  onClose:  () => void;
  title:    string;
  width?:   number;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, width, children }: ModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position:   "fixed",
          inset:      0,
          background: "#00000088",
          zIndex:     50,
        }}
      />

      {/* Panel */}
      <div style={{
        position:     "fixed",
        top:          "50%",
        left:         "50%",
        transform:    "translate(-50%, -50%)",
        zIndex:       51,
        width:        "100%",
        maxWidth:     width ?? 480,
        background:   colors.bg.secondary,
        borderRadius: radius.xl,
        border:       `1px solid ${colors.border}`,
        boxShadow:    "0 24px 64px #00000055",
        padding:      "28px 28px 24px",
        boxSizing:    "border-box",
      }}>
        {/* Header */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          marginBottom:   22,
        }}>
          <h2 style={{
            margin:     0,
            fontSize:   font.sizes.lg,
            fontWeight: font.weights.semibold,
            color:      colors.text.primary,
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              background:   "transparent",
              border:       "none",
              cursor:       "pointer",
              color:        colors.text.tertiary,
              fontSize:     20,
              lineHeight:   1,
              padding:      4,
            }}
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </>
  );
}
