"use client";
<<<<<<< HEAD:FrontendReactWeb/mi-app/src/features/auth/register/ui/PasswordStrengthBar.tsx

=======
>>>>>>> dff76de22c0a24dc5ae37d61aec817b910d4b235:FrontendReactWeb/mi-app/src/features/register/ui/PasswordStrengthBar.tsx
import React from "react";
import { usePasswordStrength } from "../hooks/usePasswordStrength";

interface PasswordStrengthBarProps {
  password: string;
}

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
<<<<<<< HEAD:FrontendReactWeb/mi-app/src/features/auth/register/ui/PasswordStrengthBar.tsx
  const { color, percentage, label } = usePasswordStrength(password);
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="h-0.5 w-full bg-[#1a2235] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: color }} />
      </div>
      {label && <p className="text-[10px] font-medium tracking-wide" style={{ color }}>{label}</p>}
=======

  const { strength, label } = usePasswordStrength(password);
  if (!password) return null;

  return (
    <div className="strength show">
      <div className="strength-track" aria-hidden>
        <span className={`sbar ${strength >= 1 ? "l1" : ""}`} />
        <span className={`sbar ${strength >= 2 ? "l2" : ""}`} />
        <span className={`sbar ${strength >= 3 ? "l3" : ""}`} />
        <span className={`sbar ${strength >= 4 ? "l4" : ""}`} />
      </div>
      <p className="strength-hint">{label}</p>
>>>>>>> dff76de22c0a24dc5ae37d61aec817b910d4b235:FrontendReactWeb/mi-app/src/features/register/ui/PasswordStrengthBar.tsx
    </div>
  );
}