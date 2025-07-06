// Centralized type definitions for the audio streaming app

export interface AudioFile {
  url: string;
  name: string;
  dateAdded?: number | string;
  [key: string]: any; // Allow additional fields for compatibility with Supabase JSON
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  audio_files: AudioFile[];
  is_active: boolean;
  created_at?: string;
}

export interface CloudFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  size: number;
  publicUrl: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  publicUrl?: string;
  error?: string;
  fileName?: string;
}

export interface DownloadResult {
  success: boolean;
  files?: CloudFile[];
  error?: string;
}
