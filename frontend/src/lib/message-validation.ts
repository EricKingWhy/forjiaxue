export const SECRET_MESSAGE_LIMIT = 500;

export function normalizeSecretMessage(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= SECRET_MESSAGE_LIMIT
    ? normalized
    : null;
}
