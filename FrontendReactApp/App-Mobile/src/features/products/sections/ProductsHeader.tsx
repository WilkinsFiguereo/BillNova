import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet,
} from 'react-native';
import {
  IconSearch, IconX, IconGrid,
  IconMonitor, IconSettings, IconShirt, IconSmartphone,
  IconSliders,
} from '../../../shared/ui/Icons';
import { colors } from '../../../shared/theme/colors';
import { radius } from '../../../shared/theme/spacing';
import { FILTER_CATEGORIES, SORT_OPTIONS } from '../data/productsData';
import type { FilterState, ViewMode } from '../types/products.types';

// Tiny icon helper for category chips
function ChipIcon({ id, active }: { id: string; active: boolean }) {
  const c = active ? '#fff' : colors.text.tertiary;
  const s = 12;
  switch (id) {
    case 'tech':     return <IconMonitor size={s} color={c} />;
    case 'services': return <IconSettings size={s} color={c} strokeWidth={1.6} />;
    case 'clothing': return <IconShirt size={s} color={c} />;
    case 'mobile':   return <IconSmartphone size={s} color={c} />;
    default:         return <IconGrid size={s} color={c} />;
  }
}

// View-mode icon
function ViewIcon({ mode, active }: { mode: ViewMode; active: boolean }) {
  const c = active ? '#fff' : colors.text.disabled;
  if (mode === 'grid') {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 14, height: 14, gap: 2 }}>
        {[0,1,2,3].map(i => (
          <View key={i} style={{ width: 5, height: 5, borderRadius: 1, backgroundColor: c }} />
        ))}
      </View>
    );
  }
  return (
    <View style={{ gap: 3 }}>
      {[0,1,2].map(i => (
        <View key={i} style={{ width: 14, height: 2.5, borderRadius: 1, backgroundColor: c }} />
      ))}
    </View>
  );
}

interface ProductsHeaderProps {
  query:           string;
  onQueryChange:   (v: string) => void;
  filter:          FilterState;
  onCategoryChange:(id: string) => void;
  viewMode:        ViewMode;
  onViewChange:    (m: ViewMode) => void;
  onFilterPress:   () => void;
  resultCount:     number;
  totalCount:      number;
}

export function ProductsHeader({
  query, onQueryChange,
  filter, onCategoryChange,
  viewMode, onViewChange,
  onFilterPress,
  resultCount, totalCount,
}: ProductsHeaderProps) {
  const sortLabel = SORT_OPTIONS.find(o => o.value === filter.sortBy)?.label ?? 'Relevancia';

  return (
    <View style={styles.wrap}>
      {/* Title row */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Productos</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {resultCount < totalCount ? `${resultCount} de ${totalCount}` : `${totalCount}`}
          </Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.search}>
        <IconSearch size={15} color={query ? colors.brand[500] : colors.text.disabled} strokeWidth={1.8} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={onQueryChange}
          placeholder="Buscar por nombre o código..."
          placeholderTextColor={colors.text.disabled}
          returnKeyType="search"
          autoCapitalize="none"
          clearButtonMode="never"
        />
        {query.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => onQueryChange('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconX size={10} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {FILTER_CATEGORIES.map(cat => {
          const isActive = filter.category === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onCategoryChange(cat.id)}
              activeOpacity={0.75}
            >
              <ChipIcon id={cat.id} active={isActive} />
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Sort bar + view toggle */}
      <View style={styles.sortBar}>
        <TouchableOpacity style={styles.sortBtn} onPress={onFilterPress} activeOpacity={0.75}>
          <IconSliders size={13} color={colors.brand[500]} strokeWidth={1.8} />
          <Text style={styles.sortLabel}>Ordenar: </Text>
          <Text style={styles.sortVal}>{sortLabel}</Text>
        </TouchableOpacity>

        <View style={styles.viewToggle}>
          {(['grid', 'list'] as ViewMode[]).map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.vBtn, viewMode === m && styles.vBtnActive]}
              onPress={() => onViewChange(m)}
            >
              <ViewIcon mode={m} active={viewMode === m} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: '800', color: colors.text.primary, letterSpacing: -0.4 },
  countBadge: {
    backgroundColor: colors.brand[50],
    borderWidth: 1, borderColor: colors.brand[100],
    borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  countText: { fontSize: 12, fontWeight: '600', color: colors.brand[600] },

  // Search
  search: {
    flexDirection: 'row', alignItems: 'center', gap: 9,
    marginHorizontal: 16, marginBottom: 12,
    height: 42,
    backgroundColor: colors.background.primary,
    borderWidth: 1.5, borderColor: colors.border.light,
    borderRadius: radius.full,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1, fontSize: 13,
    color: colors.text.primary, paddingVertical: 0,
  },
  clearBtn: {
    width: 18, height: 18,
    backgroundColor: colors.text.disabled,
    borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
  },

  // Category chips
  chips: {
    flexDirection: 'row', gap: 7,
    paddingHorizontal: 16, paddingBottom: 12,
  },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 13, paddingVertical: 7,
    backgroundColor: colors.background.primary,
    borderWidth: 1.5, borderColor: colors.border.light,
    borderRadius: radius.full,
  },
  chipActive:     { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },
  chipText:       { fontSize: 11.5, fontWeight: '500', color: colors.text.tertiary },
  chipTextActive: { color: '#fff', fontWeight: '600' },

  // Sort bar
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sortLabel: { fontSize: 12, fontWeight: '500', color: colors.text.disabled },
  sortVal:   { fontSize: 12, fontWeight: '700', color: colors.brand[500] },

  viewToggle: { flexDirection: 'row', gap: 4 },
  vBtn: {
    width: 30, height: 30,
    borderWidth: 1.5, borderColor: colors.border.light,
    backgroundColor: colors.background.primary,
    borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  vBtnActive: { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },
});