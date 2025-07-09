import { supabase } from './supabaseClient';

export async function uploadMediaFile(file: File, bucket: string = 'media') {
  const filePath = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file);
  if (error) throw error;
  return data;
}

export async function getMediaFileUrl(path: string, bucket: string = 'media') {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteMediaFile(path: string, bucket: string = 'media') {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
  return true;
}
