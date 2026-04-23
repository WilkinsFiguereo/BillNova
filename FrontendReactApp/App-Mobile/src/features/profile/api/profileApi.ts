import { odooClient } from '../../../core/api/odooClient';
import type {
  MobileProfileResponse,
  UpdateMobileProfilePayload,
} from '../types/profile.types';

export const profileApi = {
  getCurrent: () =>
    odooClient.get<MobileProfileResponse>('/api/mobile/profile', { requiresAuth: true }),

  updateCurrent: (payload: UpdateMobileProfilePayload) =>
    odooClient.put<MobileProfileResponse>('/api/mobile/profile', payload, { requiresAuth: true }),
};
