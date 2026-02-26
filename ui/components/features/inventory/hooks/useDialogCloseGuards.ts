"use client";

import * as React from "react";

type Args = {
  open: boolean;
  isBusy: boolean;
  isDirty: boolean;
  onClose: () => void;
  onRefocus?: () => void;
};

function prevent(e: unknown) {
  if (!e) return;
  // Radix events tienen preventDefault, pero tipa raro según versión
  if (typeof (e as { preventDefault?: () => void }).preventDefault === "function") {
    (e as { preventDefault: () => void }).preventDefault();
  }
}

export function useDialogCloseGuards(args: Args) {
  const { open, isBusy, isDirty, onClose, onRefocus } = args;

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const pendingCloseRef = React.useRef(false);

  const requestClose = React.useCallback(() => {
    if (!open) return;
    if (isBusy) return;

    if (isDirty) {
      pendingCloseRef.current = true;
      setConfirmOpen(true);
      return;
    }

    onClose();
  }, [open, isBusy, isDirty, onClose]);

  const onDialogOpenChange = React.useCallback(
    (v: boolean) => {
      if (v) return;
      requestClose();
    },
    [requestClose]
  );

  const onEscapeKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (isBusy) {
        prevent(e);
        return;
      }
      if (isDirty) {
        prevent(e);
        requestClose();
      }
    },
    [isBusy, isDirty, requestClose]
  );

  const onPointerDownOutside = React.useCallback(
    (e: Event) => {
      if (isBusy) {
        prevent(e);
        return;
      }
      if (isDirty) {
        prevent(e);
        requestClose();
      }
    },
    [isBusy, isDirty, requestClose]
  );

  const onInteractOutside = React.useCallback(
    (e: Event) => {
      if (isBusy) prevent(e);
    },
    [isBusy]
  );

  const onConfirmKeepEditing = React.useCallback(() => {
    pendingCloseRef.current = false;
    setConfirmOpen(false);
    onRefocus?.();
  }, [onRefocus]);

  const onConfirmDiscard = React.useCallback(() => {
    setConfirmOpen(false);
    if (pendingCloseRef.current) {
      pendingCloseRef.current = false;
      onClose();
    }
  }, [onClose]);

  const setConfirmOpenSafe = React.useCallback(
    (v: boolean) => {
      if (isBusy) return;
      setConfirmOpen(v);
    },
    [isBusy]
  );

  return {
    confirmOpen,
    setConfirmOpenSafe,
    requestClose,
    onDialogOpenChange,
    onEscapeKeyDown,
    onPointerDownOutside,
    onInteractOutside,
    onConfirmKeepEditing,
    onConfirmDiscard,
  };
}