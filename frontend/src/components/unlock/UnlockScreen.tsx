import { GestureUnlock } from "./GestureUnlock";

export function UnlockScreen({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#080509] px-5 py-20 text-rose-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(103,38,61,0.18),transparent_48%)]" />
      <div className="relative z-10 w-full">
        <div className="mb-8 text-center">
          <p className="text-[10px] tracking-[0.55em] text-[#c7a08f]/55">ONE LAST SECRET</p>
          <h2 className="mt-4 text-2xl font-light tracking-[0.18em] text-rose-50/90">
            把心意交给镜头
          </h2>
        </div>
        <GestureUnlock onUnlock={onUnlock} />
      </div>
    </div>
  );
}
