type LoadingIndicatorProps = { label?: string };

export function LoadingIndicator({ label = "正在准备这段旅程…" }: LoadingIndicatorProps) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#090308] px-6 text-[#ead8d3]" role="status" aria-live="polite">
      <div className="w-full max-w-xs text-center">
        <div className="mx-auto mb-7 h-10 w-10 rounded-full border border-[#d3a29d]/20 border-t-[#d3a29d]/70 motion-safe:animate-spin" aria-hidden="true" />
        <p className="text-xs tracking-[0.28em] text-[#cfa9a4]/75">{label}</p>
        <div className="mx-auto mt-5 h-px w-24 overflow-hidden bg-[#c79a96]/15">
          <div className="h-full w-1/2 bg-[#d8aaa5]/45 motion-safe:animate-pulse" />
        </div>
      </div>
    </div>
  );
}
