/** On-device normalization only: upright pixels, bounded memory and a fresh JPEG. */
import { ImageManipulator, SaveFormat, type ImageManipulatorContext, type ImageRef } from 'expo-image-manipulator';

import type { SourceImage } from '@/domain/types';

const MAX_SIDE = 1280;
const JPEG_QUALITY = 0.85;

export class SelfiePreparationError extends Error {
  readonly issue = 'unsupported' as const;

  constructor() {
    super('Unable to prepare selfie');
    this.name = 'SelfiePreparationError';
  }
}

export async function prepareSelfie(uri: string, origin: 'camera' | 'library'): Promise<Omit<SourceImage, 'check'>> {
  let context: ImageManipulatorContext | undefined;
  let image: ImageRef | undefined;
  try {
    // SDK 58 applies EXIF orientation during native decoding (including mirrored EXIF).
    // Decode bounds avoid materializing a full-resolution camera/library bitmap.
    context = ImageManipulator.manipulate(uri, { maxWidth: MAX_SIDE, maxHeight: MAX_SIDE });
    image = await context.renderAsync();
    const result = await image.saveAsync({ format: SaveFormat.JPEG, compress: JPEG_QUALITY });
    if (
      !result.uri ||
      !Number.isFinite(result.width) ||
      !Number.isFinite(result.height) ||
      result.width <= 0 ||
      result.height <= 0 ||
      Math.max(result.width, result.height) > MAX_SIDE
    ) {
      throw new SelfiePreparationError();
    }
    return { uri: result.uri, width: result.width, height: result.height, origin };
  } catch {
    throw new SelfiePreparationError();
  } finally {
    image?.release();
    context?.release();
  }
}
