import type {
  ConfigResponse,
  MusicResponse,
  PasswordVerifyResponse,
  PhotosResponse,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export function resolveApiUrl(pathOrUrl: string): string {
  return new URL(pathOrUrl, `${API_BASE_URL.replace(/\/$/, "")}/`).toString();
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

export function getPhotos(): Promise<PhotosResponse> {
  return request("/api/photos");
}

export function getMusic(): Promise<MusicResponse | null> {
  return request("/api/music");
}

export function getConfig(): Promise<ConfigResponse> {
  return request("/api/config");
}

export function verifyPassword(
  password: string,
): Promise<PasswordVerifyResponse> {
  return request("/api/config/verify-password", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}
