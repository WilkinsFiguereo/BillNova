"use client";

<<<<<<< HEAD
import React from "react";

export function RegisterSuccessSection() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-10">
      <div className="relative flex items-center justify-center">
        <span className="absolute w-20 h-20 rounded-full bg-[#4fbe8e]/10 animate-ping" style={{ animationDuration: "1.5s" }} />
        <div className="relative w-16 h-16 rounded-full border border-[#4fbe8e]/40 flex items-center justify-center bg-[#4fbe8e]/8">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M6 14l5.5 5.5L22 8" stroke="#4fbe8e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="30" strokeDashoffset="30" style={{ animation: "draw 0.5s ease forwards 0.2s" }} />
          </svg>
        </div>
      </div>
      <div className="text-center space-y-1">
        <h3 className="text-[#e4ebf5] text-xl font-light tracking-wide">Cuenta creada exitosamente</h3>
        <p className="text-[#7a8fa8] text-sm">Redirigiendo al inicio de sesión…</p>
      </div>
      <div className="w-40 h-0.5 bg-[#1a2235] rounded-full overflow-hidden">
        <div className="h-full bg-[#4fbe8e] rounded-full" style={{ animation: "progress 2.2s linear forwards" }} />
      </div>
      <style>{`
        @keyframes draw { to { stroke-dashoffset: 0; } }
        @keyframes progress { from { width: 0% } to { width: 100% } }
      `}</style>
=======
export function RegisterSuccessSection() {
  return (
    <div className="success-wrap show">
      <div className="success-ring" aria-hidden>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path d="M5.5 13l5 5L20.5 8" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h3 className="success-title">Cuenta creada exitosamente</h3>
      <p className="success-sub">Redirigiendo al inicio de sesion...</p>

      <div className="progress-line" aria-hidden>
        <div className="progress-fill" />
      </div>
>>>>>>> d5a70c78988b43655bd9da58bea46a376cb4ef8a
    </div>
  );
}