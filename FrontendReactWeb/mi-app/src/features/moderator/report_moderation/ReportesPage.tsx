"use client";


import React from 'react';
import { SharedReportsPage } from '@/features/shared/reports/SharedReportsPage';
import { ReportsSidebar } from '@/features/shared/reports/ReportsSidebar';
import { useReportes } from './hooks/useReportes';

export function ReportesPage() {
  const { reportes, isLoading } = useReportes();

  return (
    <SharedReportsPage
      reportes={reportes}
      isLoading={isLoading}
      sidebar={
        <ReportsSidebar
          backHref="/navigation/moderation/dashboard/page"
          backLabel="Volver al Dashboard"
        />
      }
    />
  );
}
