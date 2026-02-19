import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../shared/theme/colors';
import { typography, fontFamily } from '../../../shared/theme/typography';
import { spacing } from '../../../shared/theme/spacing';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        <View style={styles.logoInner}>
          <Ionicons name="briefcase" size={28} color={colors.text.inverse} />
        </View>
      </View>
      <Text style={styles.brand}>OdooApp</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoWrapper: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: colors.brand[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.brand[600],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoInner: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.brand[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    letterSpacing: 3,
    color: colors.brand[400],
    textTransform: 'uppercase',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.subtitle,
    textAlign: 'center',
    color: colors.text.secondary,
  },
});