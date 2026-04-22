"use client";

import React from "react";

export function RegisterSuccessSection() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-10">
      <div className="relative flex items-center justify-center">
        <span className="absolute h-20 w-20 rounded-full bg-[#4fbe8e]/10 animate-ping" style={{ animationDuration: "1.5s" }} />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[#4fbe8e]/40 bg-[#4fbe8e]/8">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M6 14l5.5 5.5L22 8"
              stroke="#4fbe8e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="30"
              strokeDashoffset="30"
              style={{ animation: "draw 0.5s ease forwards 0.2s" }}
            />
          </svg>
        </div>
      </div>

      <div className="space-y-1 text-center">
        <h3 className="text-xl font-light tracking-wide text-[#e4ebf5]">Cuenta creada exitosamente</h3>
        <p className="text-sm text-[#7a8fa8]">Revisa tu correo para activar la cuenta.</p>
      </div>

      <div className="h-0.5 w-40 overflow-hidden rounded-full bg-[#1a2235]">
        <div className="h-full rounded-full bg-[#4fbe8e]" style={{ animation: "progress 1.8s linear forwards" }} />
      </div>

      <style>{`
        @keyframes draw { to { stroke-dashoffset: 0; } }
        @keyframes progress { from { width: 0% } to { width: 100%; } }
      `}</style>
    </div>
  );
}
