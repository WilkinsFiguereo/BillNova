import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'odoo_session_token';
const USER_KEY = 'odoo_user_data';

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

  async clearAll(): Promise<void> {
    await Promise.all([removeItem(TOKEN_KEY), removeItem(USER_KEY)]);
  },
};
