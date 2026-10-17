/**
 * Service registry. With `EXPO_PUBLIC_API_URL` set, the app talks to the VIBRA LOOK API
 * (real translation + YouCam renders). Without it — local UI work — it runs the Phase 1 mocks,
 * which never fake a result: their renders carry the simulation seal.
 */
import { API_URL } from './http/client';
import { endCurrent } from './http/remote';
import { httpRenderService, httpSelfieService, httpVibeService } from './http/services';
import { mockRenderService, mockSelfieService } from './mock/render';
import { mockVibeService } from './mock/vibe';
import type { Services } from './types';

/**
 * True when the app runs on simulated services (development without a backend only).
 * A release build never falls back to mocks: without the URL its calls fail visibly.
 */
export const USING_MOCK_SERVICES = API_URL === '' && __DEV__;

if (!__DEV__ && API_URL === '') console.error('EXPO_PUBLIC_API_URL is not set: this build cannot reach the VIBRA LOOK API');

export const services: Services = USING_MOCK_SERVICES
  ? { vibe: mockVibeService, render: mockRenderService, selfie: mockSelfieService, endSession: () => undefined }
  : { vibe: httpVibeService, render: httpRenderService, selfie: httpSelfieService, endSession: endCurrent };

export * from './types';
