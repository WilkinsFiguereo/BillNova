"use client";
import React from "react";
import { usePasswordStrength } from "../hooks/usePasswordStrength";

interface PasswordStrengthBarProps {
  password: string;
}

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {

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
    </div>
  );
}