export function sanitizeReturnTo(value: string): string {
  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) return "/";
  if (trimmed.startsWith("//")) return "/";
  if (trimmed.startsWith("/\\")) return "/";
  return trimmed;
}
