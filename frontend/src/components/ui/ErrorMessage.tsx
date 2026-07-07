type ErrorMessageProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="grid min-h-screen place-items-center bg-rose-50 px-6 text-center" role="alert">
      <div className="max-w-md rounded-3xl border border-rose-200 bg-white/80 p-8 shadow-sm">
        <h1 className="mb-3 text-xl font-semibold text-rose-950">暂时没能打开这段旅程</h1>
        <p className="text-rose-900/70">{message}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 rounded-full bg-rose-600 px-6 py-2 text-white"
          >
            再试一次
          </button>
        ) : null}
      </div>
    </div>
  );
}
