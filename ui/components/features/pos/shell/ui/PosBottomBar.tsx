// src/.../ui/PosBottomBar.tsx
"use client";

import { cn } from "@/lib/utils";
import type { JSX } from "react";
import { useCallback, useRef } from "react";

import { usePosHotkeys } from "../hooks/usePosHotkeys";
import { PayButton } from "./PayButton";
import { PosCenterInfoBar } from "./PosCenterInfoBar";
import { PosLeftStatusPanel } from "./PosLeftStatusPanel";
import { PosMoreMenu, type PosMoreMenuHandle } from "./PosMoreMenu";

type Role = "ADMIN" | "MANAGER" | "CASHIER";

export function PosBottomBar(props: {
  className?: string;
  role: Role;

  offline: boolean;
  cashOpen: boolean;

  itemsCount: number;
  totalMinor: number;
  paying: boolean;
  payDisabled: boolean;

  onPay: () => void;
  onCancelSale: () => void;
  onHoldSale: () => void;
  onNote: () => void;
  onCustomer: () => void;
}): JSX.Element {
  const menuRef = useRef<PosMoreMenuHandle>(null);

  const canPay = useCallback(() => !props.payDisabled && !props.paying, [props.payDisabled, props.paying]);

  const openMenu = useCallback(() => {
    menuRef.current?.open();
  }, []);

  usePosHotkeys({
    enabled: true,
    canPay,
    onPay: props.onPay,
    onOpenMenu: openMenu,
  });

  return (
    <div
      className={cn(
        "bg-card/95 backdrop-blur",
        "shadow-[0_-10px_24px_-18px_rgba(0,0,0,0.35)]",
        props.className
      )}
    >
      {/* ✅ grid column widths: left fixed, center fluid, right fixed */}
      <div className="grid" style={{ gridTemplateColumns: "260px 1fr 400px" }}>
        {/* LEFT */}
        <div className="px-4 py-2 flex items-center bg-emerald-200/60">
          <PosLeftStatusPanel cashOpen={props.cashOpen} />
        </div>

        {/* CENTER */}
        <PosCenterInfoBar />

        {/* RIGHT (never moves) */}
        <div className="px-4 py-3 flex justify-end shrink-0">
          {/* ✅ fixed slot so buttons always stay in the same place */}
          <div className="w-[360px] flex items-center justify-end gap-3 whitespace-nowrap">
            <PayButton
              paying={props.paying}
              disabled={props.payDisabled}
              onPay={props.onPay}
              className="h-12 w-[190px]"
              label="CHEQUEAR"
              showHotkey={false}
            />

            <PosMoreMenu
              ref={menuRef}
              tone="amber"
              onHold={props.onHoldSale}
              onNote={props.onNote}
              onCustomer={props.onCustomer}
              onCancel={props.onCancelSale}
              showHotkeysHint={true}
              className="h-12 w-[150px]"
              label="Opciones"
            
            />
          </div>
        </div>
      </div>
    </div>
  );
}