import React from "react";

type IconName = "user" | "at-sign" | "mail" | "lock" | "phone" | "map-pin";

const paths: Record<IconName, React.ReactNode> = {
  "user": (
    <>
      <circle cx="6" cy="4" r="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 11c0-2.5 2-4 4-4s4 1.5 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  "at-sign": (
    <>
      <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 6c0 1.5.6 2 1.2 2S10.5 7 10.5 6a4.5 4.5 0 1 0-1.3 3.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  "mail": (
    <>
      <rect x="1" y="3" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1 4.5l4.5 3 4.5-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  "lock": (
    <>
      <rect x="2.5" y="5.5" width="7" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  "phone": (
    <>
      <path d="M2 2h2.5L6 4.5l-1.5 1A7 7 0 0 0 8 8l1-1.5 2.5 1v2A1.5 1.5 0 0 1 10.5 12C5.5 12 1 7.5 1 3a1.5 1.5 0 0 1 1-1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </>
  ),
  "map-pin": (
    <>
      <path d="M6 1.5a3 3 3 0 0 1 3 3c0 2.5-3 6-3 6s-3-3.5-3-6a3 3 0 0 1 3-3z" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="6" cy="4.5" r="1" stroke="currentColor" strokeWidth="1.2" />
    </>
  ),
};

interface FieldIconProps {
  name: string;
  className?: string;
}

export function FieldIcon({ name, className = "w-4 h-4" }: FieldIconProps) {
  const icon = paths[name as IconName];
  if (!icon) return null;
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden>
      {icon}
    </svg>
  );
}