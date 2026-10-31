export type IdentifierKind = "email" | "phone";

export function normalizeIdentifier(value: string): string {
  const trimmed = value.trim();
  if (trimmed.includes("@")) return trimmed.toLowerCase();

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) {
    return `+7${digits.slice(1)}`;
  }
  if (digits.length === 10 && digits.startsWith("9")) {
    return `+7${digits}`;
  }
  return digits ? `+${digits}` : "";
}

export function getIdentifierKind(value: string): IdentifierKind | null {
  const normalized = normalizeIdentifier(value);
  if (normalized.includes("@")) {
    return normalized.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
      ? "email"
      : null;
  }
  return /^\+[1-9]\d{9,14}$/.test(normalized) ? "phone" : null;
}

export function toLocalUnionId(normalizedIdentifier: string): string {
  return `local:${normalizedIdentifier}`;
}
