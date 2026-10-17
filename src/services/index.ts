/**
 * Service registry. Phase 2: replace the mock entries with the backend client.
 */
import { mockRenderService, mockSelfieService } from './mock/render';
import { mockVibeService } from './mock/vibe';
import type { Services } from './types';

export const services: Services = {
  vibe: mockVibeService,
  render: mockRenderService,
  selfie: mockSelfieService,
};

/** True while the app runs on simulated services (Phase 1). Drives the simulation seal. */
export const USING_MOCK_SERVICES = true;

export * from './types';
