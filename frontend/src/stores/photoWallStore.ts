import { create } from "zustand";

import type { PhotoResponse } from "@/types";

interface PhotoWallState {
  selectedPhoto: PhotoResponse | null;
  selectPhoto: (photo: PhotoResponse) => void;
  clearSelection: () => void;
}

export const usePhotoWallStore = create<PhotoWallState>((set) => ({
  selectedPhoto: null,
  selectPhoto: (selectedPhoto) => set({ selectedPhoto }),
  clearSelection: () => set({ selectedPhoto: null }),
}));
