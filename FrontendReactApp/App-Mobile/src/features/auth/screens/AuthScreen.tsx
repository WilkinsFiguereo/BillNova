import React, { useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../../shared/ui/Button';
import { AuthHeader } from '../components/AuthHeader';
import { IconCheck, IconWarning } from '../../../shared/ui/Icons';
import { colors } from '../../../shared/theme/colors';
import { useAuth, useLogin, useRegister } from '../hooks/useAuth';

interface AuthScreenProps {
  onLoginSuccess: () => void;
}

type Tab = 'login' | 'register';
type RegisterField = 'name' | 'login' | 'email' | 'password' | 'confirmPassword';

const REGISTER_NAME_MAX_LENGTH = 50;
const REGISTER_LOGIN_MAX_LENGTH = 20;
const REGISTER_PASSWORD_MAX_LENGTH = 20;

export function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [tab, setTab] = useState<Tab>('login');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [googleLoading, setGoogleLoading] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  const { handleLogin, isLoading: loginLoading, error: loginError, clearError: clearLoginError } = useLogin();
  const { loginWithGoogle } = useAuth();
  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [loginErrors, setLoginErrors] = useState({ login: '', password: '' });

  const { handleRegister, isLoading: registerLoading, error: registerError, success, clearError: clearRegisterError } = useRegister();
  const [registerForm, setRegisterForm] = useState({
    name: '',
    login: '',
    email: '',
    password: '',
    confirmPassword: '',
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

  const validateLogin = () => {
    const errors = { login: '', password: '' };
    if (!loginForm.login.trim()) errors.login = 'El usuario es requerido';
    if (!loginForm.password) errors.password = 'La contrasena es requerida';
    setLoginErrors(errors);
    return !errors.login && !errors.password;
  };

  const validateRegister = () => {
    const errors: Record<string, string> = {};
    if (!registerForm.name.trim()) errors.name = 'El nombre es requerido';
    else if (registerForm.name.trim().length > REGISTER_NAME_MAX_LENGTH) errors.name = `Maximo ${REGISTER_NAME_MAX_LENGTH} caracteres`;

    if (!registerForm.login.trim()) errors.login = 'El usuario es requerido';
    else if (registerForm.login.includes(' ')) errors.login = 'No puede tener espacios';
    else if (registerForm.login.trim().length > REGISTER_LOGIN_MAX_LENGTH) errors.login = `Maximo ${REGISTER_LOGIN_MAX_LENGTH} caracteres`;

    if (!registerForm.email.trim()) errors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(registerForm.email)) errors.email = 'Email invalido';

    if (!registerForm.password) errors.password = 'La contrasena es requerida';
    else if (registerForm.password.length < 6) errors.password = 'Minimo 6 caracteres';
    else if (registerForm.password.length > REGISTER_PASSWORD_MAX_LENGTH) errors.password = `Maximo ${REGISTER_PASSWORD_MAX_LENGTH} caracteres`;

    if (registerForm.confirmPassword.length > REGISTER_PASSWORD_MAX_LENGTH) {
      errors.confirmPassword = `Maximo ${REGISTER_PASSWORD_MAX_LENGTH} caracteres`;
    } else if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = 'No coinciden';
    }

    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async () => {
    setOauthError(null);
    clearLoginError();
    if (!validateLogin()) return;
    const result = await handleLogin(loginForm);
    if (result.ok) onLoginSuccess();
  };

  const handleRegisterSubmit = async () => {
    setOauthError(null);
    clearRegisterError();
    if (!validateRegister()) return;
    await handleRegister({
      name: registerForm.name.trim(),
      login: registerForm.login.trim(),
      email: registerForm.email.trim(),
      password: registerForm.password,
    });
    if (success) setTimeout(() => switchTab('login'), 1200);
  };

  const handleGoogleAuth = async (mode: 'login' | 'register') => {
    setOauthError(null);
    setGoogleLoading(true);
    const result = await loginWithGoogle(mode);
    setGoogleLoading(false);
    if (result.ok) onLoginSuccess();
    else setOauthError(result.error ?? 'No se pudo completar la autenticacion con Google.');
  };

  const updateLogin = (field: keyof typeof loginForm) => (value: string) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
    if (loginErrors[field]) setLoginErrors(prev => ({ ...prev, [field]: '' }));
  };

  const updateRegister = (field: RegisterField) => (value: string) => {
    setRegisterForm(prev => ({ ...prev, [field]: value }));
    if (registerErrors[field]) setRegisterErrors(prev => ({ ...prev, [field]: '' }));
  };

  const renderFieldError = (error?: string) => (error ? <Text style={styles.fieldErrorText}>{error}</Text> : null);
  const isLogin = tab === 'login';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={['#0F1F4D', '#1E3A8A', '#2563EB']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.circleA} />
      <View style={styles.circleB} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
              subtitle={isLogin ? 'Tu plataforma empresarial' : 'Unete y empieza a gestionar tu negocio'}
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
                <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Iniciar sesion</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, !isLogin && styles.tabActive]}
                onPress={() => switchTab('register')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Registrarse</Text>
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

                  <Text style={styles.fieldLabel}>Usuario</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="usuario@empresa.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={loginForm.login}
                    onChangeText={updateLogin('login')}
                  />
                  {renderFieldError(loginErrors.login)}

                  <Text style={styles.fieldLabel}>Contrasena</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••••••"
                    secureTextEntry
                    value={loginForm.password}
                    onChangeText={updateLogin('password')}
                  />
                  {renderFieldError(loginErrors.password)}

                  <TouchableOpacity style={styles.forgotRow}>
                    <Text style={styles.forgotText}>¿Olvidaste tu contrasena?</Text>
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
                    <Text style={styles.footerText}>¿Sin cuenta? </Text>
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
                      <Text style={styles.alertOkText}>¡Cuenta creada! Inicia sesion</Text>
                    </View>
                  )}

                  <Text style={styles.fieldLabel}>Nombre completo</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Juan Perez"
                    maxLength={REGISTER_NAME_MAX_LENGTH}
                    value={registerForm.name}
                    onChangeText={updateRegister('name')}
                  />
                  {renderFieldError(registerErrors.name)}

                  <Text style={styles.fieldLabel}>Email</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="juan@empresa.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={registerForm.email}
                    onChangeText={updateRegister('email')}
                  />
                  {renderFieldError(registerErrors.email)}

                  <Text style={styles.fieldLabel}>Usuario</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="juan.perez"
                    autoCapitalize="none"
                    maxLength={REGISTER_LOGIN_MAX_LENGTH}
                    value={registerForm.login}
                    onChangeText={updateRegister('login')}
                  />
                  {renderFieldError(registerErrors.login)}

                  <Text style={styles.fieldLabel}>Contrasena</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Minimo 6 caracteres"
                    secureTextEntry
                    maxLength={REGISTER_PASSWORD_MAX_LENGTH}
                    value={registerForm.password}
                    onChangeText={updateRegister('password')}
                  />
                  {renderFieldError(registerErrors.password)}

                  <Text style={styles.fieldLabel}>Confirmar contrasena</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••••••"
                    secureTextEntry
                    maxLength={REGISTER_PASSWORD_MAX_LENGTH}
                    value={registerForm.confirmPassword}
                    onChangeText={updateRegister('confirmPassword')}
                  />
                  {renderFieldError(registerErrors.confirmPassword)}

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
                    <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
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
  flex: { flex: 1 },
  circleA: {
    position: 'absolute',
    width: 200,
    height: 200,
    top: -60,
    right: -40,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  circleB: {
    position: 'absolute',
    width: 100,
    height: 100,
    top: 20,
    right: 20,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
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
    width: 32,
    height: 3,
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
    flex: 1,
    height: 36,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.error.soft,
    borderRadius: 10,
    padding: 11,
    marginBottom: 14,
    borderLeftWidth: 2.5,
    borderLeftColor: colors.error.default,
  },
  alertErrText: { flex: 1, fontSize: 12.5, color: colors.error.default },
  alertOk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.success.soft,
    borderRadius: 10,
    padding: 11,
    marginBottom: 14,
    borderLeftWidth: 2.5,
    borderLeftColor: colors.success.default,
  },
  alertOkText: { flex: 1, fontSize: 12.5, color: colors.success.default, fontWeight: '500' },
  fieldLabel: { marginBottom: 4 },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  fieldErrorText: {
    color: 'red',
    marginBottom: 8,
  },
  forgotRow: { alignSelf: 'flex-end', marginTop: -4, marginBottom: 18, padding: 2 },
  forgotText: { fontSize: 12, fontWeight: '500', color: colors.brand[500] },
  submitBtn: { marginBottom: 18 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border.light },
  dividerText: { fontSize: 11, color: colors.text.disabled },
  googleBtn: { marginBottom: 22 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: { fontSize: 12.5, color: colors.text.tertiary },
  footerLink: { fontSize: 12.5, fontWeight: '600', color: colors.brand[600] },
  secure: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 4,
  },
  secureDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.success.default },
  secureText: { fontSize: 10.5, color: colors.text.disabled },
});
