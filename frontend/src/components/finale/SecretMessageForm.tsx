"use client";

import { FormEvent, useState } from "react";

import { postMessage } from "@/lib/api-client";
import { normalizeSecretMessage, SECRET_MESSAGE_LIMIT } from "@/lib/message-validation";

export function SecretMessageForm() {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = normalizeSecretMessage(content);
    if (!message || status === "sending") return;
    setStatus("sending");
    try {
      await postMessage(message);
      setContent("");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="mt-8 border-t border-[#d6a1a1]/20 pt-6 text-xs tracking-[0.18em] text-[#dfbbb5]" role="status">
        你的话，已经被好好收下。
      </div>
    );
  }

  return (
    <form className="pointer-events-auto mt-7 w-full max-w-md" onSubmit={submit}>
      <label className="mb-3 block text-[10px] tracking-[0.28em] text-[#c9a3a0]/70" htmlFor="secret-message">
        留下一句只属于这里的话
      </label>
      <div className="flex items-end gap-3 border-b border-[#d7a7a7]/30 pb-2 focus-within:border-[#e4b9b4]/65">
        <textarea
          id="secret-message"
          value={content}
          maxLength={SECRET_MESSAGE_LIMIT}
          rows={1}
          onChange={(event) => { setContent(event.target.value); if (status === "error") setStatus("idle"); }}
          placeholder="写在夜色里…"
          className="max-h-24 min-h-8 flex-1 resize-none bg-transparent text-sm leading-6 text-[#f1dfda] outline-none placeholder:text-[#a77f7e]/50"
        />
        <button
          type="submit"
          disabled={!normalizeSecretMessage(content) || status === "sending"}
          className="mb-1 text-[10px] tracking-[0.22em] text-[#e0b1ad] transition hover:text-[#f4d2ce] disabled:cursor-not-allowed disabled:opacity-35"
        >
          {status === "sending" ? "珍藏中…" : "珍藏"}
        </button>
      </div>
      <div className="mt-2 flex justify-between text-[9px] tracking-wider text-[#9c7776]/65">
        <span role="status">{status === "error" ? "暂时没能送达，再试一次。" : "不会公开展示"}</span>
        <span>{content.length}/{SECRET_MESSAGE_LIMIT}</span>
      </div>
    </form>
  );
}
