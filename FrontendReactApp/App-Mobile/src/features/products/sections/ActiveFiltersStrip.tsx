import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { IconX } from '../../../shared/ui/Icons';
import { colors } from '../../../shared/theme/colors';
import { radius } from '../../../shared/theme/spacing';
import type { ActiveFilter } from '../types/products.types';

interface ActiveFiltersStripProps {
  filters:        ActiveFilter[];
  onRemove:       (id: string) => void;
  onClearAll:     () => void;
}

export function ActiveFiltersStrip({ filters, onRemove, onClearAll }: ActiveFiltersStripProps) {
  if (filters.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {filters.map(f => (
          <TouchableOpacity
            key={f.id}
            style={styles.tag}
            onPress={() => onRemove(f.id)}
            activeOpacity={0.75}
          >
            <Text style={styles.tagText}>{f.label}</Text>
            <IconX size={9} color={colors.brand[400]} strokeWidth={2.5} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={onClearAll} style={styles.clearAll}>
          <Text style={styles.clearText}>Limpiar todo</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 7,
  },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.brand[50],
    borderWidth: 1, borderColor: colors.brand[100],
    borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  tagText: { fontSize: 11, fontWeight: '600', color: colors.brand[600] },
  clearAll: { marginLeft: 4 },
  clearText: { fontSize: 11, fontWeight: '600', color: colors.error.default },
});