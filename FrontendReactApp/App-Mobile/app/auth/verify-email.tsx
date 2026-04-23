import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';

import { authApi } from '../../src/features/auth/api/authApi';
import { colors } from '../../src/shared/theme/colors';

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; token?: string }>();
  const [email, setEmail] = useState(typeof params.email === 'string' ? params.email : '');
  const [token, setToken] = useState(typeof params.token === 'string' ? params.token : '');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const readyToVerify = useMemo(() => Boolean(email.trim() && token.trim()), [email, token]);

  const verify = async () => {
    if (!email.trim() || !token.trim()) {
      setError('Necesitas el correo y el token del enlace para verificar la cuenta.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    const { data, error: requestError } = await authApi.verifyEmail({
      email: email.trim().toLowerCase(),
      token: token.trim(),
    });

    setIsLoading(false);
    if (!data?.ok) {
      setError(requestError ?? data?.error ?? 'No se pudo verificar la cuenta.');
      return;
    }

    setMessage(data.message ?? 'Cuenta verificada correctamente.');
    setTimeout(() => {
      router.replace('/auth');
    }, 1200);
  };

  const resend = async () => {
    if (!email.trim()) {
      setError('Ingresa tu correo para reenviar el email.');
      return;
    }

    setIsResending(true);
    setError(null);
    setMessage(null);
    const frontendBaseUrl = Linking.createURL('/auth/verify-email');
    const { data, error: requestError } = await authApi.resendVerificationCode(
      email.trim().toLowerCase(),
      frontendBaseUrl,
    );
    setIsResending(false);

    if (!data?.ok) {
      setError(requestError ?? data?.error ?? 'No se pudo reenviar el correo.');
      return;
    }

    setMessage(data.message ?? 'Te enviamos un nuevo correo de verificacion.');
    setCooldown(30);
  };

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.badge}>Verificacion</Text>
        <Text style={styles.title}>Verifica tu correo</Text>
        <Text style={styles.subtitle}>
          Te enviamos un email con un enlace. Si abriste el enlace en el celular, el token se cargara aqui automaticamente.
        </Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="tu@email.com"
          placeholderTextColor={colors.text.disabled}
          style={styles.input}
        />

        <Text style={styles.label}>Token</Text>
        <TextInput
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
          placeholder="Pega aqui el token del enlace"
          placeholderTextColor={colors.text.disabled}
          style={styles.input}
        />

        <TouchableOpacity style={styles.primaryButton} onPress={() => void verify()} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Activar mi cuenta</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, cooldown > 0 && styles.disabledButton]}
          onPress={() => void resend()}
          disabled={isResending || cooldown > 0}
        >
          <Text style={styles.secondaryButtonText}>
            {isResending ? 'Reenviando...' : cooldown > 0 ? `Reenviar en ${cooldown}s` : 'Reenviar correo'}
          </Text>
        </TouchableOpacity>

        {readyToVerify ? (
          <Text style={styles.infoText}>El enlace ya esta cargado. Solo falta confirmar.</Text>
        ) : (
          <Text style={styles.infoText}>Si el enlace no abre la app, copia el token manualmente desde el correo.</Text>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {message ? <Text style={styles.successText}>{message}</Text> : null}

        <View style={styles.linksRow}>
          <TouchableOpacity onPress={() => router.replace('/auth')}>
            <Text style={styles.linkText}>Ir a login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F1F4D',
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 22,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.brand[50],
    color: colors.brand[600],
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 14,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.text.primary, marginBottom: 6 },
  subtitle: { fontSize: 13.5, color: colors.text.tertiary, lineHeight: 20, marginBottom: 18 },
  label: { fontSize: 12.5, fontWeight: '700', color: colors.text.secondary, marginBottom: 6, marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text.primary,
    backgroundColor: '#fff',
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: colors.brand[600],
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  secondaryButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  secondaryButtonText: { color: colors.text.secondary, fontSize: 13.5, fontWeight: '600' },
  disabledButton: { opacity: 0.65 },
  infoText: { marginTop: 12, fontSize: 12.5, color: colors.text.tertiary, lineHeight: 18 },
  errorText: { marginTop: 12, fontSize: 12.5, color: colors.error.default },
  successText: { marginTop: 12, fontSize: 12.5, color: colors.success.default, fontWeight: '600' },
  linksRow: { marginTop: 18, alignItems: 'center' },
  linkText: { fontSize: 13, color: colors.brand[600], fontWeight: '700' },
});
