"use client";


import React from 'react';
import { SharedReportsPage } from '@/features/shared/reports/SharedReportsPage';
import { ReportsSidebar } from '@/features/shared/reports/ReportsSidebar';

export function ReportesPage() {
  return (
    <SharedReportsPage
      sidebar={
        <ReportsSidebar
          backHref="/navigation/moderation/dashboard/page"
          backLabel="Volver al Dashboard"
        />
      }
    />
  );
}
