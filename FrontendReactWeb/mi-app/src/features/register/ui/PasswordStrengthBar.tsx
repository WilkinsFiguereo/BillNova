"use client";

<<<<<<< HEAD
import React from "react";
=======
>>>>>>> d5a70c78988b43655bd9da58bea46a376cb4ef8a
import { usePasswordStrength } from "../hooks/usePasswordStrength";

interface PasswordStrengthBarProps {
  password: string;
}

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
<<<<<<< HEAD
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
>>>>>>> d5a70c78988b43655bd9da58bea46a376cb4ef8a
    </div>
  );
}