// Placeholder types - will be defined based on API contracts
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
  original_filename?: string;
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