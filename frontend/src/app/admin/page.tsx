"use client";

import { useCallback, useEffect, useState } from "react";
import {
  adminAuth,
  adminDeletePhoto,
  adminGetMessages,
  adminGetStats,
  adminMarkMessageRead,
  adminUpdateBlessing,
  adminUpdateConfig,
  adminUpdatePhoto,
  adminUploadPhoto,
  getConfig,
  getBlessing,
  resolveApiUrl,
} from "@/lib/api-client";
import type {
  AdminMessagesResponse,
  AdminPhotoResponse,
  AdminStatsResponse,
  ConfigResponse,
} from "@/types";

const TOKEN_KEY = "forjiaxue_admin_token";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// --- Login ---
function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError("");
      try {
        const res = await adminAuth(password);
        setToken(res.token);
        onLogin(res.token);
      } catch {
        setError("密码错误");
      } finally {
        setLoading(false);
      }
    },
    [password, onLogin],
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <form
        onSubmit={handleSubmit}
        className="w-80 rounded-xl border border-slate-700 bg-slate-900 p-6"
      >
        <h1 className="mb-6 text-center text-xl font-semibold text-rose-200">
          管理员登录
        </h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="管理员密码"
          className="mb-4 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-rose-400 focus:outline-none"
        />
        {error && (
          <p className="mb-3 text-center text-sm text-red-400">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500 disabled:opacity-50"
        >
          {loading ? "验证中…" : "登录"}
        </button>
      </form>
    </div>
  );
}

// --- Tab navigation ---
type Tab = "photos" | "messages" | "config" | "blessing" | "stats";

function TabBar({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  const tabs: { key: Tab; label: string }[] = [
    { key: "photos", label: "照片" },
    { key: "messages", label: "留言" },
    { key: "config", label: "配置" },
    { key: "blessing", label: "祝福语" },
    { key: "stats", label: "统计" },
  ];
  return (
    <nav className="flex gap-1 border-b border-slate-700 px-4">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            active === key
              ? "border-b-2 border-rose-400 text-rose-300"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

// --- Photos panel ---
function PhotosPanel({ token }: { token: string }) {
  const [photos, setPhotos] = useState<AdminPhotoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(resolveApiUrl("/api/photos"));
      const data = await res.json();
      const all: AdminPhotoResponse[] = [
        ...(data.main_photo ? [data.main_photo] : []),
        ...(data.wall_photos || []),
      ];
      setPhotos(all);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching data then updating state is standard pattern
    refresh();
  }, [refresh]);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        await adminUploadPhoto(token, file);
        await refresh();
      } catch (err) {
        alert("上传失败: " + (err instanceof Error ? err.message : "未知错误"));
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    [token, refresh],
  );

  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm("确认删除这张照片？")) return;
      try {
        await adminDeletePhoto(token, id);
        await refresh();
      } catch (err) {
        alert("删除失败: " + (err instanceof Error ? err.message : "未知错误"));
      }
    },
    [token, refresh],
  );

  const handleSetMain = useCallback(
    async (id: number) => {
      try {
        await adminUpdatePhoto(token, id, { is_main_photo: true });
        await refresh();
      } catch (err) {
        alert("设置失败: " + (err instanceof Error ? err.message : "未知错误"));
      }
    },
    [token, refresh],
  );

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-400">加载中…</div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-4">
        <label className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-300 hover:border-rose-400">
          <span>{uploading ? "上传中…" : "上传照片"}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
        <span className="text-xs text-slate-500">
          共 {photos.length} 张照片
        </span>
      </div>

      {photos.length === 0 ? (
        <p className="text-center text-sm text-slate-500">暂无照片，点击上传</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative rounded-lg border border-slate-700 bg-slate-800 overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- admin dashboard, external API images */}
              <img
                src={resolveApiUrl(photo.thumbnail_url || photo.webp_url)}
                alt={photo.original_filename}
                className="aspect-square w-full object-cover"
              />
              {photo.is_main_photo && (
                <span className="absolute left-1 top-1 rounded bg-rose-600 px-1.5 py-0.5 text-xs font-medium text-white">
                  主照片
                </span>
              )}
              <div className="absolute inset-0 flex items-end justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 pb-2">
                {!photo.is_main_photo && (
                  <button
                    onClick={() => handleSetMain(photo.id)}
                    className="rounded bg-slate-600 px-2 py-1 text-xs text-white hover:bg-slate-500"
                  >
                    设为主照片
                  </button>
                )}
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="rounded bg-red-700 px-2 py-1 text-xs text-white hover:bg-red-600"
                >
                  删除
                </button>
              </div>
              <p className="truncate px-2 py-1 text-xs text-slate-400">
                {photo.original_filename}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Messages panel ---
function MessagesPanel({ token }: { token: string }) {
  const [data, setData] = useState<AdminMessagesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setData(await adminGetMessages(token));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching data then updating state is standard pattern
    refresh();
  }, [refresh]);

  const handleMarkRead = useCallback(
    async (id: number, isRead: boolean) => {
      try {
        await adminMarkMessageRead(token, id, isRead);
        await refresh();
      } catch {
        /* ignore */
      }
    },
    [token, refresh],
  );

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-400">加载中…</div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-sm text-red-400">加载失败</div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-4">
        <span className="text-sm text-slate-300">
          共 {data.messages.length} 条留言
        </span>
        {data.unread_count > 0 && (
          <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs font-medium text-white">
            {data.unread_count} 未读
          </span>
        )}
      </div>

      {data.messages.length === 0 ? (
        <p className="text-center text-sm text-slate-500">暂无留言</p>
      ) : (
        <div className="space-y-2">
          {data.messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-lg border p-3 ${
                msg.is_read
                  ? "border-slate-700 bg-slate-800"
                  : "border-rose-700 bg-slate-800/80"
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {new Date(msg.created_at).toLocaleString("zh-CN")}
                </span>
                <button
                  onClick={() => handleMarkRead(msg.id, !msg.is_read)}
                  className={`rounded px-2 py-0.5 text-xs ${
                    msg.is_read
                      ? "bg-slate-700 text-slate-400 hover:bg-slate-600"
                      : "bg-rose-600 text-white hover:bg-rose-500"
                  }`}
                >
                  {msg.is_read ? "标为未读" : "标为已读"}
                </button>
              </div>
              <p className="text-sm text-slate-200">{msg.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Config panel ---
function ConfigPanel({ token }: { token: string }) {
  const [, setConfig] = useState<ConfigResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // form state
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [bloomEnabled, setBloomEnabled] = useState(true);
  const [particleTier, setParticleTier] = useState<"high" | "medium" | "low">(
    "high",
  );
  const [fallbackText, setFallbackText] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    getConfig()
      .then((c) => {
        setConfig(c);
        setPasswordEnabled(c.visitor_password_enabled);
        setBloomEnabled(c.bloom_enabled_default);
        setParticleTier(c.particle_tier_default);
        setFallbackText(c.fallback_button_text);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const update: Record<string, unknown> = {
        visitor_password_enabled: passwordEnabled,
        bloom_enabled_default: bloomEnabled,
        particle_tier_default: particleTier,
        fallback_button_text: fallbackText,
      };
      if (newPassword) update.visitor_password = newPassword;
      await adminUpdateConfig(token, update);
      setNewPassword("");
      alert("配置已保存");
    } catch (err) {
      alert("保存失败: " + (err instanceof Error ? err.message : "未知错误"));
    } finally {
      setSaving(false);
    }
  }, [token, passwordEnabled, bloomEnabled, particleTier, fallbackText, newPassword]);

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-400">加载中…</div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-3">
        <span className="text-sm text-slate-300">访客密码保护</span>
        <button
          onClick={() => setPasswordEnabled(!passwordEnabled)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            passwordEnabled ? "bg-rose-600" : "bg-slate-600"
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              passwordEnabled ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      {passwordEnabled && (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
          <label className="mb-1 text-xs text-slate-400">新访客密码（留空不改）</label>
          <input
            type="text"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-200"
          />
        </div>
      )}

      <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-3">
        <span className="text-sm text-slate-300">Bloom 光效</span>
        <button
          onClick={() => setBloomEnabled(!bloomEnabled)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            bloomEnabled ? "bg-rose-600" : "bg-slate-600"
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              bloomEnabled ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
        <label className="mb-1 text-xs text-slate-400">粒子数量层级</label>
        <select
          value={particleTier}
          onChange={(e) =>
            setParticleTier(e.target.value as "high" | "medium" | "low")
          }
          className="w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-200"
        >
          <option value="high">高 (60,000)</option>
          <option value="medium">中 (30,000)</option>
          <option value="low">低 (12,000)</option>
        </select>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
        <label className="mb-1 text-xs text-slate-400">解锁备用按钮文字</label>
        <input
          type="text"
          value={fallbackText}
          onChange={(e) => setFallbackText(e.target.value)}
          className="w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-200"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500 disabled:opacity-50"
      >
        {saving ? "保存中…" : "保存配置"}
      </button>
    </div>
  );
}

// --- Blessing panel ---
function BlessingPanel({ token }: { token: string }) {
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getBlessing()
      .then((b) => setParagraphs(b.paragraphs))
      .catch(() => setParagraphs([""]))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await adminUpdateBlessing(token, paragraphs.filter((p) => p.trim()));
      alert("祝福语已保存");
    } catch (err) {
      alert("保存失败: " + (err instanceof Error ? err.message : "未知错误"));
    } finally {
      setSaving(false);
    }
  }, [token, paragraphs]);

  const addParagraph = useCallback(() => {
    setParagraphs((prev) => [...prev, ""]);
  }, []);

  const removeParagraph = useCallback((index: number) => {
    setParagraphs((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateParagraph = useCallback((index: number, text: string) => {
    setParagraphs((prev) => prev.map((p, i) => (i === index ? text : p)));
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-400">加载中…</div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {paragraphs.map((p, i) => (
        <div key={i} className="flex gap-2">
          <textarea
            value={p}
            onChange={(e) => updateParagraph(i, e.target.value)}
            rows={2}
            className="flex-1 rounded border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-200 resize-none"
          />
          <button
            onClick={() => removeParagraph(i)}
            className="rounded bg-red-700 px-2 py-1 text-xs text-white hover:bg-red-600"
          >
            删除
          </button>
        </div>
      ))}
      <button
        onClick={addParagraph}
        className="rounded border border-slate-600 bg-slate-800 px-3 py-1 text-sm text-slate-300 hover:border-rose-400"
      >
        + 添加段落
      </button>
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500 disabled:opacity-50"
      >
        {saving ? "保存中…" : "保存祝福语"}
      </button>
    </div>
  );
}

// --- Stats panel ---
function StatsPanel({ token }: { token: string }) {
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetStats(token)
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-400">加载中…</div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center text-sm text-red-400">加载失败</div>
    );
  }

  const items = [
    { label: "总访问次数", value: stats.total_visits },
    { label: "独立访客", value: stats.unique_visitors },
    { label: "留言总数", value: stats.messages_count },
    { label: "未读留言", value: stats.unread_messages },
    {
      label: "平均停留",
      value:
        stats.avg_duration_seconds > 0
          ? `${Math.round(stats.avg_duration_seconds / 60)} 分钟`
          : "暂无数据",
    },
  ];

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-lg border border-slate-700 bg-slate-800 p-4 text-center"
          >
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-lg font-semibold text-rose-200">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Main admin page ---
export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("photos");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const saved = getToken();
    if (saved) {
      // verify token is still valid
      fetch(resolveApiUrl("/api/admin/stats"), {
        headers: { Authorization: `Bearer ${saved}` },
      })
        .then((res) => {
          if (res.ok) setToken(saved);
          else clearToken();
        })
        .catch(() => clearToken())
        .finally(() => setChecking(false));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR guard: no saved token means skip verification
      setChecking(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    clearToken();
    setToken(null);
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-sm text-slate-400">验证登录状态…</p>
      </div>
    );
  }

  if (!token) {
    return <LoginScreen onLogin={setToken} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
        <h1 className="text-base font-semibold text-rose-200">
          ForJiaXue 管理后台
        </h1>
        <div className="flex items-center gap-3">
          <a
            href="/ForJiaXue"
            className="text-xs text-slate-400 hover:text-rose-300"
          >
            ← 返回主页
          </a>
          <button
            onClick={handleLogout}
            className="rounded border border-slate-600 px-3 py-1 text-xs text-slate-300 hover:border-rose-400"
          >
            退出
          </button>
        </div>
      </header>
      <TabBar active={tab} onChange={setTab} />
      <main className="mx-auto max-w-3xl">
        {tab === "photos" && <PhotosPanel token={token} />}
        {tab === "messages" && <MessagesPanel token={token} />}
        {tab === "config" && <ConfigPanel token={token} />}
        {tab === "blessing" && <BlessingPanel token={token} />}
        {tab === "stats" && <StatsPanel token={token} />}
      </main>
    </div>
  );
}
