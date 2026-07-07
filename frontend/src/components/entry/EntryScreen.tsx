"use client";

export function EntryScreen() {
  return (
    <div className="relative w-full">
      <iframe
        src="/particle-effect-1.html"
        className="h-screen w-full border-0"
        style={{ pointerEvents: "none" }}
        title="粒子效果 1"
      />
      <iframe
        src="/particle-effect-2.html"
        className="h-screen w-full border-0"
        style={{ pointerEvents: "none" }}
        title="粒子效果 2"
      />
    </div>
  );
}
