"use client";

import { FormEvent, useState } from "react";

import { verifyPassword } from "@/lib/api-client";

type PasswordEntryProps = {
  onSuccess: () => void;
};

export function PasswordEntry({ onSuccess }: PasswordEntryProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await verifyPassword(password);
      if (result.valid) {
        onSuccess();
      } else {
        setError(result.error ?? "密码错误，请再试一次");
      }
    } catch {
      setError("暂时无法验证密码，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mx-auto flex w-full max-w-sm flex-col gap-4" onSubmit={handleSubmit}>
      <label className="text-left text-sm text-rose-950/70" htmlFor="visitor-password">
        私密密码
      </label>
      <input
        id="visitor-password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="rounded-full border border-rose-200 bg-white/70 px-5 py-3 outline-none focus:border-rose-400"
        autoComplete="current-password"
        required
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-rose-600 px-5 py-3 text-white disabled:opacity-60"
      >
        {isSubmitting ? "验证中…" : "进入"}
      </button>
      {error ? <p className="text-sm text-rose-700" role="alert">{error}</p> : null}
    </form>
  );
}
