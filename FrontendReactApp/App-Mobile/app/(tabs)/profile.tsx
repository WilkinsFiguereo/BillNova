import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { profileApi } from '../../src/features/profile/api/profileApi';
import { tokenStorage } from '../../src/core/storage/tokenStorage';
import type { MobileProfile } from '../../src/features/profile/types/profile.types';
import { useAuth, useLogout } from '../../src/features/auth/hooks/useAuth';
import { colors } from '../../src/shared/theme/colors';

type FormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  multiline = false,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  editable?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.disabled}
        style={[styles.input, multiline && styles.inputMultiline, !editable && styles.inputDisabled]}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        editable={editable}
      />
    </View>
  );
}

function emptyForm(profile?: MobileProfile | null): FormState {
  return {
    name: profile?.name ?? '',
    email: profile?.email ?? '',
    phone: profile?.phone ?? '',
    address: profile?.address ?? '',
    password: '',
  };
}

export default function ProfileTab() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { logout } = useLogout();

  const [profile, setProfile] = useState<MobileProfile | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    const [token, storedUser] = await Promise.all([
      tokenStorage.getToken(),
      tokenStorage.getUser(),
    ]);

    console.log('[mobile][profile] loadProfile start', {
      authUser: user
        ? {
            uid: user.uid,
            login: user.login,
            name: user.name,
            company_id: user.company_id ?? null,
          }
        : null,
      hasToken: Boolean(token),
      tokenPreview: token ? `${token.slice(0, 12)}...` : null,
      storedUser,
    });

    setLoading(true);
    setError(null);

    const { data, error: requestError } = await profileApi.getCurrent();
    if (!data?.ok || !data.data) {
      console.log('[mobile][profile] loadProfile failed', {
        requestError,
        dataError: data?.error ?? null,
        statusOk: data?.ok ?? null,
      });
      setError(requestError ?? data?.error ?? 'No se pudo cargar tu perfil.');
      setLoading(false);
      return;
    }

    console.log('[mobile][profile] loadProfile success', {
      profile: data.data,
    });
    setProfile(data.data);
    setForm(emptyForm(data.data));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const initials = useMemo(() => {
    return (form.name || user?.name || user?.login || 'U')
      .split(' ')
      .filter(Boolean)
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [form.name, user?.login, user?.name]);

  const updateField = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) {
      Alert.alert('Nombre requerido', 'Ingresa tu nombre para guardar los cambios.');
      return;
    }
    if (!form.email.trim()) {
      Alert.alert('Correo requerido', 'Ingresa tu correo para guardar los cambios.');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      password: form.password.trim() || undefined,
    };

    console.log('[mobile][profile] handleSave start', {
      payload: {
        ...payload,
        password: payload.password ? '***' : undefined,
      },
    });

    const { data, error: requestError } = await profileApi.updateCurrent(payload);
    if (!data?.ok || !data.data) {
      console.log('[mobile][profile] handleSave failed', {
        requestError,
        dataError: data?.error ?? null,
        statusOk: data?.ok ?? null,
      });
      setSaving(false);
      setError(requestError ?? data?.error ?? 'No se pudo guardar tu perfil.');
      return;
    }

    console.log('[mobile][profile] handleSave success', {
      profile: data.data,
    });
    setProfile(data.data);
    setForm(emptyForm(data.data));
    await updateUser({
      uid: data.data.uid,
      login: data.data.login,
      name: data.data.name,
      email: data.data.email,
      phone: data.data.phone,
      address: data.data.address,
      role: data.data.role,
      company_id: data.data.company_id ?? null,
      company_name: data.data.company_name ?? null,
    });
    setSaving(false);
    Alert.alert('Perfil actualizado', 'Tus datos se guardaron correctamente.');
  }, [form, updateUser]);

  const handleLogout = useCallback(() => {
    Alert.alert('Cerrar sesion', 'Estas seguro de que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth');
        },
      },
    ]);
  }, [logout, router]);

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={colors.brand[600]} />
        <Text style={styles.stateText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (error && !profile) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.stateTitle}>No se pudo cargar tu cuenta</Text>
        <Text style={styles.stateText}>{error}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => void loadProfile()}>
          <Text style={styles.primaryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.heroTitle}>{form.name || user?.name || 'Mi perfil'}</Text>
        <Text style={styles.heroSubtitle}>Administra tu cuenta y tu informacion personal</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Text style={styles.metaLabel}>{profile?.company_name ?? 'Sin empresa'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Datos de la cuenta</Text>
        <Field label="Usuario" value={profile?.login ?? user?.login ?? ''} editable={false} />
        <Field label="Nombre completo" value={form.name} onChangeText={updateField('name')} placeholder="Tu nombre" />
        <Field label="Correo" value={form.email} onChangeText={updateField('email')} placeholder="correo@empresa.com" />
        <Field label="Telefono" value={form.phone} onChangeText={updateField('phone')} placeholder="Tu telefono" />
        <Field
          label="Direccion"
          value={form.address}
          onChangeText={updateField('address')}
          placeholder="Tu direccion"
          multiline
        />

        <Text style={styles.sectionTitle}>Seguridad</Text>
        <Field
          label="Nueva contrasena"
          value={form.password}
          onChangeText={updateField('password')}
          placeholder="Deja vacio para mantener la actual"
          secureTextEntry
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={[styles.primaryButton, saving && styles.buttonDisabled]} onPress={() => void handleSave()} disabled={saving}>
          <Text style={styles.primaryButtonText}>{saving ? 'Guardando...' : 'Guardar cambios'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Resumen</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Empresa</Text>
          <Text style={styles.summaryValue}>{profile?.company_name ?? 'No asignada'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Correo de acceso</Text>
          <Text style={styles.summaryValue}>{profile?.email ?? user?.email ?? 'Sin correo'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.primary },
  content: { padding: 20, gap: 16, paddingBottom: 36 },
  hero: {
    backgroundColor: '#0F1F4D',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: { color: '#fff', fontSize: 30, fontWeight: '800' },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 14,
  },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  metaChip: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  metaLabel: { color: '#fff', fontSize: 11.5, fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 14,
  },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 7,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text.primary,
    backgroundColor: '#fff',
  },
  inputMultiline: { minHeight: 90, textAlignVertical: 'top' },
  inputDisabled: { backgroundColor: colors.background.primary, color: colors.text.disabled },
  errorText: {
    color: colors.error.default,
    fontSize: 12.5,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: colors.brand[600],
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  buttonDisabled: { opacity: 0.7 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  summaryLabel: { color: colors.text.secondary, fontSize: 12.5, fontWeight: '600' },
  summaryValue: { color: colors.text.primary, fontSize: 13, fontWeight: '700', maxWidth: '58%', textAlign: 'right' },
  logoutButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error.soft,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.18)',
  },
  logoutText: { color: colors.error.default, fontSize: 14, fontWeight: '700' },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
    padding: 24,
    gap: 10,
  },
  stateTitle: { color: colors.text.primary, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  stateText: { color: colors.text.tertiary, fontSize: 13.5, textAlign: 'center' },
});
