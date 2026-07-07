"use client";

type NextButtonProps = {
  targetId: string;
  label?: string;
};

export function NextButton({ targetId, label = "下一步" }: NextButtonProps) {
  return (
    <button
      type="button"
      onClick={() =>
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" })
      }
      className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/30 bg-black/25 px-6 py-3 text-sm text-white backdrop-blur"
    >
      {label}
    </button>
  );
}
