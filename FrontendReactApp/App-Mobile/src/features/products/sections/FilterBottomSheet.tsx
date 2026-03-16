import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, ScrollView, Pressable,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { IconX } from '../../../shared/ui/Icons';
import { colors } from '../../../shared/theme/colors';
import { radius } from '../../../shared/theme/spacing';
import { FILTER_CATEGORIES, SORT_OPTIONS, MAX_PRICE_LIMIT } from '../data/productsData';
import type { FilterState } from '../types/products.types';

interface FilterBottomSheetProps {
  open:        boolean;
  pending:     FilterState;
  onChange:    (next: Partial<FilterState>) => void;
  onApply:     () => void;
  onReset:     () => void;
  onClose:     () => void;
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.secTitle}>{children}</Text>;
}

function OptionChip({
  label, active, onPress,
}: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipOn]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.chipText, active && styles.chipTextOn]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function FilterBottomSheet({
  open, pending, onChange, onApply, onReset, onClose,
}: FilterBottomSheetProps) {
  const translateY = useRef(new Animated.Value(500)).current;
  const bgOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: open ? 0 : 500,
        useNativeDriver: true,
        tension: 70, friction: 12,
      }),
      Animated.timing(bgOpacity, {
        toValue: open ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [open]);

  if (!open) return null;

  const fmt = (n: number) => `RD$${n.toLocaleString('es-DO', { minimumFractionDigits: 0 })}`;
  const maxPrice = pending.maxPrice || MAX_PRICE_LIMIT;

  return (
    <>
      {/* Backdrop */}
      <Pressable onPress={onClose} style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.backdrop, { opacity: bgOpacity }]} />
      </Pressable>

      {/* Sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Filtros</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <IconX size={15} color={colors.text.disabled} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
          {/* Category */}
          <View style={styles.section}>
            <SectionTitle>Categoría</SectionTitle>
            <View style={styles.chipRow}>
              {FILTER_CATEGORIES.map(cat => (
                <OptionChip
                  key={cat.id}
                  label={cat.label}
                  active={pending.category === cat.id}
                  onPress={() => onChange({ category: cat.id })}
                />
              ))}
            </View>
          </View>

          {/* Price range */}
          <View style={styles.section}>
            <SectionTitle>Precio máximo</SectionTitle>
            <View style={styles.priceRow}>
              <Text style={styles.priceMin}>RD$0</Text>
              <Text style={styles.priceMax}>{fmt(maxPrice)}</Text>
            </View>
            <Slider
              style={{ marginHorizontal: -4 }}
              minimumValue={0}
              maximumValue={MAX_PRICE_LIMIT}
              step={5000}
              value={maxPrice}
              onValueChange={(v: number) => onChange({ maxPrice: v })}
              minimumTrackTintColor={colors.brand[500]}
              maximumTrackTintColor={colors.border.medium}
              thumbTintColor={colors.brand[600]}
            />
            <Text style={styles.priceHint}>
              Mostrando productos hasta {fmt(maxPrice)}
            </Text>
          </View>

          {/* Sort */}
          <View style={[styles.section, { marginBottom: 4 }]}>
            <SectionTitle>Ordenar por</SectionTitle>
            <View style={styles.chipRow}>
              {SORT_OPTIONS.map(opt => (
                <OptionChip
                  key={opt.value}
                  label={opt.label}
                  active={pending.sortBy === opt.value}
                  onPress={() => onChange({ sortBy: opt.value })}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.resetBtn} onPress={onReset}>
            <Text style={styles.resetText}>Restablecer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={onApply}>
            <Text style={styles.applyText}>Aplicar filtros</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 290,
  },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    zIndex: 300, maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12, shadowRadius: 20, elevation: 20,
  },
  handle: {
    width: 36, height: 4,
    backgroundColor: colors.border.medium,
    borderRadius: 2,
    alignSelf: 'center', marginTop: 12, marginBottom: 16,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 16,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text.primary },
  closeBtn: {
    width: 30, height: 30,
    backgroundColor: colors.background.primary,
    borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  body: { flexGrow: 0 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  secTitle: {
    fontSize: 10.5, fontWeight: '700', letterSpacing: 1.2,
    textTransform: 'uppercase', color: colors.text.disabled,
    marginBottom: 10,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: colors.background.primary,
    borderWidth: 1.5, borderColor: colors.border.light,
    borderRadius: radius.full,
  },
  chipOn:     { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },
  chipText:   { fontSize: 12.5, fontWeight: '500', color: colors.text.tertiary },
  chipTextOn: { color: '#fff', fontWeight: '600' },

  priceRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 6,
  },
  priceMin:  { fontSize: 12, color: colors.text.disabled },
  priceMax:  { fontSize: 12, fontWeight: '700', color: colors.brand[600] },
  priceHint: { fontSize: 11, color: colors.text.disabled, marginTop: 4, textAlign: 'center' },

  buttons: {
    flexDirection: 'row', gap: 10,
    padding: 20,
    borderTopWidth: 1, borderTopColor: colors.border.light,
  },
  resetBtn: {
    flex: 1, padding: 13,
    borderWidth: 1.5, borderColor: colors.border.light,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  resetText: { fontSize: 13.5, fontWeight: '600', color: colors.text.tertiary },
  applyBtn: {
    flex: 2, padding: 13,
    backgroundColor: colors.brand[600],
    borderRadius: radius.lg, alignItems: 'center',
  },
  applyText: { fontSize: 13.5, fontWeight: '600', color: '#fff' },
});