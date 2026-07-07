type ErrorMessageProps = { message: string; onRetry?: () => void };

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#090308] px-6 text-center" role="alert">
      <div className="max-w-sm border-y border-[#cf9d98]/20 py-10">
        <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-[#b98b88]/65">A brief pause</p>
        <h1 className="text-lg font-light tracking-[0.18em] text-[#f0ddd8]">旅程暂时停在这里</h1>
        <p className="mt-4 text-xs leading-6 text-[#c5aaa6]/70">{message}</p>
        {onRetry && <button type="button" onClick={onRetry} className="mt-7 border-b border-[#dbada8]/50 pb-1 text-xs tracking-[0.2em] text-[#e2bbb6]">再试一次</button>}
      </div>
    </div>
  );
}
