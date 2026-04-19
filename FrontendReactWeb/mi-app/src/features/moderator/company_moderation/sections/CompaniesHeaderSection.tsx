"use client";

import React from "react";
import { Building2, CheckCircle, XCircle, Clock } from "lucide-react";
import { companiesTheme as t } from "../theme/companies.theme";
import { CompanyStatCardUI } from "../ui/CompaniesUI";

interface CompaniesHeaderSectionProps {
  counters: Record<string, number>;
}

export function CompaniesHeaderSection({ counters }: CompaniesHeaderSectionProps) {
  const stats = [
    {
      label: "Pending Review",
      value: String(counters.pending ?? 0),
      Icon: Clock,
      delta: "Awaiting approval",
      color: t.warning,
      bg: t.warningBg,
    },
    {
      label: "Approved",
      value: String(counters.approved ?? 0),
      Icon: CheckCircle,
      delta: "Active on platform",
      color: t.success,
      bg: t.successBg,
    },
    {
      label: "Rejected",
      value: String(counters.rejected ?? 0),
      Icon: XCircle,
      delta: "With observations",
      color: t.error,
      bg: t.errorBg,
    },
    {
      label: "Total Registered",
      value: String(counters.all ?? 0),
      Icon: Building2,
      delta: "Current data",
      color: t.brand400,
      bg: t.brand100,
    },
  ];

  return (
    <div style={{ marginBottom: 28, animation: "slideIn 0.4s ease" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: t.textPrimary, letterSpacing: "-0.02em" }}>
          Company Moderation
        </h1>
        <p style={{ fontSize: 13, color: t.textSecondary, marginTop: 4 }}>
          Review and approve registered companies before activating them on the platform.
        </p>
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16, animation: "slideIn 0.5s ease 0.1s both",
      }}>
        {stats.map((stat) => (
          <CompanyStatCardUI key={stat.label} stat={stat} />
        ))}
      </div>
    </div>
  );
}
