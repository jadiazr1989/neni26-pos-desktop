// src/modules/admin/dashboard/utils/dashboardDeltas.ts
export type DeltaTone = "good" | "bad" | "neutral";

export function formatPctBpsSigned(bps: number): { label: string; tone: DeltaTone } {
  if (!Number.isFinite(bps) || bps === 0) return { label: "0.0%", tone: "neutral" };
  const pct = bps / 100;
  const abs = Math.abs(pct).toFixed(1);
  const up = bps > 0;
  return { label: `${up ? "+" : "-"}${abs}%`, tone: up ? "good" : "bad" };
}

export function moneyToneByDelta(deltaBaseMinor: string): DeltaTone {
  try {
    const v = BigInt(String(deltaBaseMinor ?? "0").trim() || "0");
    if (v > 0n) return "good";
    if (v < 0n) return "bad";
    return "neutral";
  } catch {
    return "neutral";
  }
}