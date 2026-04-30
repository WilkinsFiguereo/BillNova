import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'odoo_session_token';
const USER_KEY = 'odoo_user_data';
const SESSION_KEY = 'odoo_auth_session';

type PersistedSession<T> = {
  token: string;
  user: T;
};

function canUseSecureStore(): boolean {
  return (
    Platform.OS !== 'web' &&
    typeof SecureStore.getItemAsync === 'function' &&
    typeof SecureStore.setItemAsync === 'function' &&
    typeof SecureStore.deleteItemAsync === 'function'
  );
}

async function setItem(key: string, value: string): Promise<void> {
  const writes: Promise<void>[] = [];

  if (canUseSecureStore()) {
    writes.push(SecureStore.setItemAsync(key, value));
  }

  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
    return;
  }

  writes.push(AsyncStorage.setItem(key, value));
  await Promise.all(writes);
}

async function getItem(key: string): Promise<string | null> {
  if (canUseSecureStore()) {
    const secureValue = await SecureStore.getItemAsync(key);
    if (secureValue) return secureValue;
  }

  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }

  const asyncValue = await AsyncStorage.getItem(key);
  if (asyncValue) return asyncValue;

  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(key);
  }

  return null;
}

async function removeItem(key: string): Promise<void> {
  const removals: Promise<void>[] = [];

  if (canUseSecureStore()) {
    removals.push(SecureStore.deleteItemAsync(key));
  }

  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
    return;
  }

  removals.push(AsyncStorage.removeItem(key));
  await Promise.all(removals);

  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(key);
  }
}

export const tokenStorage = {
  async saveToken(token: string): Promise<void> {
    await setItem(TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    return getItem(TOKEN_KEY);
  },

  async removeToken(): Promise<void> {
    await removeItem(TOKEN_KEY);
  },

  async saveUser(user: object): Promise<void> {
    await setItem(USER_KEY, JSON.stringify(user));
  },

  async getUser<T>(): Promise<T | null> {
    const raw = await getItem(USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async removeUser(): Promise<void> {
    await removeItem(USER_KEY);
  },

  async saveSession<T extends object>(session: PersistedSession<T>): Promise<void> {
    const payload = JSON.stringify(session);
    await Promise.all([
      setItem(SESSION_KEY, payload),
      setItem(TOKEN_KEY, session.token),
      setItem(USER_KEY, JSON.stringify(session.user)),
    ]);
  },

  async getSession<T>(): Promise<PersistedSession<T> | null> {
    const raw = await getItem(SESSION_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<PersistedSession<T>>;
        if (parsed?.token && parsed?.user) {
          return {
            token: parsed.token,
            user: parsed.user,
          };
        }
      } catch {
        // Fallback to legacy keys below.
      }
    }

    const [token, user] = await Promise.all([
      this.getToken(),
      this.getUser<T>(),
    ]);

    if (!token || !user) return null;

    const session = { token, user };
    await this.saveSession(session);
    return session;
  },

  async clearSession(): Promise<void> {
    await Promise.all([removeItem(SESSION_KEY), removeItem(TOKEN_KEY), removeItem(USER_KEY)]);
  },

  async clearAll(): Promise<void> {
    await this.clearSession();
  },
};
