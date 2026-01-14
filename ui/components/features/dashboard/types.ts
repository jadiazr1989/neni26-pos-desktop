export type ApiStatus = "unknown" | "online" | "offline";
export type Tone = "muted" | "success" | "warning" | "danger";

export type StationStatus = {
  label: string;
  tone: Tone;
};

export type ActionId = "newSale" | "returns" | "catalog" | "cash";
