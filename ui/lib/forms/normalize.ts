export function normalizeOptionalText(v: string): string | null {
  const s = v.trim();
  return s ? s : null;
}

export function normalizeRequiredText(v: string): string {
  return v.trim();
}
