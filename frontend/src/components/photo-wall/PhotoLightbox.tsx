"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";

import { resolveApiUrl } from "@/lib/api-client";
import { usePhotoWallStore } from "@/stores";

export function PhotoLightbox() {
  const photo = usePhotoWallStore((state) => state.selectedPhoto);
  const clearSelection = usePhotoWallStore((state) => state.clearSelection);

  useEffect(() => {
    if (!photo) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") clearSelection();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [clearSelection, photo]);

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          className="absolute inset-0 z-30 grid place-items-center bg-black/75 p-6 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="放大的回忆照片"
          onClick={clearSelection}
        >
          <motion.div
            className="relative aspect-[4/3] w-full max-w-4xl overflow-hidden rounded-[2rem] border border-rose-100/15 shadow-[0_30px_120px_rgba(120,35,60,0.35)]"
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", stiffness: 150, damping: 22 }}
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={resolveApiUrl(photo.webp_url)}
              alt="我们的回忆"
              fill
              sizes="(max-width: 768px) 92vw, 70vw"
              className="object-contain"
              unoptimized
            />
            <button
              type="button"
              onClick={clearSelection}
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/35 text-xl text-white/80 backdrop-blur-md transition hover:bg-black/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200"
              aria-label="关闭照片"
            >
              ×
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
