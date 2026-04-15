// src/features/cart/sections/PromoCodeInput.tsx
import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
} from 'react-native';
import { cartTheme as t } from '../theme/cart.theme';
import type { PromoCode } from '../types/cart.types';

type Props = {
  value:    string;
  onChange: (v: string) => void;
  onApply:  () => void;
  onRemove: () => void;
  applied:  PromoCode | null;
  error:    string;
};

export function PromoCodeInput({
  value, onChange, onApply, onRemove, applied, error,
}: Props) {
  if (applied) {
    return (
      <View style={s.appliedRow}>
        <View>
          <Text style={s.appliedCode}>{applied.code}</Text>
          <Text style={s.appliedLabel}>{applied.label}</Text>
        </View>
        <TouchableOpacity onPress={onRemove} style={s.removeBtn}>
          <Text style={s.removeBtnText}>Quitar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={value}
          onChangeText={onChange}
          placeholder="Código de descuento"
          placeholderTextColor={t.colors.textDisabled}
          autoCapitalize="characters"
          returnKeyType="done"
          onSubmitEditing={onApply}
        />
        <TouchableOpacity onPress={onApply} activeOpacity={0.85} style={s.applyBtn}>
          <Text style={s.applyBtnText}>Aplicar</Text>
        </TouchableOpacity>
      </View>
      {!!error && <Text style={s.error}>{error}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  root:     { gap: t.spacing.xs },
  inputRow: { flexDirection: 'row', gap: t.spacing.sm },
  input: {
    flex: 1,
    height: 46,
    backgroundColor: t.colors.bgCard,
    borderWidth: 1,
    borderColor: t.colors.borderMid,
    borderRadius: t.radius.md,
    paddingHorizontal: t.spacing.md,
    fontSize: t.font.md,
    color: t.colors.textPrimary,
    fontWeight: '600',
  },
  applyBtn: {
    backgroundColor: t.colors.primary,
    borderRadius: t.radius.md,
    paddingHorizontal: t.spacing.lg,
    justifyContent: 'center',
  },
  applyBtnText: {
    color: t.colors.white,
    fontWeight: '700',
    fontSize: t.font.sm,
  },
  error: {
    fontSize: t.font.sm,
    color: t.colors.error,
    fontWeight: '500',
  },
  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: t.colors.successSoft,
    borderRadius: t.radius.md,
    padding: t.spacing.md,
  },
  appliedCode: {
    fontSize: t.font.md,
    fontWeight: '700',
    color: t.colors.success,
  },
  appliedLabel: {
    fontSize: t.font.sm,
    color: t.colors.success,
    fontWeight: '500',
  },
  removeBtn: {
    paddingHorizontal: t.spacing.md,
    paddingVertical: t.spacing.xs,
    borderRadius: t.radius.sm,
    borderWidth: 1,
    borderColor: t.colors.success,
  },
  removeBtnText: {
    color: t.colors.success,
    fontSize: t.font.sm,
    fontWeight: '600',
  },
});