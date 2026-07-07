import type {
  AdminAuthResponse,
  AdminConfigUpdate,
  AdminMessagesResponse,
  AdminPhotoResponse,
  AdminStatsResponse,
  BlessingResponse,
  ConfigResponse,
  MusicResponse,
  MessageResponse,
  PasswordVerifyResponse,
  PhotosResponse,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export function resolveApiUrl(pathOrUrl: string): string {
  return new URL(pathOrUrl, `${API_BASE_URL.replace(/\/$/, "")}/`).toString();
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(resolveApiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

// --- Public APIs ---
export function getPhotos(): Promise<PhotosResponse> {
  return request("/api/photos");
}

export function getMusic(): Promise<MusicResponse | null> {
  return request("/api/music");
}

export function getConfig(): Promise<ConfigResponse> {
  return request("/api/config");
}

export function getBlessing(): Promise<BlessingResponse> {
  return request("/api/blessing");
}

export function postMessage(content: string): Promise<MessageResponse> {
  return request("/api/messages", {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function verifyPassword(
  password: string,
): Promise<PasswordVerifyResponse> {
  return request("/api/config/verify-password", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

// --- Admin APIs ---
export function adminAuth(password: string): Promise<AdminAuthResponse> {
  return request("/api/admin/auth", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export function adminUploadPhoto(
  token: string,
  file: File,
  isMainPhoto: boolean = false,
  displayOrder: number = 0,
): Promise<AdminPhotoResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("is_main_photo", String(isMainPhoto));
  formData.append("display_order", String(displayOrder));

  return request("/api/admin/photos", {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  }) as Promise<AdminPhotoResponse>;
}

export function adminDeletePhoto(
  token: string,
  photoId: number,
): Promise<{ deleted: boolean }> {
  return request(`/api/admin/photos/${photoId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function adminUpdatePhoto(
  token: string,
  photoId: number,
  data: { is_main_photo?: boolean; display_order?: number },
): Promise<AdminPhotoResponse> {
  return request(`/api/admin/photos/${photoId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export function adminGetMessages(
  token: string,
): Promise<AdminMessagesResponse> {
  return request("/api/admin/messages", {
    headers: authHeaders(token),
  });
}

export function adminMarkMessageRead(
  token: string,
  messageId: number,
  isRead: boolean,
): Promise<{ id: number; is_read: boolean }> {
  return request(`/api/admin/messages/${messageId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ is_read: isRead }),
  });
}

export function adminUpdateConfig(
  token: string,
  data: AdminConfigUpdate,
): Promise<ConfigResponse> {
  return request("/api/admin/config", {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export function adminUpdateBlessing(
  token: string,
  paragraphs: string[],
): Promise<{ id: number; paragraphs: string[]; updated_at: string }> {
  return request("/api/admin/blessing", {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ paragraphs }),
  });
}

export function adminGetStats(
  token: string,
): Promise<AdminStatsResponse> {
  return request("/api/admin/stats", {
    headers: authHeaders(token),
  });
}

export function adminUploadMusic(
  token: string,
  file: File,
): Promise<MusicResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return request("/api/admin/music", {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  }) as Promise<MusicResponse>;
}
