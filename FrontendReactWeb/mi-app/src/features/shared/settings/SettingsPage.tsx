"use client";

import React from "react";
import { SettingsSection, SettingsItem, SettingsPageHeader } from "./components/SettingsComponents";

interface SettingsConfig {
  title: string;
  subtitle: string;
  sections: {
    title: string;
    items: {
      icon: React.ElementType;
      label: string;
      onClick: () => void;
      danger?: boolean;
      rightElement?: React.ReactNode;
    }[];
  }[];
  footer?: React.ReactNode;
}

export function SettingsPage({ config }: { config: SettingsConfig }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <SettingsPageHeader title={config.title} subtitle={config.subtitle} />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {config.sections.map((section, i) => (
          <SettingsSection key={i} title={section.title}>
            {section.items.map((item, j) => (
              <SettingsItem
                key={j}
                icon={item.icon}
                label={item.label}
                onClick={item.onClick}
                danger={item.danger}
                rightElement={item.rightElement}
              />
            ))}
          </SettingsSection>
        ))}

        {config.footer && (
          <div
            style={{
              marginTop: 24,
              padding: "16px 20px",
              background: "var(--bg-card)",
              borderRadius: 12,
              border: `1px solid var(--border)`,
            }}
          >
            {config.footer}
          </div>
        )}
      </div>
    </div>
  );
}

export { SettingsSection, SettingsItem, SettingsPageHeader } from "./components/SettingsComponents";