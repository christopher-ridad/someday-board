import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { supabase } from '@/lib/supabase';

const BUCKET = 'memory-photos';
const MAX_DIMENSION = 640;
const JPEG_QUALITY = 0.62;

// Resizes/compresses a picked photo to the same targets the original web app
// used (max 640px edge, jpeg 0.62), then uploads it to the user's folder in
// the private `memory-photos` bucket. Returns the storage object path to
// save on the memory row (not the image itself).
export async function uploadMemoryPhoto(userId: string, itemId: string, sourceUri: string) {
  const rendered = await ImageManipulator.manipulate(sourceUri).resize({ width: MAX_DIMENSION }).renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: JPEG_QUALITY });

  const file = new File(saved.uri);
  const bytes = await file.arrayBuffer();

  const path = `${userId}/${itemId}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;

  return path;
}

// Private bucket, so every render needs a fresh signed URL rather than a
// public one.
export async function getSignedPhotoUrl(path: string, expiresInSeconds = 3600) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}
