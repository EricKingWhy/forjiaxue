export interface PhotoResponse {
  id: number;
  webp_url: string;
  particle_map_url?: string;
  thumbnail_url?: string;
  is_main_photo?: boolean;
  display_order?: number;
}

export interface MusicResponse {
  id: number;
  music_url: string;
  original_filename: string;
  is_active?: boolean;
}

export interface PhotosResponse {
  main_photo: PhotoResponse | null;
  wall_photos: PhotoResponse[];
}

export interface ConfigResponse {
  visitor_password_enabled: boolean;
  bloom_enabled_default: boolean;
  particle_tier_default: "high" | "medium" | "low";
  fallback_button_text: string;
}

export interface BlessingResponse {
  paragraphs: string[];
}

export interface MessageCreate {
  content: string;
}

export interface MessageResponse {
  id: number;
  created_at: string;
}

export interface PasswordVerifyResponse {
  valid: boolean;
  error?: string;
}

// --- Admin types ---
export interface AdminAuthResponse {
  token: string;
  expires_at: string;
}

export interface AdminPhotoResponse {
  id: number;
  original_filename: string;
  webp_url: string;
  thumbnail_url: string;
  particle_map_url: string;
  display_order: number;
  is_main_photo: boolean;
  created_at: string;
}

export interface AdminMessageResponse {
  id: number;
  content: string;
  visitor_id: string | null;
  created_at: string;
  is_read: boolean;
}

export interface AdminMessagesResponse {
  messages: AdminMessageResponse[];
  unread_count: number;
}

export interface AdminConfigUpdate {
  visitor_password_enabled?: boolean;
  visitor_password?: string;
  bloom_enabled_default?: boolean;
  particle_tier_default?: "high" | "medium" | "low";
  fallback_button_text?: string;
}

export interface AdminStatsResponse {
  total_visits: number;
  unique_visitors: number;
  messages_count: number;
  unread_messages: number;
  avg_duration_seconds: number;
}

export type ScreenName = "entry" | "christmas-tree" | "unlock" | "finale";
