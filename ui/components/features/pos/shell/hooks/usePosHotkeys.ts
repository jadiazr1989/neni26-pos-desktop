"use client";

import { useEffect, useRef } from "react";

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;

  if (el.closest?.('[contenteditable="true"]')) return true;

  const tag = (el.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;

  return el.closest?.("input, textarea, select, [contenteditable='true']") != null;
}

function hasOpenDialog(): boolean {
  return Boolean(
    document.querySelector(
      '[role="dialog"][aria-modal="true"], [role="dialog"][data-state="open"]'
    )
  );
}

export function usePosHotkeys(args: {
  enabled: boolean;
  canPay: () => boolean;
  onPay: () => void;
  onOpenMenu: () => void;
}) {
  const enabledRef = useRef(args.enabled);
  const canPayRef = useRef(args.canPay);
  const onPayRef = useRef(args.onPay);
  const onOpenMenuRef = useRef(args.onOpenMenu);

  useEffect(() => {
    enabledRef.current = args.enabled;
  }, [args.enabled]);

  useEffect(() => {
    canPayRef.current = args.canPay;
  }, [args.canPay]);

  useEffect(() => {
    onPayRef.current = args.onPay;
  }, [args.onPay]);

  useEffect(() => {
    onOpenMenuRef.current = args.onOpenMenu;
  }, [args.onOpenMenu]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!enabledRef.current) return;
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      if (hasOpenDialog()) return;

      if (e.key === "Enter") {
        e.preventDefault();
        if (canPayRef.current()) onPayRef.current();
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        onOpenMenuRef.current();
      }
    };

    window.addEventListener("keydown", onKey, { capture: true });
    return () =>
      window.removeEventListener(
        "keydown",
        onKey,
        { capture: true } as unknown as boolean
      );
  }, []);
}
