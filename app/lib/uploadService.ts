import { supabase, isSupabaseConfigured } from './supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  publicUrl?: string;
  error?: string;
  fileName?: string;
}

export async function uploadAudioFile(file: File): Promise<UploadResult> {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, using local URL instead');
      return {
        success: true,
        url: URL.createObjectURL(file),
        publicUrl: URL.createObjectURL(file),
        fileName: file.name,
        error: undefined
      };
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedName}`;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('audio')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error('Upload error:', error);
      // Fallback to local URL if upload fails
      return {
        success: false,
        url: URL.createObjectURL(file),
        publicUrl: URL.createObjectURL(file),
        fileName: file.name,
        error: `Upload failed: ${error.message}. Using local file instead.`
      };
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('audio')
      .getPublicUrl(fileName);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      publicUrl: publicUrlData.publicUrl,
      fileName: file.name,
      error: undefined
    };

  } catch (error) {
    console.error('Unexpected error during upload:', error);
    // Fallback to local URL
    return {
      success: false,
      url: URL.createObjectURL(file),
      publicUrl: URL.createObjectURL(file),
      fileName: file.name,
      error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}. Using local file instead.`
    };
  }
}

export async function uploadMultipleAudioFiles(files: File[]): Promise<UploadResult[]> {
  const uploadPromises = files.map(file => uploadAudioFile(file));
  return Promise.all(uploadPromises);
}
