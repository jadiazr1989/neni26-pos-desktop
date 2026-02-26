export function normalizeRangeLabelShort(s: string): string {
    const t = s.trim().toLowerCase();
    if (t === "hoy" || t === "today") return "Hoy";
    if (t.includes("7")) return "Últimos 7 días";
    if (t.includes("30")) return "Últimos 30 días";
    return s;
}