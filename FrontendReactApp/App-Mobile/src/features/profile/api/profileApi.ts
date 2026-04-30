import { odooClient } from '../../../core/api/odooClient';
import { tokenStorage } from '../../../core/storage/tokenStorage';
import type {
  MobileProfileResponse,
  UpdateMobileProfilePayload,
} from '../types/profile.types';

export const profileApi = {
  getCurrent: async () => {
    const token = await tokenStorage.getToken();
    console.log('[mobile][profileApi] getCurrent request', {
      hasToken: Boolean(token),
      tokenPreview: token ? `${token.slice(0, 12)}...` : null,
    });

    const response = await odooClient.get<MobileProfileResponse>('/api/mobile/profile', { requiresAuth: true });
    console.log('[mobile][profileApi] getCurrent response', {
      status: response.status,
      hasData: Boolean(response.data),
      ok: response.data?.ok ?? null,
      error: response.error ?? response.data?.error ?? null,
      uid: response.data?.data?.uid ?? null,
      login: response.data?.data?.login ?? null,
    });
    return response;
  },

  updateCurrent: async (payload: UpdateMobileProfilePayload) => {
    const token = await tokenStorage.getToken();
    console.log('[mobile][profileApi] updateCurrent request', {
      hasToken: Boolean(token),
      tokenPreview: token ? `${token.slice(0, 12)}...` : null,
      payload: {
        ...payload,
        password: payload.password ? '***' : undefined,
        avatar: payload.avatar ? '[base64-image]' : undefined,
      },
    });

    const response = await odooClient.put<MobileProfileResponse>('/api/mobile/profile', payload, { requiresAuth: true });
    console.log('[mobile][profileApi] updateCurrent response', {
      status: response.status,
      hasData: Boolean(response.data),
      ok: response.data?.ok ?? null,
      error: response.error ?? response.data?.error ?? null,
      uid: response.data?.data?.uid ?? null,
      login: response.data?.data?.login ?? null,
    });
    return response;
  },
};
