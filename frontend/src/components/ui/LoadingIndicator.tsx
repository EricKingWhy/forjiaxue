type LoadingIndicatorProps = {
  label?: string;
};

export function LoadingIndicator({ label = "正在准备这段旅程…" }: LoadingIndicatorProps) {
  return (
    <div className="grid min-h-screen place-items-center bg-rose-50 text-rose-900" role="status">
      <div className="flex flex-col items-center gap-4">
        <span className="h-9 w-9 animate-spin rounded-full border-2 border-rose-200 border-t-rose-600" aria-hidden="true" />
        <span>{label}</span>
      </div>
    </div>
  );
}
