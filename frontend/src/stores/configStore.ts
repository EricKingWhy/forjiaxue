import { create } from "zustand";

import type { ConfigResponse } from "@/types";

type ConfigState = {
  visitor_password_enabled: boolean;
  particle_tier: ConfigResponse["particle_tier_default"];
  bloom_enabled: boolean;
  fallback_button_text: string;
  hydrate: (config: ConfigResponse) => void;
};

export const useConfigStore = create<ConfigState>((set) => ({
  visitor_password_enabled: true,
  particle_tier: "medium",
  bloom_enabled: true,
  fallback_button_text: "识别不到？点击这里继续",
  hydrate: (config) =>
    set({
      visitor_password_enabled: config.visitor_password_enabled,
      particle_tier: config.particle_tier_default,
      bloom_enabled: config.bloom_enabled_default,
      fallback_button_text: config.fallback_button_text,
    }),
}));
