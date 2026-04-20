"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  const t = {
    bgCard: "var(--bg-card)",
    border: "var(--border)",
    text3: "var(--text-secondary)",
  };

  return (
    <div
      style={{
        background: t.bgCard,
        borderRadius: 12,
        border: `1px solid ${t.border}`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 20px",
          borderBottom: `1px solid ${t.border}`,
          fontSize: 12,
          fontWeight: 600,
          color: t.text3,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>{children}</div>
    </div>
  );
}

interface SettingsItemProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
  rightElement?: React.ReactNode;
}

export function SettingsItem({
  icon: Icon,
  label,
  onClick,
  danger = false,
  rightElement,
}: SettingsItemProps) {
  const t = {
    text1: "var(--text-primary)",
    text2: "var(--text-secondary)",
    text3: "var(--text-secondary)",
    error: "var(--error-500)",
    border: "var(--border)",
    bgAlt: "var(--bg-alt)",
  };

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "14px 20px",
        cursor: "pointer",
        transition: "background 0.15s",
        borderBottom: `1px solid ${t.border}`,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = t.bgAlt)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <Icon
        size={20}
        style={{
          color: danger ? t.error : t.text2,
          marginRight: 14,
        }}
      />
      <span
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: 500,
          color: danger ? t.error : t.text1,
        }}
      >
        {label}
      </span>
      {rightElement || (
        <ChevronRight size={18} style={{ color: t.text3 }} />
      )}
    </div>
  );
}

interface SettingsPageHeaderProps {
  title: string;
  subtitle: string;
}

export function SettingsPageHeader({ title, subtitle }: SettingsPageHeaderProps) {
  const t = {
    text3: "var(--text-secondary)",
    text1: "var(--text-primary)",
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <h1
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: t.text3,
          margin: 0,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: t.text1,
          margin: "4px 0 0",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}

interface SettingsPageLayoutProps {
  children: React.ReactNode;
}

export function SettingsPageLayout({ children }: SettingsPageLayoutProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      {children}
    </div>
  );
}