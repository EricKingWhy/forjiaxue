import { PhotoWallCanvas } from "./PhotoWallCanvas";
import { PhotoLightbox } from "./PhotoLightbox";

export function PhotoWallScreen() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070308] text-rose-100">
      <div className="absolute inset-0">
        <PhotoWallCanvas />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-10 text-center">
        <p className="text-xs tracking-[0.45em] text-rose-100/45">CHAPTER II</p>
        <h2 className="mt-3 text-lg font-light tracking-[0.2em] text-rose-50/85">
          每一帧，都是我们
        </h2>
      </div>
      <PhotoLightbox />
    </div>
  );
}
