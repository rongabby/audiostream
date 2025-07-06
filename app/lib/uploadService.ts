import { supabase, isSupabaseConfigured } from './supabase';
import { UploadResult, CloudFile, DownloadResult } from '@/types';

export { UploadResult, CloudFile, DownloadResult };

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

export async function getCloudFiles(): Promise<DownloadResult> {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase not configured. Cannot access cloud files.'
      };
    }

    // List all files in the audio bucket
    const { data, error } = await supabase.storage
      .from('audio')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('Error listing cloud files:', error);
      return {
        success: false,
        error: `Failed to fetch cloud files: ${error.message}`
      };
    }

    if (!data || data.length === 0) {
      return {
        success: true,
        files: []
      };
    }

    // Get public URLs for all files
    const cloudFiles: CloudFile[] = data
      .filter((file: any) => file.name.toLowerCase().endsWith('.mp3') || file.name.toLowerCase().endsWith('.wav') || file.name.toLowerCase().endsWith('.m4a'))
      .map((file: any) => {
        const { data: publicUrlData } = supabase.storage
          .from('audio')
          .getPublicUrl(file.name);

        return {
          name: file.name,
          id: file.id || file.name,
          updated_at: file.updated_at || '',
          created_at: file.created_at || '',
          last_accessed_at: file.last_accessed_at || '',
          size: file.metadata?.size || 0,
          publicUrl: publicUrlData.publicUrl
        };
      });

    return {
      success: true,
      files: cloudFiles
    };

  } catch (error) {
    console.error('Unexpected error fetching cloud files:', error);
    return {
      success: false,
      error: `Failed to fetch cloud files: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export async function uploadMultipleAudioFiles(files: File[]): Promise<UploadResult[]> {
  const uploadPromises = files.map(file => uploadAudioFile(file));
  return Promise.all(uploadPromises);
}
