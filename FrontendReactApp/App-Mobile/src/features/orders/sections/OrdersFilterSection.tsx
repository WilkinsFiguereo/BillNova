import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from 'react-native';
import { ordersTheme as t } from '../theme/orders.theme';
import type { FilterTab } from '../types/orders.types';

const FILTERS: { key: FilterTab; label: string }[] = [
  { key: 'all',       label: 'Todos' },
  { key: 'pending',   label: 'Pendientes' },
  { key: 'confirmed', label: 'Confirmados' },
  { key: 'delivered', label: 'Entregados' },
  { key: 'cancelled', label: 'Cancelados' },
];

interface Props {
  active: FilterTab;
  search: string;
  onFilterChange: (f: FilterTab) => void;
  onSearchChange: (v: string) => void;
}

export function OrdersFilterSection({ active, search, onFilterChange, onSearchChange }: Props) {
  return (
    <View style={s.root}>
      {/* Search */}
      <View style={s.searchRow}>
        <TextInput
          style={s.input}
          placeholder="Buscar por referencia..."
          placeholderTextColor={t.colors.textDisabled}
          value={search}
          onChangeText={onSearchChange}
        />
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabs}>
        {FILTERS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => onFilterChange(key)}
            style={[s.tab, active === key && s.tabActive]}
            activeOpacity={0.7}
          >
            <Text style={[s.tabText, active === key && s.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { paddingHorizontal: t.spacing.xl, marginBottom: t.spacing.md },
  searchRow: {
    borderWidth: 1, borderColor: t.colors.border,
    borderRadius: t.radius.md, backgroundColor: t.colors.bgCard,
    marginBottom: t.spacing.md,
  },
  input: {
    height: 42, paddingHorizontal: t.spacing.lg,
    fontSize: t.font.md, color: t.colors.textPrimary,
  },
  tabs: { gap: t.spacing.sm, paddingBottom: 4 },
  tab: {
    paddingHorizontal: t.spacing.lg, paddingVertical: 7,
    borderRadius: t.radius.full, backgroundColor: t.colors.bgAlt,
  },
  tabActive: { backgroundColor: t.colors.primary },
  tabText: { fontSize: t.font.sm, fontWeight: '600', color: t.colors.textSecondary },
  tabTextActive: { color: t.colors.white },
});