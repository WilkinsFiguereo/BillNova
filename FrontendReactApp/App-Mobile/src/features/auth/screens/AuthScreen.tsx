import React, { useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, KeyboardAvoidingView,
  Platform, StatusBar, Animated, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../../shared/ui/Button';
import { AuthHeader } from '../components/AuthHeader';
import {
  IconWarning, IconCheck,
} from '../../../shared/ui/Icons';
import { useAuth, useLogin, useRegister } from '../hooks/useAuth';
import { colors } from '../../../shared/theme/colors';

interface AuthScreenProps {
  onLoginSuccess: () => void;
}

type Tab = 'login' | 'register';

type RegisterForm = {
  name: string;
  login: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function AuthField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize = 'sentences',
  error,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
  error?: string;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('login');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [googleLoading, setGoogleLoading] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  const {
    handleLogin,
    isLoading: loginLoading,
    error: loginError,
    errorCode,
    verificationEmail: loginVerificationEmail,
    clearError: clearLoginError,
  } = useLogin();
  const { loginWithGoogle } = useAuth();
  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [loginErrors, setLoginErrors] = useState({ login: '', password: '' });

  const {
    handleRegister,
    isLoading: registerLoading,
    error: registerError,
    success,
    verificationEmail,
    message,
    clearError: clearRegisterError,
  } = useRegister();
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    name: '', login: '', email: '', password: '', confirmPassword: '',
  });
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});

  const switchTab = (next: Tab) => {
    if (next === tab) return;
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setTab(next), 120);
  };

  const navigateToVerifyEmail = (email: string) => {
    router.push({
      pathname: '/auth/verify-email',
      params: { email },
    });
  };

  const validateLogin = () => {
    const next = { login: '', password: '' };
    if (!loginForm.login.trim()) next.login = 'El usuario es requerido';
    if (!loginForm.password) next.password = 'La contrasena es requerida';
    setLoginErrors(next);
    return !next.login && !next.password;
  };

  const validateRegister = () => {
    const next: Record<string, string> = {};
    if (!registerForm.name.trim()) next.name = 'El nombre es requerido';
    if (!registerForm.login.trim()) next.login = 'El usuario es requerido';
    if (registerForm.login.includes(' ')) next.login = 'No puede tener espacios';
    if (!registerForm.email.trim()) next.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(registerForm.email)) next.email = 'Email invalido';
    if (!registerForm.password) next.password = 'La contrasena es requerida';
    else if (registerForm.password.length < 6) next.password = 'Minimo 6 caracteres';
    if (registerForm.password !== registerForm.confirmPassword) next.confirmPassword = 'No coinciden';
    setRegisterErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLoginSubmit = async () => {
    setOauthError(null);
    clearLoginError();
    if (!validateLogin()) return;

    const result = await handleLogin(loginForm);
    if (result.ok) {
      onLoginSuccess();
      return;
    }

    if (result.code === 'ACCOUNT_NOT_VERIFIED') {
      navigateToVerifyEmail(result.email ?? loginForm.login);
    }
  };

  const handleRegisterSubmit = async () => {
    setOauthError(null);
    clearRegisterError();
    if (!validateRegister()) return;

    const frontendBaseUrl = Linking.createURL('/auth/verify-email');
    const result = await handleRegister({
      name: registerForm.name.trim(),
      login: registerForm.login.trim(),
      email: registerForm.email.trim().toLowerCase(),
      password: registerForm.password,
      frontend_base_url: frontendBaseUrl,
    });

    if (result.ok) {
      navigateToVerifyEmail(result.email ?? registerForm.email.trim().toLowerCase());
    }
  };

  const handleGoogleAuth = async (mode: 'login' | 'register') => {
    setOauthError(null);
    setGoogleLoading(true);
    const result = await loginWithGoogle(mode);  // ← esto probablemente resuelve antes
    setGoogleLoading(false);                      //   de que el deep link llegue
    if (result.ok) onLoginSuccess();
    else setOauthError(result.error ?? '...');
  };

  const updateLogin = (field: keyof typeof loginForm) => (value: string) => {
    setLoginForm((prev) => ({ ...prev, [field]: value }));
    if (loginErrors[field]) {
      setLoginErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const updateRegister = (field: keyof RegisterForm) => (value: string) => {
    setRegisterForm((prev) => ({ ...prev, [field]: value }));
    if (registerErrors[field]) {
      setRegisterErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const isLogin = tab === 'login';

  return (
    <View style={styles.root}>
      <StatusBar hidden barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={['#0F1F4D', '#1E3A8A', '#2563EB']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.circleA} />
      <View style={styles.circleB} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <AuthHeader
              title={isLogin ? 'Bienvenido' : 'Crear cuenta'}
              titleSoft={isLogin ? 'de vuelta' : undefined}
              subtitle={isLogin
                ? 'Tu plataforma empresarial'
                : 'Unete y empieza a gestionar tu negocio'}
            />
          </View>

          <View style={styles.card}>
            <View style={styles.pill} />

            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tab, isLogin && styles.tabActive]}
                onPress={() => switchTab('login')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
                  Iniciar sesion
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, !isLogin && styles.tabActive]}
                onPress={() => switchTab('register')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
                  Registrarse
                </Text>
              </TouchableOpacity>
            </View>

            <Animated.View style={{ opacity: fadeAnim }}>
              {isLogin && (
                <View>
                  {loginError && (
                    <View style={styles.alertErr}>
                      <IconWarning size={14} />
                      <Text style={styles.alertErrText}>{loginError}</Text>
                    </View>
                  )}
                  {oauthError && (
                    <View style={styles.alertErr}>
                      <IconWarning size={14} />
                      <Text style={styles.alertErrText}>{oauthError}</Text>
                    </View>
                  )}
                  {errorCode === 'ACCOUNT_NOT_VERIFIED' && loginVerificationEmail ? (
                    <TouchableOpacity
                      style={styles.verifyBanner}
                      onPress={() => navigateToVerifyEmail(loginVerificationEmail)}
                    >
                      <Text style={styles.verifyBannerText}>Tu cuenta no esta verificada. Toca aqui para activar tu correo.</Text>
                    </TouchableOpacity>
                  ) : null}

                  <AuthField
                    label="Usuario"
                    placeholder="usuario@empresa.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={loginForm.login}
                    onChangeText={updateLogin('login')}
                    error={loginErrors.login}
                  />
                  <AuthField
                    label="Contrasena"
                    placeholder="••••••••"
                    secureTextEntry
                    autoCapitalize="none"
                    value={loginForm.password}
                    onChangeText={updateLogin('password')}
                    error={loginErrors.password}
                  />

                  <TouchableOpacity style={styles.forgotRow}>
                    <Text style={styles.forgotText}>Olvidaste tu contrasena?</Text>
                  </TouchableOpacity>

                  <Button
                    label="Iniciar sesion"
                    onPress={handleLoginSubmit}
                    isLoading={loginLoading && !googleLoading}
                    style={styles.submitBtn}
                  />

                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>o continua con</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <Button
                    label="Continuar con Google"
                    variant="google"
                    onPress={() => handleGoogleAuth('login')}
                    isLoading={googleLoading}
                    style={styles.googleBtn}
                  />

                  <View style={styles.footer}>
                    <Text style={styles.footerText}>Sin cuenta? </Text>
                    <TouchableOpacity onPress={() => switchTab('register')}>
                      <Text style={styles.footerLink}>Registrate gratis</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {!isLogin && (
                <View>
                  {registerError && (
                    <View style={styles.alertErr}>
                      <IconWarning size={14} />
                      <Text style={styles.alertErrText}>{registerError}</Text>
                    </View>
                  )}
                  {oauthError && (
                    <View style={styles.alertErr}>
                      <IconWarning size={14} />
                      <Text style={styles.alertErrText}>{oauthError}</Text>
                    </View>
                  )}
                  {success && (
                    <View style={styles.alertOk}>
                      <IconCheck size={14} />
                      <Text style={styles.alertOkText}>{message ?? 'Cuenta creada. Revisa tu correo para activarla.'}</Text>
                    </View>
                  )}
                  {verificationEmail ? (
                    <TouchableOpacity
                      style={styles.verifyBanner}
                      onPress={() => navigateToVerifyEmail(verificationEmail)}
                    >
                      <Text style={styles.verifyBannerText}>Abrir pantalla de verificacion para {verificationEmail}</Text>
                    </TouchableOpacity>
                  ) : null}

                  <AuthField
                    label="Nombre completo"
                    placeholder="Juan Perez"
                    value={registerForm.name}
                    onChangeText={updateRegister('name')}
                    error={registerErrors.name}
                  />
                  <AuthField
                    label="Email"
                    placeholder="juan@empresa.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={registerForm.email}
                    onChangeText={updateRegister('email')}
                    error={registerErrors.email}
                  />
                  <AuthField
                    label="Usuario"
                    placeholder="juan.perez"
                    autoCapitalize="none"
                    value={registerForm.login}
                    onChangeText={updateRegister('login')}
                    error={registerErrors.login}
                  />
                  <AuthField
                    label="Contrasena"
                    placeholder="Minimo 6 caracteres"
                    autoCapitalize="none"
                    secureTextEntry
                    value={registerForm.password}
                    onChangeText={updateRegister('password')}
                    error={registerErrors.password}
                  />
                  <AuthField
                    label="Confirmar contrasena"
                    placeholder="••••••••"
                    autoCapitalize="none"
                    secureTextEntry
                    value={registerForm.confirmPassword}
                    onChangeText={updateRegister('confirmPassword')}
                    error={registerErrors.confirmPassword}
                  />

                  <Button
                    label="Crear cuenta"
                    onPress={handleRegisterSubmit}
                    isLoading={registerLoading && !googleLoading}
                    style={styles.submitBtn}
                  />

                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>o continua con</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <Button
                    label="Continuar con Google"
                    variant="google"
                    onPress={() => handleGoogleAuth('register')}
                    isLoading={googleLoading}
                    style={styles.googleBtn}
                  />

                  <View style={styles.footer}>
                    <Text style={styles.footerText}>Ya tienes cuenta? </Text>
                    <TouchableOpacity onPress={() => switchTab('login')}>
                      <Text style={styles.footerLink}>Inicia sesion</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Animated.View>

            <View style={styles.secure}>
              <View style={styles.secureDot} />
              <Text style={styles.secureText}>Conexion cifrada · Odoo ERP</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  circleA: {
    position: 'absolute', width: 200, height: 200,
    top: -60, right: -40, borderRadius: 100,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  circleB: {
    position: 'absolute', width: 100, height: 100,
    top: 20, right: 20, borderRadius: 50,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  scroll: { flexGrow: 1, justifyContent: 'flex-end' },
  hero: { paddingHorizontal: 28, paddingTop: 80, paddingBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 14,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
  },
  pill: {
    width: 32, height: 3,
    backgroundColor: colors.border.light,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 3,
    gap: 3,
    marginBottom: 24,
  },
  tab: {
    flex: 1, height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: colors.brand[700],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.disabled,
  },
  tabTextActive: {
    fontWeight: '600',
    color: colors.brand[600],
  },
  alertErr: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: colors.error.soft,
    borderRadius: 10, padding: 11, marginBottom: 14,
    borderLeftWidth: 2.5, borderLeftColor: colors.error.default,
  },
  alertErrText: { flex: 1, fontSize: 12.5, color: colors.error.default },
  alertOk: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: colors.success.soft,
    borderRadius: 10, padding: 11, marginBottom: 14,
    borderLeftWidth: 2.5, borderLeftColor: colors.success.default,
  },
  alertOkText: { flex: 1, fontSize: 12.5, color: colors.success.default, fontWeight: '500' },
  verifyBanner: {
    backgroundColor: colors.brand[50],
    borderWidth: 1,
    borderColor: colors.brand[100],
    borderRadius: 10,
    padding: 11,
    marginBottom: 14,
  },
  verifyBannerText: { color: colors.brand[600], fontSize: 12.5, fontWeight: '600' },
  fieldBlock: { marginBottom: 12 },
  fieldLabel: { marginBottom: 4, color: colors.text.secondary, fontSize: 12.5, fontWeight: '600' },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 2,
    color: colors.text.primary,
    backgroundColor: '#fff',
  },
  fieldError: { color: colors.error.default, marginBottom: 8, fontSize: 12 },
  forgotRow: { alignSelf: 'flex-end', marginTop: -4, marginBottom: 18, padding: 2 },
  forgotText: { fontSize: 12, fontWeight: '500', color: colors.brand[500] },
  submitBtn: { marginBottom: 18 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border.light },
  dividerText: { fontSize: 11, color: colors.text.disabled },
  googleBtn: { marginBottom: 22 },
  footer: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginBottom: 20,
  },
  footerText: { fontSize: 12.5, color: colors.text.tertiary },
  footerLink: { fontSize: 12.5, fontWeight: '600', color: colors.brand[600] },
  secure: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 5, marginTop: 4,
  },
  secureDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.success.default },
  secureText: { fontSize: 10.5, color: colors.text.disabled },
});
