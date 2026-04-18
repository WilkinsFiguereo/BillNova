'use client';

import React from 'react';
import { Building2, CheckCircle, Clock } from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import type { CompanyStats } from '../types/company.types';

interface StatsSectionProps {
  stats: CompanyStats;
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        marginBottom: 32,
        flexWrap: 'wrap',
      }}
    >
      <StatCard
        label="Total de empresas"
        value={stats.totalCompanies}
        icon={<Building2 size={20} />}
        accentColor="#3B82F6"
      />
      <StatCard
        label="Empresas activas"
        value={stats.activeCompanies}
        icon={<CheckCircle size={20} />}
        accentColor="#10B981"
      />
      <StatCard
        label="Pendientes de activación"
        value={stats.pendingCompanies}
        icon={<Clock size={20} />}
        accentColor="#F59E0B"
      />
    </div>
  );
}
