// src/lib/hotkeys.ts

export type HotkeyCode =
  | "Enter"
  | "Escape"
  | "F2"
  | "F4"
  | "F6"
  | "F7"
  | "F8"
  | "Delete";

export const HOTKEY_TEXT: Record<HotkeyCode, string> = {
  Enter: "Enter",
  Escape: "Esc",
  F2: "F2",
  F4: "F4",
  F6: "F6",
  F7: "F7",
  F8: "F8",
  Delete: "Del",
};

// ✅ what you want to SHOW by default (icon-like)
export const HOTKEY_GLYPH: Partial<Record<HotkeyCode, string>> = {
  Enter: "↵",
  Escape: "⎋",
  // choose one:
  Delete: "⌫", // or comment this and it will fallback to "Del"
};