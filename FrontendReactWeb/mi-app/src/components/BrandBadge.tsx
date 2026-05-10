"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { BrandLogo } from "./BrandLogo";

type BrandBadgeProps = {
  href: string;
  title?: string;
  subtitle?: string;
  size?: number;
  titleColor?: string;
  subtitleColor?: string;
  subtitleLetterSpacing?: string;
  gap?: number;
  className?: string;
  style?: CSSProperties;
  rightSlot?: ReactNode;
};

export function BrandBadge({
  href,
  title = "BillNova",
  subtitle = "PLATAFORMA EMPRESARIAL",
  size = 38,
  titleColor = "inherit",
  subtitleColor = "inherit",
  subtitleLetterSpacing = "0.08em",
  gap = 10,
  className,
  style,
  rightSlot,
}: BrandBadgeProps) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap,
          ...style,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap }}>
          <BrandLogo size={size} priority className="brand-logo-image" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: titleColor }}>{title}</div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: subtitleColor,
                letterSpacing: subtitleLetterSpacing,
              }}
            >
              {subtitle}
            </div>
          </div>
        </div>
        {rightSlot}
      </div>
    </Link>
  );
}
